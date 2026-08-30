import app from './subscribeWrapper.js';
import { getMasteryCharter, signMasteryCharter } from './masteryCharterApi.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});

function masteryIsOpen(env) {
  return String(env?.MASTERY_LAUNCH_MODE || '').toLowerCase() === 'open';
}

function masteryUserId(request, body = null) {
  const url = new URL(request.url);
  return String(
    request.headers.get('x-flex-user-id') ||
    url.searchParams.get('user_id') ||
    body?.user_id ||
    ''
  ).trim().slice(0, 128);
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

function validTier(value) {
  const tier = String(value || 'standard').trim().toLowerCase();
  return ['express', 'standard', 'excel'].includes(tier) ? tier : 'standard';
}

async function handleCharter(request, env) {
  if (!masteryIsOpen(env)) {
    return json({ ok: false, error: '28-Day Mastery is not open for participant access yet.' }, 403);
  }
  if (!env.DB) return json({ ok: false, error: 'Mastery storage is unavailable.' }, 503);

  const body = request.method === 'POST' ? await readJson(request) : null;
  if (request.method === 'POST' && body == null) {
    return json({ ok: false, error: 'Invalid JSON request.' }, 400);
  }
  const userId = masteryUserId(request, body);
  if (!userId) return json({ ok: false, error: 'A Mastery participant ID is required.' }, 400);

  try {
    if (request.method === 'GET') {
      const charter = await getMasteryCharter(env.DB, userId);
      return json({ ok: true, charter: charter || null });
    }
    if (request.method === 'POST') {
      const charter = await signMasteryCharter(env.DB, userId, body || {});
      return json({ ok: true, message: 'Personal FLEX Charter established.', charter });
    }
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  } catch (error) {
    console.error('mastery_charter_api_failed', error);
    return json({ ok: false, error: error?.message || 'Mastery Charter request failed.' }, 400);
  }
}

async function persistExecuteTier(env, body) {
  if (!env.DB || String(body?.action_type || '').toLowerCase() !== 'execute') return;
  const userId = String(body?.user_id || '').trim().slice(0, 128);
  const day = Number(body?.day);
  const actionKey = String(body?.action_key || '').trim();
  if (!userId || !Number.isInteger(day) || day < 1 || day > 28 || !actionKey) return;

  await env.DB.prepare(`
    UPDATE mastery_daily_actions
    SET tier_selected = ?
    WHERE user_id = ? AND mastery_day = ? AND action_key = ? AND action_type = 'execute'
  `).bind(validTier(body?.tier_selected), userId, day, actionKey).run();
}

async function augmentDashboardTier(response, env, request) {
  if (!response.ok || !env.DB) return response;
  const data = await response.json().catch(() => null);
  if (!data?.ok || !data?.dashboard) return new Response(JSON.stringify(data || {}), response);

  const userId = masteryUserId(request);
  const day = Number(data.dashboard.day);
  if (userId && Number.isInteger(day)) {
    const row = await env.DB.prepare(`
      SELECT tier_selected
      FROM mastery_daily_actions
      WHERE user_id = ? AND mastery_day = ? AND action_type = 'execute'
      ORDER BY completed_at DESC
      LIMIT 1
    `).bind(userId, day).first();
    data.dashboard.today = data.dashboard.today || {};
    data.dashboard.today.tier_selected = row?.tier_selected || 'standard';
  }

  const headers = new Headers(response.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    if (path === '/api/mastery/charter') {
      return handleCharter(request, env);
    }

    if (request.method === 'POST' && path === '/api/mastery/action') {
      const cloned = request.clone();
      const body = await readJson(cloned);
      const response = await app.fetch(request, env, ctx);
      if (response.ok && body) {
        const userId = masteryUserId(cloned, body);
        try { await persistExecuteTier(env, { ...body, user_id: userId }); }
        catch (error) { console.error('mastery_tier_persist_failed', error); }
      }
      return response;
    }

    if (request.method === 'GET' && path === '/api/mastery/dashboard') {
      const response = await app.fetch(request, env, ctx);
      return augmentDashboardTier(response, env, request);
    }

    return app.fetch(request, env, ctx);
  },
};
