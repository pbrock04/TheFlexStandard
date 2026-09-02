const VALID_MILESTONE_EVENTS = new Set([
  '7_day_foundation_completed',
  '14_day_momentum_completed',
  '21_day_habit_lock_completed',
]);

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});

export async function handleMilestoneComplete(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
  if (!env?.DB) return json({ ok: false, error: 'Milestone storage is unavailable.' }, 503);

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'Invalid JSON request.' }, 400); }

  const userId = typeof body?.user_id === 'string' ? body.user_id.trim().slice(0, 128) : '';
  const eventName = typeof body?.event_name === 'string' ? body.event_name.trim() : '';

  if (!userId) return json({ ok: false, error: 'user_id is required.' }, 400);
  if (!VALID_MILESTONE_EVENTS.has(eventName)) return json({ ok: false, error: 'Invalid event_name.' }, 400);

  try {
    await env.DB.prepare(`
      INSERT OR IGNORE INTO milestone_events (user_id, event_name, created_at)
      VALUES (?, ?, unixepoch())
    `).bind(userId, eventName).run();
    return json({ ok: true, event_name: eventName });
  } catch (error) {
    console.error('milestone_event_save_failed', error);
    return json({ ok: false, error: 'Unable to save milestone.' }, 500);
  }
}

export { VALID_MILESTONE_EVENTS };
