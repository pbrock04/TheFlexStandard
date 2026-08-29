import { FLEX_EVENTS, FLEX_TIERS, normalizeLifecycleEvent } from './eventTaxonomy.js';

function cleanText(value, max = 100) { return String(value || '').trim().slice(0, max); }
function cleanEmail(value) { return String(value || '').trim().toLowerCase().slice(0, 254); }
export function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail(email)); }

export async function recordLifecycleEvent(db, input) {
  const event = normalizeLifecycleEvent(input);
  const metadataJson = JSON.stringify(event.metadata || {});
  await db.prepare(`INSERT OR IGNORE INTO lifecycle_events (event_id,event_name,user_id,tier_id,lead_source,occurred_at,metadata_json,created_at) VALUES (?,?,?,?,?,?,?,?)`)
    .bind(event.event_id, event.event_name, event.user_id, event.tier_id, event.lead_source, event.occurred_at, metadataJson, Date.now()).run();
  return event;
}

function snapshotFoundationDay(input) {
  const raw = input?.progress_snapshot?.foundation_day;
  return Math.max(0, Math.min(7, Math.floor(Number(raw) || 0)));
}

async function importFoundationSnapshot(db, userId, day, now) {
  if (!day) return;
  const completed = day >= 7;
  await db.prepare(`UPDATE participant_tiers SET current_day=MAX(current_day,?),status=CASE WHEN ? THEN 'completed' ELSE status END,completed_at=CASE WHEN ? THEN COALESCE(completed_at,?) ELSE completed_at END,updated_at=? WHERE user_id=? AND tier_id=?`)
    .bind(day, completed ? 1 : 0, completed ? 1 : 0, now, now, userId, FLEX_TIERS.FOUNDATION).run();

  if (completed) {
    await db.prepare(`INSERT INTO participant_tiers (user_id,tier_id,status,current_day,unlocked_at,completed_at,updated_at) VALUES (?,?,'unlocked',0,?,NULL,?) ON CONFLICT(user_id,tier_id) DO UPDATE SET status=CASE WHEN participant_tiers.status='completed' THEN 'completed' ELSE 'unlocked' END,unlocked_at=COALESCE(participant_tiers.unlocked_at,excluded.unlocked_at),updated_at=excluded.updated_at`)
      .bind(userId, FLEX_TIERS.MOMENTUM, now, now).run();
  }

  // Historical anonymous progress is imported without replaying Day 3/completion email events.
  // lead_captured remains the single immediate lifecycle event for a new opt-in.
}

export async function createOrResumeParticipant(db, input = {}) {
  const email = cleanEmail(input.email);
  if (!validEmail(email)) throw new Error('Please enter a valid email.');
  const name = cleanText(input.name, 100) || null;
  const leadSource = cleanText(input.lead_source || 'website', 100) || 'website';
  const now = Date.now();
  const foundationDay = snapshotFoundationDay(input);

  const existing = await db.prepare('SELECT user_id,email,name,lead_source FROM participants WHERE email = ?').bind(email).first();
  const userId = existing?.user_id || crypto.randomUUID();

  await db.prepare(`INSERT INTO participants (user_id,email,name,lead_source,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET name=COALESCE(excluded.name,participants.name),lead_source=participants.lead_source,updated_at=excluded.updated_at`)
    .bind(userId, email, name, leadSource, now, now).run();
  await db.prepare(`INSERT INTO participant_tiers (user_id,tier_id,status,current_day,unlocked_at,completed_at,updated_at) VALUES (?,?,'unlocked',0,?,NULL,?) ON CONFLICT(user_id,tier_id) DO NOTHING`)
    .bind(userId, FLEX_TIERS.FOUNDATION, now, now).run();

  await importFoundationSnapshot(db, userId, foundationDay, now);

  if (!existing) {
    await recordLifecycleEvent(db, { event_id: `lead_captured:${userId}`, event_name: FLEX_EVENTS.LEAD_CAPTURED, user_id: userId, tier_id: FLEX_TIERS.FOUNDATION, lead_source: leadSource, occurred_at: now, metadata: { imported_foundation_day: foundationDay } });
  }

  return { user_id: userId, email, name: name || existing?.name || null, foundation_unlocked: true, imported_foundation_day: foundationDay, is_new: !existing };
}

