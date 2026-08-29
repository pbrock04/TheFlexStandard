import {
  BASE_ACTION_XP,
  buildDailyXpSummary,
  calculateConsecutiveStreak,
  createXpKey,
  evaluateMasteryAchievements,
  getMasteryLevel,
  getMasteryWeek,
} from './masteryLogic.js';

function nowMs(now) {
  const value = Number(now ?? Date.now());
  return Number.isFinite(value) ? Math.floor(value) : Date.now();
}

function asJson(value) {
  return value == null ? null : JSON.stringify(value);
}

export function validateMasteryDay(day) {
  const value = Number(day);
  if (!Number.isInteger(value) || value < 1 || value > 28) {
    throw new Error('mastery_day must be an integer from 1 through 28');
  }
  return value;
}

export function validateActionType(actionType) {
  const value = String(actionType ?? '').trim().toLowerCase();
  const allowed = new Set(['focus', 'learn', 'execute', 'excel', 'flex_plus', 'mission', 'reflection', 'comeback', 'event']);
  if (!allowed.has(value)) throw new Error('invalid mastery action type');
  return value;
}

export function xpForAction(actionType) {
  const type = validateActionType(actionType);
  if (type === 'mission' || type === 'reflection' || type === 'event') return 0;
  return BASE_ACTION_XP[type] ?? 0;
}

export async function ensureMasteryProfile(db, userId, setup = {}, now = Date.now()) {
  const user = String(userId ?? '').trim();
  if (!user) throw new Error('user_id is required');
  const timestamp = nowMs(now);

  await db.prepare(`
    INSERT INTO mastery_profiles (
      user_id, primary_goal, daily_time_minutes, preferred_activity,
      available_equipment, preferred_days, consistency_obstacle,
      non_fitness_focus, current_day, started_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      primary_goal = COALESCE(excluded.primary_goal, mastery_profiles.primary_goal),
      daily_time_minutes = COALESCE(excluded.daily_time_minutes, mastery_profiles.daily_time_minutes),
      preferred_activity = COALESCE(excluded.preferred_activity, mastery_profiles.preferred_activity),
      available_equipment = COALESCE(excluded.available_equipment, mastery_profiles.available_equipment),
      preferred_days = COALESCE(excluded.preferred_days, mastery_profiles.preferred_days),
      consistency_obstacle = COALESCE(excluded.consistency_obstacle, mastery_profiles.consistency_obstacle),
      non_fitness_focus = COALESCE(excluded.non_fitness_focus, mastery_profiles.non_fitness_focus),
      updated_at = excluded.updated_at
  `).bind(
    user,
    setup.primary_goal ?? null,
    Number.isFinite(Number(setup.daily_time_minutes)) ? Number(setup.daily_time_minutes) : null,
    setup.preferred_activity ?? null,
    asJson(setup.available_equipment),
    asJson(setup.preferred_days),
    setup.consistency_obstacle ?? null,
    setup.non_fitness_focus ?? null,
    timestamp,
    timestamp,
    timestamp,
  ).run();

  return getMasteryProfile(db, user);
}

export async function getMasteryProfile(db, userId) {
  const user = String(userId ?? '').trim();
  if (!user) throw new Error('user_id is required');
  return db.prepare('SELECT * FROM mastery_profiles WHERE user_id = ?').bind(user).first();
}

async function getCompletedStandardDays(db, userId) {
  const result = await db.prepare(`
    SELECT mastery_day
    FROM mastery_daily_actions
    WHERE user_id = ?
      AND action_type IN ('focus','learn','execute','excel')
    GROUP BY mastery_day
    HAVING COUNT(DISTINCT action_type) = 4
    ORDER BY mastery_day ASC
  `).bind(userId).all();
  return (result?.results ?? []).map((row) => Number(row.mastery_day));
}

async function isStandardMetForDay(db, userId, masteryDay) {
  const row = await db.prepare(`
    SELECT COUNT(DISTINCT action_type) AS core_count
    FROM mastery_daily_actions
    WHERE user_id = ? AND mastery_day = ?
      AND action_type IN ('focus','learn','execute','excel')
  `).bind(userId, masteryDay).first();
  return Number(row?.core_count ?? 0) === 4;
}

