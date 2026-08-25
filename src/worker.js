import app from './index.js';
import { challenge14Page } from './challenge14.js';
import { challenge21Page } from './challenge21.js';
import { challenge28Page } from './challenge28.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' }
});

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
    return json({ ok: true });
  } catch (e) {
    console.error('optional_lead_save_failed', e);
    return json({ ok: false, error: 'We could not save your information right now. You can still continue.' }, 500);
  }
}

function enhanceChallenge(html) {
  const oldActions = `<div class="completion-actions"><a href="/">RETURN HOME</a><span>14-Day Momentum is your next step.</span></div>`;
  const newActions = `<div class="optional-lead"><div class="optional-kicker">OPTIONAL</div><h3>Want to stay connected?</h3><p class="optional-copy">You already earned the 14-Day Challenge by completing Day 7. Saving your info is optional and does not affect access.</p><form id="optionalLeadForm" novalidate><div class="lead-fields"><label>Name <span>(optional)</span><input id="leadName" name="name" type="text" maxlength="100" autocomplete="name" placeholder="Your name"></label><label>Email <span>(required only to save)</span><input id="leadEmail" name="email" type="email" maxlength="254" autocomplete="email" placeholder="you@example.com"></label></div><div class="lead-actions"><button id="saveLeadBtn" type="submit">SAVE & CONTINUE</button><a id="skipLeadBtn" class="skip-btn" href="/challenges/14-day-get-active">SKIP FOR NOW — CONTINUE</a></div><div id="leadStatus" class="lead-status" aria-live="polite"></div></form></div>`;
  html = html.replace(oldActions, newActions);
  const extraCss = `.optional-lead{margin:1.8rem auto 0;max-width:650px;border-top:1px solid var(--border);padding-top:1.6rem}.optional-kicker{color:var(--gold);font-size:.7rem;font-weight:900;letter-spacing:.16em}.optional-lead h3{font-size:1.35rem;margin:.35rem 0}.optional-copy{margin:.35rem auto 1.15rem!important}.lead-fields{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;text-align:left}.lead-fields label{font-size:.78rem;font-weight:800;color:var(--text)}.lead-fields label span{color:#777;font-weight:600}.lead-fields input{width:100%;margin-top:.4rem;background:#0c0c0c;border:1px solid var(--border);border-radius:12px;color:var(--text);padding:.8rem .9rem;font:inherit;outline:none}.lead-actions{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap;margin-top:1rem}.lead-actions button,.lead-actions a{border-radius:999px;padding:.78rem 1rem;font:inherit;font-weight:900;cursor:pointer;text-decoration:none}.lead-actions button{border:0;background:var(--gold);color:#090909}.lead-actions .skip-btn{background:transparent;border:1px solid #343434;color:var(--text)}.lead-status{min-height:1.4em;margin-top:.7rem;color:var(--muted);font-size:.82rem}.lead-status.error{color:#ef9a9a}@media(max-width:620px){.lead-fields{grid-template-columns:1fr}.lead-actions{flex-direction:column}.lead-actions button,.lead-actions a{width:100%}}`;
  html = html.replace('</style>', extraCss + '</style>');
  const extraJs = `\nconst leadForm=document.getElementById('optionalLeadForm');if(leadForm){const statusEl=document.getElementById('leadStatus'),saveBtn=document.getElementById('saveLeadBtn');leadForm.addEventListener('submit',async e=>{e.preventDefault();statusEl.classList.remove('error');const name=document.getElementById('leadName').value.trim(),email=document.getElementById('leadEmail').value.trim();if(!email){statusEl.textContent='Enter an email to save, or choose Skip for now.';statusEl.classList.add('error');return}saveBtn.disabled=true;saveBtn.textContent='SAVING…';try{const res=await fetch('/api/optional-lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,email})});const data=await res.json();if(!res.ok||!data.ok)throw new Error(data.error||'Unable to save.');localStorage.setItem('flexStandard.profile.v1',JSON.stringify({name,email}));location.href='/challenges/14-day-get-active'}catch(err){statusEl.textContent=(err&&err.message)||'We could not save your information. You can still skip and continue.';statusEl.classList.add('error');saveBtn.disabled=false;saveBtn.textContent='SAVE & CONTINUE'}})}\n`;
  return html.replace('</script>', extraJs + '</script>');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/$/, '') || '/';
    if (request.method === 'POST' && p === '/api/optional-lead') return saveOptionalLead(request, env);
    if (request.method === 'GET' && p === '/momentum') return new Response(challenge14Page(), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (request.method === 'GET' && p === '/challenges/14-day-get-active') return new Response(challenge14Page(), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (request.method === 'GET' && p === '/challenges/21-day-consistency') return new Response(challenge21Page(), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (request.method === 'GET' && p === '/challenges/28-day-mastery') return new Response(challenge28Page(), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
    const response = await app.fetch(request, env, ctx);
    if (request.method !== 'GET' || p !== '/challenge') return response;
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return response;
    const html = enhanceChallenge(await response.text());
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    return new Response(html, { status: response.status, headers });
  }
};
