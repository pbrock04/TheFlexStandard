import app from './index.js';
import { challengeHubPage } from './challengeHub.js';
import { challenge14Page } from './challenge14.js';
import { challenge21Page } from './challenge21.js';
import { challenge28Page } from './challenge28.js';
import { ensureMasteryProfile, completeMasteryAction, getMasteryDashboard } from './masteryApi.js';
import { submitFlexProof, updateFlexProofSpotlightConsent } from './masteryProofApi.js';
import { participantRoute } from './participantRoutes.js';
import { enhanceFoundationParticipantFlow, enhanceMomentumParticipantFlow, enhanceHabitLockParticipantFlow } from './participantClientEnhancer.js';

const html = body => new Response(body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

function masteryIsOpen(env) {
  return String(env?.MASTERY_LAUNCH_MODE || '').toLowerCase() === 'open';
}

function masteryLockedPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><title>28-Day Mastery — Locked</title><style>body{margin:0;background:#070707;color:#fff;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}.card{width:min(620px,calc(100% - 32px));background:#141414;border:1px solid #2a2a2a;border-radius:22px;padding:30px;text-align:center}.gold{color:#d4af37;font-weight:900;letter-spacing:.08em}h1{font-size:clamp(2rem,8vw,3.5rem);margin:.5rem 0}.muted{color:#999}.btn{display:inline-block;margin-top:14px;background:#d4af37;color:#080808;text-decoration:none;font-weight:900;border-radius:999px;padding:12px 18px}</style></head><body><main class="card"><div class="gold">THE FLEX STANDARD · MASTERY</div><h1>28-Day Mastery is locked.</h1><p class="muted">Mastery is being prepared as the next step after the free challenge path. Your current challenges remain available while we finish the secure access layer.</p><a class="btn" href="/challenges">BACK TO CHALLENGES</a></main></body></html>`;
}

function cleanHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
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

async function masteryProofRoute(request, env, path) {
  if (!env.DB) return json({ ok: false, error: 'Mastery storage is unavailable.' }, 503);

  try {
    if (request.method === 'POST' && path === '/api/mastery/proof') {
      if (!env.MASTERY_PROOF) return json({ ok: false, error: 'FLEX Proof private storage is not configured yet.' }, 503);
      const form = await request.formData();
      const userId = masteryUserId(request, { user_id: form.get('user_id') });
      if (!userId) return json({ ok: false, error: 'A Mastery participant ID is required.' }, 400);
      await ensureMasteryProfile(env.DB, userId, {});
      const file = form.get('proof');
      const result = await submitFlexProof({
        db: env.DB,
        bucket: env.MASTERY_PROOF,
        userId,
        day: form.get('day'),
        file,
        caption: form.get('caption') || '',
        spotlightOptIn: String(form.get('spotlight_opt_in') || '').toLowerCase() === 'true',
      });
      const dashboard = await getMasteryDashboard(env.DB, userId);
      return json({ ok: true, result, dashboard });
    }

    if (request.method === 'POST' && path === '/api/mastery/proof/spotlight') {
      const body = await readJson(request);
      if (body == null) return json({ ok: false, error: 'Invalid JSON request.' }, 400);
      const userId = masteryUserId(request, body);
      if (!userId) return json({ ok: false, error: 'A Mastery participant ID is required.' }, 400);
      const result = await updateFlexProofSpotlightConsent({
        db: env.DB,
        userId,
        submissionId: body.submission_id,
        optedIn: Boolean(body.opted_in),
      });
      const dashboard = await getMasteryDashboard(env.DB, userId);
      return json({ ok: true, result, dashboard });
    }
  } catch (e) {
    console.error('mastery_proof_api_failed', e);
    return json({ ok: false, error: e?.message || 'FLEX Proof request failed.' }, 400);
  }

  return null;
}

async function masteryRoute(request, env, path) {
  if (!env.DB) return json({ ok: false, error: 'Mastery storage is unavailable.' }, 503);
  const body = request.method === 'POST' ? await readJson(request) : null;
  if (request.method === 'POST' && body == null) return json({ ok: false, error: 'Invalid JSON request.' }, 400);
  const userId = masteryUserId(request, body);
  if (!userId) return json({ ok: false, error: 'A Mastery participant ID is required.' }, 400);

  try {
    if (request.method === 'POST' && path === '/api/mastery/setup') {
      const profile = await ensureMasteryProfile(env.DB, userId, body?.setup || body || {});
      return json({ ok: true, profile });
    }
    if (request.method === 'POST' && path === '/api/mastery/action') {
      await ensureMasteryProfile(env.DB, userId, {});
      const result = await completeMasteryAction(env.DB, {
        userId,
        day: body?.day,
        actionKey: body?.action_key,
        actionType: body?.action_type,
        metadata: body?.metadata,
      });
      const dashboard = await getMasteryDashboard(env.DB, userId);
      return json({ ok: true, result, dashboard });
    }
    if (request.method === 'GET' && path === '/api/mastery/dashboard') {
      const dashboard = await getMasteryDashboard(env.DB, userId);
      if (!dashboard) return json({ ok: false, error: 'Mastery profile not found.' }, 404);
      return json({ ok: true, dashboard });
    }
  } catch (e) {
    console.error('mastery_api_failed', e);
    return json({ ok: false, error: e?.message || 'Mastery request failed.' }, 400);
  }
  return null;
}

async function notifyOptionalLead(env, { name, email, now }) {
  if (!env.PARTICIPANT_NOTIFY) return;
  const safeName = cleanHeader(name) || 'Not provided';
  const safeEmail = cleanHeader(email);
  const timestamp = new Date(now).toISOString();
  const subject = 'Flex Standard: 7-Day participant continued';
  const body = [
    'A participant completed the 7-Day Foundation and chose Save & Continue.', '',
    `Name: ${safeName}`, `Email: ${safeEmail}`, 'Next challenge: 14-Day Momentum',
    `Time: ${timestamp}`, '',
    'This notification contains private participant information. Do not forward or share it unnecessarily.'
  ].join('\r\n');
  const raw = [
    'From: The Flex Standard <flex@theflexstandard.com>', 'To: pbrock04@gmail.com',
    `Subject: ${subject}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit', '', body
  ].join('\r\n');
  const message = new EmailMessage('flex@theflexstandard.com', 'pbrock04@gmail.com', raw);
  await env.PARTICIPANT_NOTIFY.send(message);
}

async function saveOptionalLead(request, env) {
  if (!env.DB) return json({ ok: false, error: 'Lead storage is unavailable.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
  const name = String(body?.name || '').trim().slice(0, 100);
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Please enter a valid email or choose Skip for now.' }, 400);
  const now = Date.now();
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS optional_leads (id TEXT PRIMARY KEY,name TEXT,email TEXT NOT NULL UNIQUE,source TEXT NOT NULL DEFAULT '7-day-completion',created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL)`).run();
    await env.DB.prepare(`INSERT INTO optional_leads (id,name,email,source,created_at,updated_at) VALUES (?,?,?,'7-day-completion',?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at`).bind(crypto.randomUUID(), name || null, email, now, now).run();
    try { await notifyOptionalLead(env, { name, email, now }); } catch (e) { console.error('optional_lead_notification_failed', e); }
    return json({ ok: true });
  } catch (e) {
    console.error('optional_lead_save_failed', e);
    return json({ ok: false, error: 'We could not save your information right now. You can still continue.' }, 500);
  }
}

