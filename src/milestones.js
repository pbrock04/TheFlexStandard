export const MILESTONE_EVENTS = new Set([
  '7_day_foundation_completed',
  '14_day_momentum_completed',
  '21_day_habit_lock_completed',
]);

function cleanUserId(value) {
  return String(value || '').trim().slice(0, 128);
}

export async function recordMilestone(env, { userId, eventName, completedAt = Date.now() }) {
  const id = cleanUserId(userId);
  if (!id) return { ok: false, status: 400, error: 'user_id_required' };
  if (!MILESTONE_EVENTS.has(eventName)) return { ok: false, status: 400, error: 'invalid_event' };
  if (!env?.DB?.prepare) return { ok: false, status: 503, error: 'database_unavailable' };

  const timestamp = Number.isFinite(Number(completedAt)) ? Math.trunc(Number(completedAt)) : Date.now();
  const result = await env.DB.prepare(
    `INSERT INTO milestone_events (user_id, event_name, completed_at, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, event_name) DO NOTHING`
  ).bind(id, eventName, timestamp, Date.now()).run();

  const changes = Number(result?.meta?.changes || 0);
  return { ok: true, status: changes > 0 ? 201 : 200, created: changes > 0, userId: id, eventName };
}

export async function handleMilestoneCompletion(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8', allow: 'POST' },
    });
  }

  let body;
  try { body = await request.json(); }
  catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const result = await recordMilestone(env, {
    userId: body?.user_id,
    eventName: body?.event_name,
    completedAt: body?.completed_at,
  });

  return new Response(JSON.stringify(result), {
    status: result.status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