export async function recordChallengeProgress(db, { user_id, tier_id, current_day }) {
  const userId = cleanText(user_id, 128);
  if (!userId) throw new Error('user_id is required.');
  if (!Object.values(FLEX_TIERS).includes(tier_id)) throw new Error('Unsupported tier.');
  const day = Math.max(0, Math.floor(Number(current_day) || 0));
  const maxDay = tier_id === FLEX_TIERS.FOUNDATION ? 7 : tier_id === FLEX_TIERS.MOMENTUM ? 14 : tier_id === FLEX_TIERS.HABIT_LOCK ? 21 : 28;
  if (day > maxDay) throw new Error('Day is outside this tier.');
  const now = Date.now();
  const state = await db.prepare('SELECT status,current_day FROM participant_tiers WHERE user_id=? AND tier_id=?').bind(userId, tier_id).first();
  if (!state || state.status === 'locked') throw new Error('This tier is not unlocked.');
  const effectiveDay = Math.max(Number(state.current_day || 0), day);
  await db.prepare(`UPDATE participant_tiers SET current_day=?,updated_at=? WHERE user_id=? AND tier_id=?`).bind(effectiveDay, now, userId, tier_id).run();

  if (tier_id === FLEX_TIERS.FOUNDATION && effectiveDay >= 3) {
    await recordLifecycleEvent(db, { event_id: `foundation_day_3_reached:${userId}`, event_name: FLEX_EVENTS.FOUNDATION_DAY_3_REACHED, user_id: userId, tier_id, occurred_at: now });
  }

  const completionMap = {
    [FLEX_TIERS.FOUNDATION]: [7, FLEX_EVENTS.FOUNDATION_COMPLETED, FLEX_TIERS.MOMENTUM],
    [FLEX_TIERS.MOMENTUM]: [14, FLEX_EVENTS.MOMENTUM_COMPLETED, FLEX_TIERS.HABIT_LOCK],
    [FLEX_TIERS.HABIT_LOCK]: [21, FLEX_EVENTS.HABIT_LOCK_COMPLETED, null],
    [FLEX_TIERS.MASTERY]: [28, FLEX_EVENTS.MASTERY_COMPLETED, null],
  };
  const [completionDay, completionEvent, nextTier] = completionMap[tier_id];
  let masteryEligible = false;
  if (effectiveDay >= completionDay) {
    await db.prepare(`UPDATE participant_tiers SET status='completed',completed_at=COALESCE(completed_at,?),updated_at=? WHERE user_id=? AND tier_id=?`).bind(now, now, userId, tier_id).run();
    await recordLifecycleEvent(db, { event_id: `${completionEvent}:${userId}`, event_name: completionEvent, user_id: userId, tier_id, occurred_at: now });
    if (nextTier) {
      await db.prepare(`INSERT INTO participant_tiers (user_id,tier_id,status,current_day,unlocked_at,completed_at,updated_at) VALUES (?,?,'unlocked',0,?,NULL,?) ON CONFLICT(user_id,tier_id) DO UPDATE SET status=CASE WHEN participant_tiers.status='completed' THEN 'completed' ELSE 'unlocked' END,unlocked_at=COALESCE(participant_tiers.unlocked_at,excluded.unlocked_at),updated_at=excluded.updated_at`)
        .bind(userId, nextTier, now, now).run();
    }
    masteryEligible = tier_id === FLEX_TIERS.HABIT_LOCK;
  }
  return { user_id: userId, tier_id, current_day: effectiveDay, completed: effectiveDay >= completionDay, next_tier: nextTier, mastery_eligible: masteryEligible };
}

export async function getParticipantState(db, userIdInput) {
  const userId = cleanText(userIdInput, 128);
  if (!userId) throw new Error('user_id is required.');
  const participant = await db.prepare('SELECT user_id,email,name,lead_source,created_at,updated_at FROM participants WHERE user_id=?').bind(userId).first();
  if (!participant) return null;
  const tiers = await db.prepare('SELECT tier_id,status,current_day,unlocked_at,completed_at,updated_at FROM participant_tiers WHERE user_id=? ORDER BY unlocked_at').bind(userId).all();
  return { participant, tiers: tiers?.results || [] };
}
