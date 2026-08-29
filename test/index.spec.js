import { describe, it, expect } from 'vitest';
import worker from '../src/worker.js';

describe('The Flex Standard worker', () => {
  it('returns 200 OK for home', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/'), {});
    expect(response.status).toBe(200);
  });

  it('serves the challenge hub', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/challenges'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('Your Challenges');
    expect(html).toContain('14-Day Momentum');
  });

  it('serves frictionless 7-Day Foundation with optional workbook and progress opt-in', async () => {
    for (const path of ['/challenge', '/challenges/7-day']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('START THE 7-DAY FOUNDATION');
      expect(html).toContain('OPTIONAL FREE EXTRA');
      expect(html).toContain('printable 7-Day Foundation Workbook');
      expect(html).toContain('You can keep doing the challenge without signing up.');
      expect(html).toContain('progress_snapshot');
      expect(html).toContain('/api/participants/start');
      expect(html).toContain('/api/participants/progress');
      expect(html).toContain('7_day_foundation');
      expect(html).not.toContain('participant-gate');
      expect(html).not.toContain('CONTINUE WITHOUT SIGNING UP');
    }
  });

  it('serves legal and safety pages', async () => {
    for (const path of ['/health-disclaimer', '/privacy', '/terms']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      expect(response.status).toBe(200);
    }
    const challenge = await worker.fetch(new Request('https://theflexstandard.com/challenges/7-day'), {});
    const html = await challenge.text();
    expect(html).toContain('Health & Safety:');
    expect(html).toContain('/health-disclaimer');
  });

  it('serves the approved 14-Day Momentum challenge with participant sync', async () => {
    for (const path of ['/challenges/14-day', '/challenges/14-day-get-active', '/momentum']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('14-DAY MOMENTUM');
      expect(html).toContain('Start Moving');
      expect(html).toContain('flexStandard.challenge7.v1');
      expect(html).toContain('21-DAY HABIT LOCK');
      expect(html).toContain('14_day_momentum');
      expect(html).toContain('/api/participants/progress');
    }
  });

  it('serves 21-Day Habit Lock and keeps Mastery compatibility route active', async () => {
    const r21 = await worker.fetch(new Request('https://theflexstandard.com/challenges/21-day'), {});
    const h21 = await r21.text();
    expect(r21.status).toBe(200);
    expect(h21).toContain('21-Day Habit Lock');
    expect(h21).toContain('flexStandard.challenge14.v3');
    expect(h21).toContain('21_day_habit_lock');
    expect(h21).toContain('Mastery eligibility');

    const r28 = await worker.fetch(new Request('https://theflexstandard.com/challenges/28-day'), {});
    const h28 = await r28.text();
    expect(r28.status).toBe(200);
    expect(h28).toContain('28-Day Mastery');
  });
});
