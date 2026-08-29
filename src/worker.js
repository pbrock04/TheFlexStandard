import app from './index.js';
import { challengeHubPage } from './challengeHub.js';
import { challenge14Page } from './challenge14.js';
import { challenge21Page } from './challenge21.js';
import { challenge28Page } from './challenge28.js';
import { healthDisclaimerPage, addGlobalLegal, addChallengeSafety } from './legal.js';
import { ensureMasteryProfile, completeMasteryAction, getMasteryDashboard } from './masteryApi.js';
import { submitFlexProof, updateFlexProofSpotlightConsent } from './masteryProofApi.js';

const html = body => new Response(addGlobalLegal(body), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
const challengeHtml = body => html(addChallengeSafety(body));
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

function enhanceChallenge(source) {
  const oldActions = `<div class="completion-actions"><a href="/">RETURN HOME</a><span>14-Day Momentum is your next step.</span></div>`;
  const newActions = `<div class="optional-lead"><div class="optional-kicker">OPTIONAL</div><h3>Want to stay connected?</h3><p class="optional-copy">You already earned the 14-Day Challenge by completing Day 7. Saving your info is optional and does not affect access.</p><form id="optionalLeadForm" novalidate><div class="lead-fields"><label>Name <span>(optional)</span><input id="leadName" name="name" type="text" maxlength="100" autocomplete="name" placeholder="Your name"></label><label>Email <span>(required only to save)</span><input id="leadEmail" name="email" type="email" maxlength="254" autocomplete="email" placeholder="you@example.com"></label></div><div class="lead-actions"><button id="saveLeadBtn" type="submit">SAVE & CONTINUE</button><a id="skipLeadBtn" class="skip-btn" href="/challenges/14-day">SKIP FOR NOW — CONTINUE</a></div><div id="leadStatus" class="lead-status" aria-live="polite"></div></form></div>`;
  source = source.replace(oldActions, newActions);
  const extraCss = `.optional-lead{margin:1.8rem auto 0;max-width:650px;border-top:1px solid var(--border);padding-top:1.6rem}.optional-kicker{color:var(--gold);font-size:.7rem;font-weight:900;letter-spacing:.16em}.optional-lead h3{font-size:1.35rem;margin:.35rem 0}.optional-copy{margin:.35rem auto 1.15rem!important}.lead-fields{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;text-align:left}.lead-fields label{font-size:.78rem;font-weight:800;color:var(--text)}.lead-fields label span{color:#777;font-weight:600}.lead-fields input{width:100%;margin-top:.4rem;background:#0c0c0c;border:1px solid var(--border);border-radius:12px;color:var(--text);padding:.8rem .9rem;font:inherit;outline:none}.lead-actions{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap;margin-top:1rem}.lead-actions button,.lead-actions a{border-radius:999px;padding:.78rem 1rem;font:inherit;font-weight:900;cursor:pointer;text-decoration:none}.lead-actions button{border:0;background:var(--gold);color:#090909}.lead-actions .skip-btn{background:transparent;border:1px solid #343434;color:var(--text)}.lead-status{min-height:1.4em;margin-top:.7rem;color:var(--muted);font-size:.82rem}.lead-status.error{color:#ef9a9a}@media(max-width:620px){.lead-fields{grid-template-columns:1fr}.lead-actions{flex-direction:column}.lead-actions button,.lead-actions a{width:100%}}`;
  source = source.replace('</style>', extraCss + '</style>');
  const extraJs = `\nconst leadForm=document.getElementById('optionalLeadForm');if(leadForm){const statusEl=document.getElementById('leadStatus'),saveBtn=document.getElementById('saveLeadBtn');leadForm.addEventListener('submit',async e=>{e.preventDefault();statusEl.classList.remove('error');const name=document.getElementById('leadName').value.trim(),email=document.getElementById('leadEmail').value.trim();if(!email){statusEl.textContent='Enter an email to save, or choose Skip for now.';statusEl.classList.add('error');return}saveBtn.disabled=true;saveBtn.textContent='SAVING…';try{const res=await fetch('/api/optional-lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,email})});const data=await res.json();if(!res.ok||!data.ok)throw new Error(data.error||'Unable to save.');localStorage.setItem('flexStandard.profile.v1',JSON.stringify({name,email}));location.href='/challenges/14-day'}catch(err){statusEl.textContent=(err&&err.message)||'We could not save your information. You can still skip and continue.';statusEl.classList.add('error');saveBtn.disabled=false;saveBtn.textContent='SAVE & CONTINUE'}})}\n`;
  return source.replace('</script>', extraJs + '</script>');
}

async function sevenDayResponse(request, env, ctx) {
  const url = new URL(request.url); url.pathname = '/challenge';
  const response = await app.fetch(new Request(url.toString(), request), env, ctx);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  const source = addGlobalLegal(addChallengeSafety(enhanceChallenge(await response.text())));
  const headers = new Headers(response.headers); headers.set('content-type', 'text/html; charset=utf-8');
  return new Response(source, { status: response.status, headers });
}

async function appResponseWithLegal(request, env, ctx) {
  const response = await app.fetch(request, env, ctx);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  const source = addGlobalLegal(await response.text());
  const headers = new Headers(response.headers); headers.set('content-type', 'text/html; charset=utf-8');
  return new Response(source, { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/$/, '') || '/';

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

    if (request.method === 'GET' && (p === '/health-disclaimer' || p === '/health-and-fitness-disclaimer')) return html(healthDisclaimerPage());
    if (request.method === 'GET' && p === '/challenges') return html(challengeHubPage());
    if (request.method === 'GET' && (p === '/challenge' || p === '/challenges/7-day')) return sevenDayResponse(request, env, ctx);
    if (request.method === 'GET' && (p === '/momentum' || p === '/challenges/14-day' || p === '/challenges/14-day-get-active')) return challengeHtml(challenge14Page());
    if (request.method === 'GET' && (p === '/challenges/21-day' || p === '/challenges/21-day-consistency')) return challengeHtml(challenge21Page());
    if (request.method === 'GET' && (p === '/challenges/28-day' || p === '/challenges/28-day-mastery')) {
      return masteryIsOpen(env) ? html(challenge28Page()) : html(masteryLockedPage());
    }

    return appResponseWithLegal(request, env, ctx);
  }
};
