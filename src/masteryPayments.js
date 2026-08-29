const MASTERY_PRODUCT_KEY = '28-day-mastery';
const SESSION_STATUS_TTL_MS = 30 * 60 * 1000;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function isSandboxMode(env) {
  return String(env?.MASTERY_LAUNCH_MODE || '').toLowerCase() === 'sandbox';
}

function isOpenMode(env) {
  return String(env?.MASTERY_LAUNCH_MODE || '').toLowerCase() === 'open';
}

export function masteryPaymentsEnabled(env) {
  return isSandboxMode(env) || isOpenMode(env);
}

function configured(env) {
  return Boolean(env?.DB && env?.STRIPE_SECRET_KEY && env?.STRIPE_MASTERY_PRICE_ID);
}

function cleanUserId(value) {
  return String(value || '').trim().slice(0, 128);
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0, 254);
}

function validEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function stripeHeaders(secretKey) {
  return {
    authorization: `Bearer ${secretKey}`,
    'content-type': 'application/x-www-form-urlencoded',
  };
}

function encodeForm(entries) {
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
  }
  return params.toString();
}

async function stripeRequest(env, path, method = 'GET', entries = []) {
  const init = { method, headers: stripeHeaders(env.STRIPE_SECRET_KEY) };
  if (method !== 'GET') init.body = encodeForm(entries);
  const response = await fetch(`https://api.stripe.com${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Stripe request failed (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

async function upsertPurchase(db, session, statusOverride = null) {
  const userId = cleanUserId(session?.client_reference_id || session?.metadata?.user_id);
  const priceId = String(session?.metadata?.price_id || '').trim();
  if (!session?.id || !userId) return false;

  const now = Date.now();
  const paymentStatus = String(statusOverride || session?.payment_status || 'pending');
  const grantedAt = paymentStatus === 'paid' ? now : null;
  const customerId = typeof session?.customer === 'string' ? session.customer : session?.customer?.id || null;
  const paymentIntentId = typeof session?.payment_intent === 'string' ? session.payment_intent : session?.payment_intent?.id || null;
  const email = cleanEmail(session?.customer_details?.email || session?.customer_email || '');

  await db.prepare(`
    INSERT INTO mastery_purchases (
      checkout_session_id,user_id,stripe_customer_id,payment_intent_id,price_id,
      amount_total,currency,payment_status,customer_email,access_granted_at,created_at,updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(checkout_session_id) DO UPDATE SET
      user_id=excluded.user_id,
      stripe_customer_id=COALESCE(excluded.stripe_customer_id,mastery_purchases.stripe_customer_id),
      payment_intent_id=COALESCE(excluded.payment_intent_id,mastery_purchases.payment_intent_id),
      price_id=excluded.price_id,
      amount_total=COALESCE(excluded.amount_total,mastery_purchases.amount_total),
      currency=COALESCE(excluded.currency,mastery_purchases.currency),
      payment_status=excluded.payment_status,
      customer_email=COALESCE(excluded.customer_email,mastery_purchases.customer_email),
      access_granted_at=COALESCE(mastery_purchases.access_granted_at,excluded.access_granted_at),
      updated_at=excluded.updated_at
  `).bind(
    session.id,
    userId,
    customerId,
    paymentIntentId,
    priceId || 'unknown',
    Number.isFinite(session?.amount_total) ? session.amount_total : null,
    session?.currency || null,
    paymentStatus,
    email || null,
    grantedAt,
    now,
    now,
  ).run();
  return true;
}

export async function hasMasteryAccess(db, userId) {
  const id = cleanUserId(userId);
  if (!db || !id) return false;
  const row = await db.prepare(`
    SELECT 1 AS allowed
    FROM mastery_purchases
    WHERE user_id=? AND payment_status='paid' AND access_granted_at IS NOT NULL
    ORDER BY access_granted_at DESC
    LIMIT 1
  `).bind(id).first();
  return Boolean(row?.allowed);
}

export async function createMasteryCheckout(request, env) {
  if (!masteryPaymentsEnabled(env)) return json({ ok: false, error: 'Mastery checkout is not open yet.' }, 403);
  if (!configured(env)) return json({ ok: false, error: 'Mastery checkout is not configured yet.' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
  const userId = cleanUserId(body?.user_id || request.headers.get('x-flex-user-id'));
  const email = cleanEmail(body?.email);
  if (!userId) return json({ ok: false, error: 'A Mastery participant ID is required.' }, 400);
  if (!validEmail(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400);

  const origin = new URL(request.url).origin;
  const successUrl = `${origin}/mastery/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/mastery/cancel`;
  const entries = [
    ['mode', 'payment'],
    ['line_items[0][price]', env.STRIPE_MASTERY_PRICE_ID],
    ['line_items[0][quantity]', '1'],
    ['success_url', successUrl],
    ['cancel_url', cancelUrl],
    ['client_reference_id', userId],
    ['metadata[user_id]', userId],
    ['metadata[product]', MASTERY_PRODUCT_KEY],
    ['metadata[price_id]', env.STRIPE_MASTERY_PRICE_ID],
    ['payment_intent_data[metadata][user_id]', userId],
    ['payment_intent_data[metadata][product]', MASTERY_PRODUCT_KEY],
  ];
  if (email) entries.push(['customer_email', email]);

  try {
    const session = await stripeRequest(env, '/v1/checkout/sessions', 'POST', entries);
    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO mastery_purchases (
        checkout_session_id,user_id,price_id,payment_status,customer_email,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(checkout_session_id) DO UPDATE SET updated_at=excluded.updated_at
    `).bind(session.id, userId, env.STRIPE_MASTERY_PRICE_ID, 'pending', email || null, now, now).run();
    return json({ ok: true, checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('mastery_checkout_create_failed', error);
    return json({ ok: false, error: error?.message || 'Unable to start checkout.' }, 502);
  }
}

function parseStripeSignature(header) {
  const parts = String(header || '').split(',').map(v => v.trim());
  const timestamp = parts.find(v => v.startsWith('t='))?.slice(2) || '';
  const signatures = parts.filter(v => v.startsWith('v1=')).map(v => v.slice(3));
  return { timestamp, signatures };
}

function hex(bytes) {
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function verifyWebhook(rawBody, signatureHeader, secret) {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  const timestampNumber = Number(timestamp);
  if (!timestamp || !signatures.length || !Number.isFinite(timestampNumber)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`));
  const expected = hex(digest);
  return signatures.some(signature => safeEqual(expected, signature));
}

export async function handleStripeWebhook(request, env) {
  if (!env?.DB || !env?.STRIPE_WEBHOOK_SECRET) return json({ ok: false, error: 'Webhook is not configured.' }, 503);
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!(await verifyWebhook(rawBody, signature, env.STRIPE_WEBHOOK_SECRET))) {
    return json({ ok: false, error: 'Invalid Stripe signature.' }, 400);
  }

  let event;
  try { event = JSON.parse(rawBody); } catch { return json({ ok: false, error: 'Invalid webhook payload.' }, 400); }
  const session = event?.data?.object;
  try {
    if (event?.type === 'checkout.session.completed') {
      await upsertPurchase(env.DB, session, session?.payment_status === 'paid' ? 'paid' : 'pending');
    } else if (event?.type === 'checkout.session.async_payment_succeeded') {
      await upsertPurchase(env.DB, session, 'paid');
    } else if (event?.type === 'checkout.session.async_payment_failed') {
      await upsertPurchase(env.DB, session, 'failed');
    }
    return json({ received: true });
  } catch (error) {
    console.error('mastery_stripe_webhook_failed', error);
    return json({ ok: false, error: 'Webhook processing failed.' }, 500);
  }
}

export async function masteryAccessStatus(request, env) {
  if (!env?.DB) return json({ ok: false, error: 'Mastery storage is unavailable.' }, 503);
  const url = new URL(request.url);
  const userId = cleanUserId(request.headers.get('x-flex-user-id') || url.searchParams.get('user_id'));
  const sessionId = String(url.searchParams.get('session_id') || '').trim().slice(0, 255);
  if (!userId) return json({ ok: false, access: false, error: 'Participant ID required.' }, 400);

  let row;
  if (sessionId) {
    row = await env.DB.prepare(`
      SELECT checkout_session_id,payment_status,access_granted_at,updated_at
      FROM mastery_purchases WHERE checkout_session_id=? AND user_id=? LIMIT 1
    `).bind(sessionId, userId).first();
  } else {
    row = await env.DB.prepare(`
      SELECT checkout_session_id,payment_status,access_granted_at,updated_at
      FROM mastery_purchases WHERE user_id=?
      ORDER BY access_granted_at DESC, updated_at DESC LIMIT 1
    `).bind(userId).first();
  }
  const access = row?.payment_status === 'paid' && Boolean(row?.access_granted_at);
  return json({ ok: true, access, payment_status: row?.payment_status || 'none', session_id: row?.checkout_session_id || null });
}

export async function masteryContentResponse(request, env, renderMastery) {
  if (!env?.DB) return json({ ok: false, error: 'Mastery storage is unavailable.' }, 503);
  const userId = cleanUserId(request.headers.get('x-flex-user-id'));
  if (!userId || !(await hasMasteryAccess(env.DB, userId))) {
    return json({ ok: false, error: 'Paid Mastery access required.' }, 403);
  }
  return html(renderMastery());
}

export function masteryCheckoutPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><title>28-Day Mastery — The Flex Standard</title><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#080808;color:#fff;font-family:system-ui,-apple-system,sans-serif;min-height:100vh}.wrap{width:min(760px,calc(100% - 28px));margin:0 auto;padding:54px 0}.card{background:#141414;border:1px solid #2b2b2b;border-radius:24px;padding:clamp(24px,6vw,42px);box-shadow:0 24px 70px #0008}.k{color:#d4af37;font-weight:900;letter-spacing:.14em;font-size:.75rem}.price{font-size:clamp(3rem,14vw,5.2rem);font-weight:950;margin:.1rem 0}.one{color:#9c9c9c;font-weight:700}.features{display:grid;gap:10px;margin:24px 0}.feature{padding:13px 15px;border:1px solid #292929;border-radius:14px;background:#0d0d0d}.btn{width:100%;border:0;border-radius:999px;padding:15px 20px;background:#d4af37;color:#080808;font:inherit;font-weight:950;cursor:pointer}.btn:disabled{opacity:.55;cursor:wait}.muted{color:#9a9a9a}.status{min-height:1.5em;margin-top:12px;color:#bbb}.back{display:inline-block;margin-top:18px;color:#c8c8c8;text-decoration:none}</style></head><body><main class="wrap"><section class="card"><div class="k">THE FLEX STANDARD · 28-DAY MASTERY</div><h1>Build a standard you can own.</h1><p class="muted">Four weeks of guided action that gradually shifts the responsibility from the program to you.</p><div class="price">$20</div><div class="one">one-time launch price · no subscription</div><div class="features"><div class="feature">28 days of progressive FLEX actions and daily missions</div><div class="feature">10, 20, or 30+ minute movement options with weekly progression</div><div class="feature">XP, streaks, achievement trophies, FLEX Proof, and completion certificate</div><div class="feature">Post-Mastery 30-day continuation plan</div></div><button id="buy" class="btn">START 28-DAY MASTERY — $20</button><div id="status" class="status" aria-live="polite"></div><a class="back" href="/challenges">← Back to challenges</a></section></main><script>const USER_KEY='flexStandard.mastery.userId.v1';function uid(){let v=localStorage.getItem(USER_KEY);if(!v){v=(crypto.randomUUID?crypto.randomUUID():('mastery-'+Date.now()+'-'+Math.random().toString(16).slice(2)));localStorage.setItem(USER_KEY,v)}return v}function profileEmail(){try{return JSON.parse(localStorage.getItem('flexStandard.profile.v1')||'{}').email||''}catch{return''}}const btn=document.getElementById('buy'),status=document.getElementById('status');btn.addEventListener('click',async()=>{btn.disabled=true;btn.textContent='OPENING SECURE CHECKOUT…';status.textContent='';try{const r=await fetch('/api/mastery/checkout',{method:'POST',headers:{'content-type':'application/json','x-flex-user-id':uid()},body:JSON.stringify({user_id:uid(),email:profileEmail()})});const d=await r.json();if(!r.ok||!d.ok||!d.checkout_url)throw new Error(d.error||'Checkout could not be started.');location.href=d.checkout_url}catch(e){status.textContent=e.message||'Checkout could not be started.';btn.disabled=false;btn.textContent='START 28-DAY MASTERY — $20'}});</script></body></html>`;
}

export function masterySuccessPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><title>Mastery Payment — The Flex Standard</title><style>body{margin:0;background:#080808;color:#fff;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}.card{width:min(620px,calc(100% - 28px));background:#141414;border:1px solid #2b2b2b;border-radius:24px;padding:34px;text-align:center}.gold{color:#d4af37;font-weight:950}.muted{color:#999}.btn{display:none;margin-top:18px;background:#d4af37;color:#080808;padding:13px 18px;border-radius:999px;text-decoration:none;font-weight:950}</style></head><body><main class="card"><div class="gold">PAYMENT RECEIVED</div><h1>We’re unlocking your Mastery access.</h1><p id="message" class="muted">Stripe is confirming the payment. This usually takes only a moment.</p><a id="enter" class="btn" href="/challenges/28-day">ENTER 28-DAY MASTERY</a></main><script>const key='flexStandard.mastery.userId.v1',userId=localStorage.getItem(key)||'',sessionId=new URLSearchParams(location.search).get('session_id')||'',msg=document.getElementById('message'),enter=document.getElementById('enter');let tries=0;async function check(){tries++;try{const r=await fetch('/api/mastery/access?session_id='+encodeURIComponent(sessionId),{headers:{'x-flex-user-id':userId}});const d=await r.json();if(d.access){msg.textContent='Payment verified. Your 28-Day Mastery access is ready.';enter.style.display='inline-block';setTimeout(()=>location.href='/challenges/28-day',900);return}msg.textContent=d.payment_status==='pending'?'Payment received. Waiting for secure verification…':'Waiting for Stripe payment confirmation…'}catch{msg.textContent='We are still confirming your payment. Your access will appear as soon as verification completes.'}if(tries<20)setTimeout(check,1500);else msg.textContent='Payment confirmation is taking longer than expected. You can safely return to this page or open Mastery again in a few minutes.'}check();</script></body></html>`;
}

export function masteryCancelPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><title>Mastery Checkout Canceled</title><style>body{margin:0;background:#080808;color:#fff;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}.card{width:min(620px,calc(100% - 28px));background:#141414;border:1px solid #2b2b2b;border-radius:24px;padding:34px;text-align:center}.muted{color:#999}.btn{display:inline-block;margin:8px;background:#d4af37;color:#080808;padding:13px 18px;border-radius:999px;text-decoration:none;font-weight:950}.secondary{background:transparent;color:#ddd;border:1px solid #383838}</style></head><body><main class="card"><h1>No charge was completed.</h1><p class="muted">Your Mastery checkout was canceled. You can return whenever you’re ready.</p><a class="btn" href="/mastery">RETURN TO MASTERY</a><a class="btn secondary" href="/challenges">BACK TO CHALLENGES</a></main></body></html>`;
}

export function masteryGatePage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><title>28-Day Mastery — The Flex Standard</title><style>body{margin:0;background:#080808;color:#fff;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}.card{width:min(620px,calc(100% - 28px));background:#141414;border:1px solid #2b2b2b;border-radius:24px;padding:34px;text-align:center}.gold{color:#d4af37;font-weight:950}.muted{color:#999}.btn{display:inline-block;margin-top:14px;background:#d4af37;color:#080808;padding:13px 18px;border-radius:999px;text-decoration:none;font-weight:950}</style></head><body><main class="card"><div class="gold">28-DAY MASTERY</div><h1 id="title">Checking your access…</h1><p id="message" class="muted">One moment.</p><a id="buy" class="btn" href="/mastery" style="display:none">UNLOCK MASTERY — $20</a></main><script>const key='flexStandard.mastery.userId.v1';let id=localStorage.getItem(key);if(!id){id=(crypto.randomUUID?crypto.randomUUID():('mastery-'+Date.now()+'-'+Math.random().toString(16).slice(2)));localStorage.setItem(key,id)}const title=document.getElementById('title'),message=document.getElementById('message'),buy=document.getElementById('buy');(async()=>{try{const r=await fetch('/api/mastery/content',{headers:{'x-flex-user-id':id}});if(r.ok){const page=await r.text();document.open();document.write(page);document.close();return}title.textContent='Mastery is a paid next step.';message.textContent='Unlock the complete 28-Day Mastery program with a one-time $20 payment.';buy.style.display='inline-block'}catch{title.textContent='We could not check access.';message.textContent='Please try again in a moment.'}})();</script></body></html>`;
}