async function getComebackCount(db, userId) {
  const row = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM mastery_daily_actions
    WHERE user_id = ? AND action_type = 'comeback'
  `).bind(userId).first();
  return Number(row?.count ?? 0);
}

export async function syncMasteryAchievements(db, userId, currentDay, now = Date.now()) {
  const user = String(userId ?? '').trim();
  if (!user) throw new Error('user_id is required');
  const timestamp = nowMs(now);
  const [completedStandardDays, comebackCount] = await Promise.all([
    getCompletedStandardDays(db, user),
    getComebackCount(db, user),
  ]);

  const eligible = evaluateMasteryAchievements({ completedStandardDays, currentDay, comebackCount });
  for (const achievement of eligible) {
    await db.prepare(`
      INSERT OR IGNORE INTO mastery_achievements
        (user_id, achievement_key, unlocked_at, metadata_json)
      VALUES (?, ?, ?, ?)
    `).bind(user, achievement.key, timestamp, asJson({
      title: achievement.title,
      description: achievement.description,
    })).run();
  }

  return {
    completedStandardDays,
    streak: calculateConsecutiveStreak(completedStandardDays),
    eligible,
  };
}

export async function completeMasteryAction(db, {
  userId,
  day,
  actionKey,
  actionType,
  xp,
  metadata,
  now = Date.now(),
}) {
  const user = String(userId ?? '').trim();
  const key = String(actionKey ?? '').trim();
  if (!user || !key) throw new Error('user_id and action_key are required');

  const masteryDay = validateMasteryDay(day);
  const type = validateActionType(actionType);
  const timestamp = nowMs(now);
  const award = Number.isFinite(Number(xp)) ? Math.max(0, Math.floor(Number(xp))) : xpForAction(type);
  const sourceKey = `day-${masteryDay}-${key}`;

  const existing = await db.prepare(
    'SELECT id FROM mastery_daily_actions WHERE user_id = ? AND mastery_day = ? AND action_key = ?',
  ).bind(user, masteryDay, key).first();

  if (existing) {
    return { created: false, xpAwarded: 0, sourceKey, idempotencyKey: createXpKey({ userId: user, sourceType: 'daily_action', sourceId: sourceKey }) };
  }

  await db.prepare(`
    INSERT INTO mastery_daily_actions (user_id, mastery_day, action_key, action_type, completed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(user, masteryDay, key, type, timestamp, timestamp).run();

  if (award > 0) {
    await db.prepare(`
      INSERT OR IGNORE INTO mastery_xp_ledger
        (user_id, source_type, source_key, xp, mastery_day, metadata_json, awarded_at)
      VALUES (?, 'daily_action', ?, ?, ?, ?, ?)
    `).bind(user, sourceKey, award, masteryDay, asJson(metadata), timestamp).run();
  }

  const standardMet = await isStandardMetForDay(db, user, masteryDay);
  const nextDay = standardMet ? Math.min(28, masteryDay + 1) : masteryDay;
  const dayAdvanced = standardMet && masteryDay < 28;

  if (standardMet && masteryDay === 28) {
    await db.prepare(`
      UPDATE mastery_profiles
      SET current_day = 28,
          completed_at = COALESCE(completed_at, ?),
          updated_at = ?
      WHERE user_id = ?
    `).bind(timestamp, timestamp, user).run();
  } else if (dayAdvanced) {
    await db.prepare(`
      UPDATE mastery_profiles
      SET current_day = CASE WHEN current_day < ? THEN ? ELSE current_day END,
          updated_at = ?
      WHERE user_id = ?
    `).bind(nextDay, nextDay, timestamp, user).run();
  } else {
    await db.prepare('UPDATE mastery_profiles SET updated_at = ? WHERE user_id = ?').bind(timestamp, user).run();
  }

  const profile = await getMasteryProfile(db, user);
  await syncMasteryAchievements(db, user, Number(profile?.current_day || nextDay), timestamp);

  return {
    created: true,
    xpAwarded: award,
    sourceKey,
    standardMet,
    dayAdvanced,
    idempotencyKey: createXpKey({ userId: user, sourceType: 'daily_action', sourceId: sourceKey }),
  };
}

export async function getMasteryDashboard(db, userId) {
  const user = String(userId ?? '').trim();
  if (!user) throw new Error('user_id is required');

  const profile = await getMasteryProfile(db, user);
  if (!profile) return null;

  const day = validateMasteryDay(profile.current_day || 1);
  const progress = await syncMasteryAchievements(db, user, day);
  const [actionsResult, xpResult, achievementsResult] = await Promise.all([
    db.prepare('SELECT action_key, action_type, completed_at FROM mastery_daily_actions WHERE user_id = ? AND mastery_day = ? ORDER BY completed_at ASC').bind(user, day).all(),
    db.prepare('SELECT COALESCE(SUM(xp), 0) AS total_xp FROM mastery_xp_ledger WHERE user_id = ?').bind(user).first(),
    db.prepare('SELECT achievement_key, unlocked_at, metadata_json FROM mastery_achievements WHERE user_id = ? ORDER BY unlocked_at ASC').bind(user).all(),
  ]);

  const completedTypes = Object.fromEntries(
    (actionsResult?.results ?? []).map((row) => [row.action_type, true]),
  );
  const daily = buildDailyXpSummary(completedTypes);
  const totalXp = Number(xpResult?.total_xp ?? 0);

  return {
    profile,
    day,
    week: getMasteryWeek(day),
    level: getMasteryLevel(totalXp),
    progress: {
      completedStandardDays: progress.completedStandardDays,
      completedCount: progress.completedStandardDays.length,
      streak: progress.streak,
    },
    currentStreak: progress.streak,
    today: {
      ...daily,
      completedActions: actionsResult?.results ?? [],
    },
    achievements: achievementsResult?.results ?? [],
  };
}
