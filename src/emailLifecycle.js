import { FLEX_EVENTS } from './eventTaxonomy.js';

export const LAUNCH_EMAILS = Object.freeze({
  [FLEX_EVENTS.LEAD_CAPTURED]: {
    key: 'welcome_foundation',
    subject: 'Day 1 Starts Now — Your 7-Day Foundation',
    route: '/challenges/7-day',
    workbook: '/downloads/flex-7day-foundation-workbook.pdf',
  },
  [FLEX_EVENTS.FOUNDATION_COMPLETED]: {
    key: 'foundation_complete',
    subject: 'Foundation Secured. Step into the 14-Day Momentum.',
    route: '/challenges/14-day',
  },
  [FLEX_EVENTS.HABIT_LOCK_COMPLETED]: {
    key: 'habit_lock_complete',
    subject: 'The 28-Day Mastery: Your Final Milestone',
    route: '/challenges/28-day',
  },
});

export function launchEmailForEvent(eventName) {
  return LAUNCH_EMAILS[eventName] || null;
}

export function shouldSendLaunchEmail(eventName) {
  return Boolean(launchEmailForEvent(eventName));
}

export function buildLaunchEmailPayload({ eventName, participant, origin = 'https://theflexstandard.com' }) {
  const template = launchEmailForEvent(eventName);
  if (!template) return null;
  if (!participant?.email) return null;
  const base = String(origin || 'https://theflexstandard.com').replace(/\/$/, '');
  return {
    email_key: template.key,
    to: participant.email,
    subject: template.subject,
    route_url: base + template.route,
    workbook_url: template.workbook ? base + template.workbook : null,
  };
}

export async function enqueueLaunchEmail(db, { event, participant, origin }) {
  const payload = buildLaunchEmailPayload({ eventName: event?.event_name, participant, origin });
  if (!payload || !event?.event_id || !event?.user_id) return { queued: false };
  const now = Date.now();
  await db.prepare(`INSERT OR IGNORE INTO lifecycle_email_outbox
    (outbox_id,event_id,user_id,email_key,recipient_email,payload_json,status,attempt_count,created_at,updated_at)
    VALUES (?,?,?,?,?,?,'pending',0,?,?)`)
    .bind(
      `email:${event.event_id}`,
      event.event_id,
      event.user_id,
      payload.email_key,
      payload.to,
      JSON.stringify(payload),
      now,
      now,
    ).run();
  return { queued: true, payload };
}
