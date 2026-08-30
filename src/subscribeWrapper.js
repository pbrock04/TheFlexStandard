import worker from './worker.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' }
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHECKIN_TIMES = new Set(['09:00', '13:00', '18:00']);
const CHALLENGES = new Set(['foundation_7']);

function validTimezone(value) {
  try {
    if (!value || typeof value !== 'string' || value.length > 100) return false;
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

async function brevoFetch(env, path, options = {}) {
  if (!env.BREVO_API_KEY) throw new Error('BREVO_API_KEY is not configured.');
  return fetch(`https://api.brevo.com/v3${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': env.BREVO_API_KEY,
      ...(options.headers || {})
    }
  });
}

async function ensureBrevoAttributes(env) {
  const wanted = [
    ['CHECKIN_TIME', 'text'],
    ['TIMEZONE', 'text'],
    ['CURRENT_CHALLENGE', 'text'],
    ['CHALLENGE_DAY', 'float'],
    ['LAST_ACTIVITY_DATE', 'date'],
    ['CHALLENGE_STATUS', 'text'],
    ['PURCHASED_MASTERY', 'boolean']
  ];

  const existingResponse = await brevoFetch(env, '/contacts/attributes', { method: 'GET' });
  if (!existingResponse.ok) throw new Error('Unable to verify Brevo contact attributes.');
  const existing = await existingResponse.json();
  const names = new Set((existing.attributes || []).map(a => String(a.name || '').toUpperCase()));

  for (const [name, type] of wanted) {
    if (names.has(name)) continue;
    const createResponse = await brevoFetch(env, `/contacts/attributes/normal/${encodeURIComponent(name)}`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
    if (!createResponse.ok && createResponse.status !== 409) {
      let detail = '';
      try { detail = JSON.stringify(await createResponse.json()); } catch {}
      throw new Error(`Unable to create Brevo attribute ${name}${detail ? `: ${detail}` : ''}`);
    }
  }
}

async function handleSubscribe(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ success: false, error: 'Invalid request.' }, 400); }

  const email = String(body?.email || '').trim().toLowerCase().slice(0, 254);
  const checkinTime = String(body?.checkin_time || '').trim();
  const timezone = String(body?.timezone || '').trim();
  const challenge = String(body?.challenge || '').trim();

  if (!EMAIL_RE.test(email)) return json({ success: false, error: 'Enter a valid email address.' }, 400);
  if (!CHECKIN_TIMES.has(checkinTime)) return json({ success: false, error: 'Choose a valid check-in time.' }, 400);
  if (!validTimezone(timezone)) return json({ success: false, error: 'Choose a valid timezone.' }, 400);
  if (!CHALLENGES.has(challenge)) return json({ success: false, error: 'Invalid challenge.' }, 400);

  const listId = Number(env.BREVO_LIST_FOUNDATION);
  if (!Number.isInteger(listId) || listId <= 0) {
    return json({ success: false, error: 'Foundation email list is not configured.' }, 503);
  }
  if (!env.BREVO_API_KEY) return json({ success: false, error: 'Email service is not configured.' }, 503);

  try {
    await ensureBrevoAttributes(env);
    const response = await brevoFetch(env, '/contacts', {
      method: 'POST',
      body: JSON.stringify({
        email,
        updateEnabled: true,
        listIds: [listId],
        attributes: {
          CHECKIN_TIME: checkinTime,
          TIMEZONE: timezone,
          CURRENT_CHALLENGE: 'foundation_7',
          CHALLENGE_DAY: 1,
          LAST_ACTIVITY_DATE: new Date().toISOString().slice(0, 10),
          CHALLENGE_STATUS: 'active',
          PURCHASED_MASTERY: false
        }
      })
    });

    if (!response.ok) {
      let detail = null;
      try { detail = await response.json(); } catch {}
      console.error('brevo_subscribe_failed', response.status, detail);
      return json({ success: false, error: 'We could not start your daily check-ins right now. Please try again.' }, 502);
    }

    return json({ success: true });
  } catch (error) {
    console.error('brevo_subscribe_error', error);
    return json({ success: false, error: 'We could not start your daily check-ins right now. Please try again.' }, 502);
  }
}

function enhanceSevenDaySignup(source) {
  if (source.includes('id="flexSubscribeForm"')) return source;

  const signup = `<section class="flex-checkin-signup" aria-labelledby="flex-checkin-title"><div class="flex-checkin-kicker">OPTIONAL DAILY CHECK-IN</div><h2 id="flex-checkin-title">Get Your Daily FLEX Check-In</h2><p>Stay connected to your challenge with one reminder at the time you choose.</p><form id="flexSubscribeForm" novalidate><label class="flex-email-label" for="flexSubscriberEmail">Email address</label><input id="flexSubscriberEmail" name="email" type="email" maxlength="254" autocomplete="email" placeholder="you@example.com" required><fieldset><legend>When would you like your daily FLEX check-in?</legend><div class="flex-time-grid"><label><input type="radio" name="checkin_time" value="09:00" checked><span>9:00 AM</span></label><label><input type="radio" name="checkin_time" value="13:00"><span>1:00 PM</span></label><label><input type="radio" name="checkin_time" value="18:00"><span>6:00 PM</span></label></div></fieldset><p class="flex-time-help">Choose the time that works best for your schedule. You can change it anytime.</p><div id="flexTimezoneWrap" class="flex-timezone-wrap" hidden><label for="flexTimezone">Choose your timezone</label><select id="flexTimezone" name="timezone"><option value="">Select timezone</option><option value="America/New_York">Eastern</option><option value="America/Chicago">Central</option><option value="America/Denver">Mountain</option><option value="America/Los_Angeles">Pacific</option><option value="America/Anchorage">Alaska</option><option value="Pacific/Honolulu">Hawaii</option></select></div><button id="flexSubscribeButton" type="submit">START MY DAILY CHECK-INS →</button><p class="flex-checkin-micro">100% Free · No credit card required · Unsubscribe anytime</p><div id="flexSubscribeStatus" class="flex-subscribe-status" aria-live="polite"></div></form><div id="flexSubscribeSuccess" class="flex-subscribe-success" hidden></div></section>`;

  const marker = '</section><section class="challenge-layout">';
  if (source.includes(marker)) source = source.replace(marker, `</section>${signup}<section class="challenge-layout">`);
  else source = source.replace('</main>', `${signup}</main>`);

  const css = `.flex-checkin-signup{max-width:760px;margin:0 auto 1.6rem;padding:1.35rem;background:#151619;border:1px solid rgba(255,255,255,.1);border-radius:20px;text-align:center}.flex-checkin-kicker{color:#d4af37;font-size:.7rem;font-weight:900;letter-spacing:.14em}.flex-checkin-signup h2{margin:.35rem 0 .25rem}.flex-checkin-signup>p{color:#aaa;margin:.25rem auto 1rem}.flex-checkin-signup form{text-align:left}.flex-email-label,.flex-timezone-wrap label{display:block;margin-bottom:.35rem;font-size:.78rem;font-weight:850;color:#ddd}.flex-checkin-signup input[type=email],.flex-checkin-signup select{width:100%;background:#0c0d0f;border:1px solid rgba(255,255,255,.14);border-radius:12px;color:#fff;padding:.82rem .9rem;font:inherit;outline:none}.flex-checkin-signup input[type=email]:focus,.flex-checkin-signup select:focus{border-color:#d4af37}.flex-checkin-signup fieldset{border:0;padding:0;margin:1rem 0 0}.flex-checkin-signup legend{font-size:.82rem;font-weight:850;margin-bottom:.55rem}.flex-time-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem}.flex-time-grid label{cursor:pointer}.flex-time-grid input{position:absolute;opacity:0;pointer-events:none}.flex-time-grid span{display:block;text-align:center;padding:.78rem .5rem;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:#0c0d0f;font-weight:850}.flex-time-grid input:checked+span{border-color:#d4af37;background:#1d1b12;color:#f0d36a}.flex-time-help,.flex-checkin-micro{color:#888!important;font-size:.78rem;margin:.65rem 0!important;text-align:center}.flex-timezone-wrap{margin:.85rem 0}.flex-checkin-signup button{width:100%;border:0;border-radius:999px;padding:.85rem 1rem;background:linear-gradient(135deg,#f0d36a,#d4af37);color:#080808;font:inherit;font-weight:950;cursor:pointer}.flex-checkin-signup button:disabled{opacity:.6;cursor:wait}.flex-subscribe-status{min-height:1.25rem;text-align:center;color:#ef9a9a;font-size:.82rem;margin-top:.45rem}.flex-subscribe-success{padding:1rem;border:1px solid rgba(212,175,55,.45);border-radius:14px;background:#171612;color:#f4f4f4;font-weight:850}.flex-subscribe-success strong{color:#f0d36a}@media(max-width:520px){.flex-time-grid{grid-template-columns:1fr}.flex-checkin-signup{padding:1.1rem}}`;
  source = source.replace('</style>', css + '</style>');

  const js = `\n(()=>{const form=document.getElementById('flexSubscribeForm');if(!form)return;const email=document.getElementById('flexSubscriberEmail'),button=document.getElementById('flexSubscribeButton'),status=document.getElementById('flexSubscribeStatus'),success=document.getElementById('flexSubscribeSuccess'),tzWrap=document.getElementById('flexTimezoneWrap'),tzSelect=document.getElementById('flexTimezone');let detected='';try{detected=Intl.DateTimeFormat().resolvedOptions().timeZone||'';if(detected)new Intl.DateTimeFormat('en-US',{timeZone:detected}).format()}catch{detected=''}if(!detected)tzWrap.hidden=false;form.addEventListener('submit',async e=>{e.preventDefault();status.textContent='';const selected=form.querySelector('input[name="checkin_time"]:checked');const timezone=detected||tzSelect.value;if(!email.value.trim()){status.textContent='Enter a valid email address.';email.focus();return}if(!timezone){status.textContent='Choose your timezone.';tzWrap.hidden=false;tzSelect.focus();return}button.disabled=true;button.textContent='SETTING UP…';try{const res=await fetch('/api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:email.value.trim(),checkin_time:selected?selected.value:'',timezone,challenge:'foundation_7'})});const data=await res.json().catch(()=>({}));if(!res.ok||!data.success)throw new Error(data.error||'Unable to start daily check-ins.');const label=selected?selected.nextElementSibling.textContent:'your selected time';form.hidden=true;success.hidden=false;success.innerHTML='✓ You\'re in. We\'ll deliver your check-in at <strong>'+label+'</strong>.'}catch(err){status.textContent=(err&&err.message)||'We could not start your daily check-ins right now.';button.disabled=false;button.textContent='START MY DAILY CHECK-INS →'}})})();\n`;
  return source.replace('</script>', js + '</script>');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    if (request.method === 'POST' && path === '/api/subscribe') {
      return handleSubscribe(request, env);
    }

    const response = await worker.fetch(request, env, ctx);
    if (request.method !== 'GET' || (path !== '/challenge' && path !== '/challenges/7-day')) return response;

    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return response;
    const source = enhanceSevenDaySignup(await response.text());
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    return new Response(source, { status: response.status, headers });
  }
};
