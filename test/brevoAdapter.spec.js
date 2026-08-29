import { describe, expect, it, vi } from 'vitest';
import { buildBrevoRequest, renderLaunchEmail, sendBrevoEmail } from '../src/brevoAdapter.js';

describe('Brevo lifecycle adapter', () => {
  const payload = {
    email_key: 'welcome_foundation',
    to: 'tester@example.com',
    subject: 'Day 1 Starts Now — Your 7-Day Foundation',
    route_url: 'https://theflexstandard.com/challenges/7-day',
    workbook_url: 'https://theflexstandard.com/downloads/flex-7day-foundation-workbook.pdf',
  };

  it('never builds a live request unless sending is explicitly enabled', () => {
    expect(buildBrevoRequest({ env: {}, payload, outboxId: 'email:test' })).toEqual({
      ready: false,
      reason: 'brevo_send_disabled',
    });
  });

  it('requires API key and sender email before sending', () => {
    expect(buildBrevoRequest({ env: { BREVO_SEND_ENABLED: 'true' }, payload, outboxId: 'email:test' }).reason).toBe('brevo_api_key_missing');
    expect(buildBrevoRequest({ env: { BREVO_SEND_ENABLED: 'true', BREVO_API_KEY: 'secret' }, payload, outboxId: 'email:test' }).reason).toBe('brevo_sender_email_missing');
  });

  it('builds the documented Brevo transactional email request', () => {
    const request = buildBrevoRequest({
      env: {
        BREVO_SEND_ENABLED: 'true',
        BREVO_API_KEY: 'secret',
        BREVO_SENDER_EMAIL: 'flex@theflexstandard.com',
        BREVO_SENDER_NAME: 'Flex | The Flex Standard',
      },
      payload,
      outboxId: 'email:lead-1',
    });
    expect(request.ready).toBe(true);
    expect(request.url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(request.init.headers['api-key']).toBe('secret');
    expect(request.init.headers['Idempotency-Key']).toBe('email:lead-1');
    const body = JSON.parse(request.init.body);
    expect(body.sender.email).toBe('flex@theflexstandard.com');
    expect(body.to).toEqual([{ email: 'tester@example.com' }]);
    expect(body.subject).toBe(payload.subject);
    expect(body.htmlContent).toContain(payload.workbook_url);
    expect(body.textContent).toContain(payload.workbook_url);
  });

  it('does not call the network when sending is disabled', async () => {
    const fetchImpl = vi.fn();
    const result = await sendBrevoEmail({ env: {}, payload, outboxId: 'email:test', fetchImpl });
    expect(result).toEqual({ sent: false, skipped: true, reason: 'brevo_send_disabled' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('captures Brevo message id after a successful send', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ({ messageId: '<test@relay.brevo.com>' }),
    }));
    const result = await sendBrevoEmail({
      env: {
        BREVO_SEND_ENABLED: 'true',
        BREVO_API_KEY: 'secret',
        BREVO_SENDER_EMAIL: 'flex@theflexstandard.com',
      },
      payload,
      outboxId: 'email:test',
      fetchImpl,
    });
    expect(result.sent).toBe(true);
    expect(result.message_id).toBe('<test@relay.brevo.com>');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('renders the workbook CTA only for the welcome email', () => {
    expect(renderLaunchEmail(payload).html).toContain('Download your 7-Day Foundation Companion Workbook');
    const completion = renderLaunchEmail({ email_key: 'foundation_complete', route_url: 'https://theflexstandard.com/challenges/14-day' });
    expect(completion.html).not.toContain('Workbook');
  });
});