async function sevenDayResponse(request, env, ctx) {
  const url = new URL(request.url); url.pathname = '/challenge';
  const response = await app.fetch(new Request(url.toString(), request), env, ctx);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  const source = enhanceFoundationParticipantFlow(await response.text());
  const headers = new Headers(response.headers); headers.set('content-type', 'text/html; charset=utf-8');
  return new Response(source, { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/$/, '') || '/';

    if (p.startsWith('/api/participants/')) {
      const response = await participantRoute(request, env, p);
      if (response) return response;
    }

    if (p.startsWith('/api/mastery/') && !masteryIsOpen(env)) {
      return json({ ok: false, error: '28-Day Mastery is not open for participant access yet.' }, 403);
    }
    if (p === '/api/mastery/proof' || p === '/api/mastery/proof/spotlight') {
      const response = await masteryProofRoute(request, env, p);
      if (response) return response;
    }
    if (p.startsWith('/api/mastery/')) {
      const response = await masteryRoute(request, env, p);
      if (response) return response;
    }
    if (request.method === 'POST' && p === '/api/optional-lead') return saveOptionalLead(request, env);

    if (request.method === 'GET' && p === '/challenges') return html(challengeHubPage());
    if (request.method === 'GET' && (p === '/challenge' || p === '/challenges/7-day')) return sevenDayResponse(request, env, ctx);
    if (request.method === 'GET' && (p === '/momentum' || p === '/challenges/14-day' || p === '/challenges/14-day-get-active')) return html(enhanceMomentumParticipantFlow(challenge14Page()));
    if (request.method === 'GET' && (p === '/challenges/21-day' || p === '/challenges/21-day-consistency')) return html(enhanceHabitLockParticipantFlow(challenge21Page()));
    if (request.method === 'GET' && (p === '/challenges/28-day' || p === '/challenges/28-day-mastery')) {
      return masteryIsOpen(env) ? html(challenge28Page()) : html(masteryLockedPage());
    }

    return app.fetch(request, env, ctx);
  }
};
