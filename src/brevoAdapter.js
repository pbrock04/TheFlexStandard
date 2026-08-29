const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

function clean(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function brevoConfig(env = {}) {
  return {
    enabled: String(env.BREVO_SEND_ENABLED || '').toLowerCase() === 'true',
    apiKey: clean(env.BREVO_API_KEY, 1000),
    senderEmail: clean(env.BREVO_SENDER_EMAIL, 254),
    senderName: clean(env.BREVO_SENDER_NAME || 'Flex | The Flex Standard', 100),
  };
}

export function renderLaunchEmail(payload = {}) {
  const routeUrl = clean(payload.route_url, 1000);
  const workbookUrl = clean(payload.workbook_url, 1000);
  const key = clean(payload.email_key, 100);

  if (key === 'welcome_foundation') {
    return {
      text: [
        'Welcome to The Flex Standard.',
        '',
        'Your 7-Day Foundation is active. Start with Day 1: a 10-minute walk and 16 oz of water.',
        '',
        `Continue your Foundation: ${routeUrl}`,
        workbookUrl ? `Download your 7-Day Foundation Companion Workbook: ${workbookUrl}` : '',
        '',
        'Focus. Learn. Execute. eXcel.',
      ].filter(Boolean).join('\n'),
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717"><h1 style="font-size:24px">Welcome to The Flex Standard.</h1><p>Your 7-Day Foundation is active. Start with <strong>Day 1: a 10-minute walk and 16 oz of water.</strong></p><p><a href="${escapeHtml(routeUrl)}">Continue your Foundation</a></p>${workbookUrl ? `<p><a href="${escapeHtml(workbookUrl)}">Download your 7-Day Foundation Companion Workbook</a></p>` : ''}<p>Focus. Learn. Execute. eXcel.</p></div>`,
    };
  }

  if (key === 'foundation_complete') {
    return {
      text: `Foundation secured. You completed the first 7 days. Your next step is 14-Day Momentum: ${routeUrl}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717"><h1 style="font-size:24px">Foundation secured.</h1><p>You completed the first 7 days. Your next step is 14-Day Momentum.</p><p><a href="${escapeHtml(routeUrl)}">Start 14-Day Momentum</a></p></div>`,
    };
  }

  if (key === 'habit_lock_complete') {
    return {
      text: `You completed 21-Day Habit Lock. You are now eligible for the 28-Day Mastery capstone: ${routeUrl}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717"><h1 style="font-size:24px">Habit Lock complete.</h1><p>You completed 21-Day Habit Lock and earned eligibility for the 28-Day Mastery capstone.</p><p><a href="${escapeHtml(routeUrl)}">View 28-Day Mastery</a></p></div>`,
    };
  }

  throw new Error('Unsupported launch email key.');
}

export function buildBrevoRequest({ env, payload, outboxId }) {
  const config = brevoConfig(env);
  if (!config.enabled) return { ready: false, reason: 'brevo_send_disabled' };
  if (!config.apiKey) return { ready: false, reason: 'brevo_api_key_missing' };
  if (!config.senderEmail) return { ready: false, reason: 'brevo_sender_email_missing' };
  if (!payload?.to || !payload?.subject || !payload?.email_key) return { ready: false, reason: 'email_payload_incomplete' };

  const rendered = renderLaunchEmail(payload);
  return {
    ready: true,
    url: BREVO_ENDPOINT,
    init: {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': config.apiKey,
        'Idempotency-Key': clean(outboxId || payload.email_key, 200),
      },
      body: JSON.stringify({
        sender: { email: config.senderEmail, name: config.senderName },
        to: [{ email: clean(payload.to, 254) }],
        subject: clean(payload.subject, 200),
        htmlContent: rendered.html,
        textContent: rendered.text,
        tags: ['flex-standard', 'lifecycle', clean(payload.email_key, 100)],
      }),
    },
  };
}

export async function sendBrevoEmail({ env, payload, outboxId, fetchImpl = fetch }) {
  const request = buildBrevoRequest({ env, payload, outboxId });
  if (!request.ready) return { sent: false, skipped: true, reason: request.reason };

  const response = await fetchImpl(request.url, request.init);
  let data = null;
  try { data = await response.json(); } catch { data = null; }

  if (!response.ok) {
    const detail = clean(data?.message || data?.code || `Brevo HTTP ${response.status}`, 500);
    throw new Error(detail || 'Brevo send failed.');
  }

  return { sent: true, skipped: false, message_id: data?.messageId || null };
}

export async function dispatchNextLifecycleEmail(db, env, { fetchImpl = fetch } = {}) {
  const row = await db.prepare(`SELECT outbox_id,event_id,user_id,email_key,recipient_email,payload_json,status,attempt_count
    FROM lifecycle_email_outbox
    WHERE status='pending'
    ORDER BY created_at ASC
    LIMIT 1`).first();

  if (!row) return { processed: false, reason: 'outbox_empty' };

  const payload = JSON.parse(row.payload_json || '{}');
  const config = brevoConfig(env);
  if (!config.enabled) return { processed: false, reason: 'brevo_send_disabled', outbox_id: row.outbox_id };

  const now = Date.now();
  await db.prepare(`UPDATE lifecycle_email_outbox
    SET status='sending',attempt_count=attempt_count+1,last_error=NULL,updated_at=?
    WHERE outbox_id=? AND status='pending'`)
    .bind(now, row.outbox_id).run();

  try {
    const result = await sendBrevoEmail({ env, payload, outboxId: row.outbox_id, fetchImpl });
    if (!result.sent) {
      await db.prepare(`UPDATE lifecycle_email_outbox SET status='pending',last_error=?,updated_at=? WHERE outbox_id=?`)
        .bind(result.reason || 'send_skipped', Date.now(), row.outbox_id).run();
      return { processed: false, reason: result.reason, outbox_id: row.outbox_id };
    }
    await db.prepare(`UPDATE lifecycle_email_outbox SET status='sent',sent_at=?,last_error=NULL,updated_at=? WHERE outbox_id=?`)
      .bind(Date.now(), Date.now(), row.outbox_id).run();
    return { processed: true, sent: true, outbox_id: row.outbox_id, message_id: result.message_id };
  } catch (error) {
    const message = clean(error?.message || 'Brevo send failed.', 500);
    await db.prepare(`UPDATE lifecycle_email_outbox SET status='failed',last_error=?,updated_at=? WHERE outbox_id=?`)
      .bind(message, Date.now(), row.outbox_id).run();
    return { processed: true, sent: false, outbox_id: row.outbox_id, error: message };
  }
}
