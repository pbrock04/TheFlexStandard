import app from './freeFunnelReleaseWrapper.js';
import { disclaimerPage, privacyPage, termsPage } from './v1LegalPages.js';
import { syncBrevoContact } from './brevo.js';

const html = body => new Response(body, {
  status: 200,
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

function pathOf(request) {
  return new URL(request.url).pathname.replace(/\/$/, '') || '/';
}

async function readOptionalLead(request) {
  try {
    const body = await request.clone().json();
    return {
      name: body?.name || '',
      email: body?.email || '',
      timezone: body?.timezone || '',
      checkin_time: body?.checkin_time || '',
      challenge_day: 7,
      challenge_status: 'Completed',
    };
  } catch {
    return null;
  }
}

async function subscribe(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'Invalid JSON request.' }, 400); }

  try {
    const result = await syncBrevoContact(env, {
      name: body?.name,
      email: body?.email,
      timezone: body?.timezone,
      checkin_time: body?.checkin_time,
      challenge_day: body?.challenge_day || 1,
      challenge_status: body?.challenge_status || 'Active',
    });

    if (result.skipped) {
      return json({ ok: false, error: 'Email service is not configured yet.' }, 503);
    }
    return json({ ok: true });
  } catch (error) {
    console.error('brevo_subscribe_failed', error);
    const status = Number(error?.status) === 429 ? 429 : 502;
    return json({ ok: false, error: status === 429 ? 'Email service is busy. Please try again shortly.' : 'We could not save your email preferences right now.' }, status);
  }
}

export default {
  async fetch(request, env, ctx) {
    const path = pathOf(request);

    if (request.method === 'GET' && (path === '/disclaimer' || path === '/health-physical-activity-disclaimer')) {
      return html(disclaimerPage());
    }
    if (request.method === 'GET' && path === '/privacy') return html(privacyPage());
    if (request.method === 'GET' && path === '/terms') return html(termsPage());
    if (request.method === 'GET' && path === '/api/email/status') {
      return json({
        ok: true,
        provider: 'brevo',
        configured: Boolean(env?.BREVO_API_KEY),
        foundation_list_configured: Boolean(Number(env?.BREVO_LIST_FOUNDATION) > 0),
        outbound_automation: 'disabled_phase_1a',
      });
    }
    if (request.method === 'POST' && path === '/api/subscribe') return subscribe(request, env);

    const lead = request.method === 'POST' && path === '/api/optional-lead'
      ? await readOptionalLead(request)
      : null;

    const response = await app.fetch(request, env, ctx);

    if (lead && response.ok && lead.email) {
      const task = syncBrevoContact(env, lead).catch(error => {
        console.error('brevo_optional_lead_sync_failed', error);
      });
      if (ctx?.waitUntil) ctx.waitUntil(task);
      else await task;
    }

    return response;
  },
};
