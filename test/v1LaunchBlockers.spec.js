import { describe, expect, it, vi } from 'vitest';
import { normalizeBrevoContact, syncBrevoContact } from '../src/brevo.js';
import { disclaimerPage, privacyPage, termsPage } from '../src/v1LegalPages.js';
import launchApp from '../src/v1LaunchWrapper.js';

describe('V1 launch blockers', () => {
  it('normalizes a Foundation contact for Brevo', () => {
    const contact = normalizeBrevoContact({
      name: 'Paul',
      email: ' PAUL@example.com ',
      timezone: 'America/New_York',
      checkin_time: '13:00',
      challenge_day: 1,
      challenge_status: 'Active',
    });
    expect(contact.email).toBe('paul@example.com');
    expect(contact.attributes).toMatchObject({
      FIRSTNAME: 'Paul',
      TIMEZONE: 'America/New_York',
      CHECKIN_TIME: '13:00',
      CHALLENGE_DAY: 1,
      CHALLENGE_STATUS: 'Active',
    });
  });

  it('skips network calls when the Brevo secret is not configured', async () => {
    const fetchImpl = vi.fn();
    const result = await syncBrevoContact({ BREVO_LIST_FOUNDATION: '2' }, { email: 'test@example.com' }, fetchImpl);
    expect(result.skipped).toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('upserts Brevo contacts with environment-configured list IDs', async () => {
    const fetchImpl = vi.fn(async () => new Response('', { status: 201 }));
    const result = await syncBrevoContact({ BREVO_API_KEY: 'secret', BREVO_LIST_FOUNDATION: '2' }, { email: 'test@example.com' }, fetchImpl);
    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain('/v3/contacts');
    expect(init.headers['api-key']).toBe('secret');
    expect(JSON.parse(init.body).listIds).toEqual([2]);
  });

  it('renders the three required legal routes with cross-links', () => {
    const disclaimer = disclaimerPage();
    const privacy = privacyPage();
    const terms = termsPage();
    expect(disclaimer).toContain('HEALTH & PHYSICAL ACTIVITY DISCLAIMER');
    expect(privacy).toContain('PRIVACY POLICY');
    expect(terms).toContain('TERMS OF SERVICE');
    for (const page of [disclaimer, privacy, terms]) {
      expect(page).toContain('href="/disclaimer"');
      expect(page).toContain('href="/privacy"');
      expect(page).toContain('href="/terms"');
    }
  });

  it('injects legal links into delegated site HTML', async () => {
    const response = await launchApp.fetch(new Request('https://theflexstandard.com/'), {}, { waitUntil: vi.fn() });
    expect(response.ok).toBe(true);
    const body = await response.text();
    expect(body).toContain('data-flex-global-legal-links');
    expect(body).toContain('href="/disclaimer"');
    expect(body).toContain('href="/privacy"');
    expect(body).toContain('href="/terms"');
  });
});
