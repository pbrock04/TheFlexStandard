import { createOrResumeParticipant, getParticipantState, recordChallengeProgress } from './participantLifecycle.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

export async function participantRoute(request, env, path) {
  if (!env.DB) return json({ ok: false, error: 'Participant storage is unavailable.' }, 503);

  try {
    if (request.method === 'POST' && path === '/api/participants/start') {
      const body = await readJson(request);
      if (body == null) return json({ ok: false, error: 'Invalid JSON request.' }, 400);
      const participant = await createOrResumeParticipant(env.DB, {
        name: body.name,
        email: body.email,
        lead_source: body.lead_source || 'website',
      });
      return json({ ok: true, participant }, participant.is_new ? 201 : 200);
    }

    if (request.method === 'POST' && path === '/api/participants/progress') {
      const body = await readJson(request);
      if (body == null) return json({ ok: false, error: 'Invalid JSON request.' }, 400);
      const progress = await recordChallengeProgress(env.DB, {
        user_id: body.user_id,
        tier_id: body.tier_id,
        current_day: body.current_day,
      });
      return json({ ok: true, progress });
    }

    if (request.method === 'GET' && path === '/api/participants/state') {
      const url = new URL(request.url);
      const userId = String(request.headers.get('x-flex-user-id') || url.searchParams.get('user_id') || '').trim().slice(0, 128);
      if (!userId) return json({ ok: false, error: 'user_id is required.' }, 400);
      const state = await getParticipantState(env.DB, userId);
      if (!state) return json({ ok: false, error: 'Participant not found.' }, 404);
      return json({ ok: true, state });
    }
  } catch (error) {
    console.error('participant_api_failed', error);
    return json({ ok: false, error: error?.message || 'Participant request failed.' }, 400);
  }

  return null;
}
