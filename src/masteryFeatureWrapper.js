import app from './subscribeWrapper.js';
import { getMasteryCharter, signMasteryCharter } from './masteryCharterApi.js';
import { enhanceMasteryExperience } from './masteryExperience.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});

function masteryIsOpen(env) {
  return String(env?.MASTERY_LAUNCH_MODE || '').toLowerCase() === 'open';
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ''));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function cookieValue(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

async function masteryTestAuthorized(request, env) {
  const secret = String(env?.MASTERY_TEST_KEY || '');
  if (!secret) return false;
  const presented = cookieValue(request, 'flex_mastery_test');
  if (!presented) return false;
  return presented === await sha256Hex(secret);
}

function masteryTestPage(configured) {
  const status = configured
    ? '<p class="muted">Enter the private Mastery test key to open a one-hour test session on this device.</p>'
    : '<p class="error">Private Mastery testing is not configured yet.</p>';
  const form = configured
    ? '<form method="post" action="/mastery-test/access"><input name="key" type="password" autocomplete="current-password" required placeholder="Private test key"><button type="submit">OPEN PRIVATE MASTERY TEST →</button></form>'
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><title>Private Mastery Test — The Flex Standard</title><style>body{margin:0;background:#070707;color:#fff;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}.card{width:min(560px,calc(100% - 32px));background:#141414;border:1px solid #2a2a2a;border-radius:22px;padding:28px;text-align:center}.gold{color:#d4af37;font-weight:900;letter-spacing:.08em}h1{margin:.5rem 0}.muted{color:#aaa}.error{color:#ff9a9a}form{display:grid;gap:12px;margin-top:18px}input{width:100%;box-sizing:border-box;background:#0d0d0d;border:1px solid #333;border-radius:12px;color:#fff;padding:13px;font:inherit;text-align:center}button{border:0;border-radius:999px;padding:13px 16px;background:#d4af37;color:#080808;font:inherit;font-weight:900;cursor:pointer}</style></head><body><main class="card"><div class="gold">THE FLEX STANDARD · PRIVATE QA</div><h1>Mastery Test Access</h1>${status}${form}</main></body></html>`;
}

async function handleMasteryTestAccess(request, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const secret = String(env?.MASTERY_TEST_KEY || '');
  if (!secret) return new Response('Private Mastery testing is not configured.', { status: 503 });
  let form;
  try { form = await request.formData(); } catch { return new Response('Invalid request.', { status: 400 }); }
  const key = String(form.get('key') || '');
  if (!key || key !== secret) {
    return new Response('Invalid private test key.', { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  const token = await sha256Hex(secret);
  return new Response(null, {
    status: 303,
    headers: {
      location: '/challenges/28-day',
      'set-cookie': `flex_mastery_test=${token}; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Strict`,
      'cache-control': 'no-store',
    },
  });
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

async function enhanceMasteryPage(response) {
  if (!response.ok) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  const source = await response.text();
  const enhanced = enhanceMasteryExperience(source);
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(enhanced, { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    if (request.method === 'GET' && path === '/mastery-test') {
      return new Response(masteryTestPage(Boolean(env?.MASTERY_TEST_KEY)), {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
    if (path === '/mastery-test/access') {
      return handleMasteryTestAccess(request, env);
    }

    const testAuthorized = await masteryTestAuthorized(request, env);
    const effectiveEnv = testAuthorized ? { ...env, MASTERY_LAUNCH_MODE: 'open' } : env;

    if (path === '/api/mastery/charter') {
      return handleCharter(request, effectiveEnv);
    }

    if (request.method === 'POST' && path === '/api/mastery/action') {
      const cloned = request.clone();
      const body = await readJson(cloned);
      const response = await app.fetch(request, effectiveEnv, ctx);
      if (response.ok && body) {
        const userId = masteryUserId(cloned, body);
        try { await persistExecuteTier(effectiveEnv, { ...body, user_id: userId }); }
        catch (error) { console.error('mastery_tier_persist_failed', error); }
      }
      return response;
    }

    if (request.method === 'GET' && path === '/api/mastery/dashboard') {
      const response = await app.fetch(request, effectiveEnv, ctx);
      return augmentDashboardTier(response, effectiveEnv, request);
    }

    const response = await app.fetch(request, effectiveEnv, ctx);
    if (request.method === 'GET' && (path === '/challenges/28-day' || path === '/mastery')) {
      return enhanceMasteryPage(response);
    }
    return response;
  },
};
