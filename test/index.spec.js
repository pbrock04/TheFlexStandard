import { describe, it, expect } from 'vitest';
import worker from '../src/worker.js';

describe('The Flex Standard worker', () => {
  it('returns 200 OK for home with visible health disclaimer access', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('Health &amp; Fitness Disclaimer');
    expect(html).toContain('/health-disclaimer');
    expect(html).toContain('not a substitute for individualized medical advice');
    expect(html).toContain('data-flex-health-menu');
    expect(html).toContain('HEALTH &amp; FITNESS DISCLAIMER');
  });

  it('serves the full health and fitness disclaimer page', async () => {
    for (const path of ['/health-disclaimer', '/health-and-fitness-disclaimer']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('HEALTH &amp; FITNESS DISCLAIMER');
      expect(html).toContain('Not Medical Advice');
      expect(html).toContain('Before Starting');
      expect(html).toContain('During Exercise');
      expect(html).toContain('Participation &amp; Risk');
      expect(html).toContain('Individual results vary');
    }
  });

  it('serves the active free challenge hub', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/challenges'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('Your Challenges');
    expect(html).toContain('7-Day Foundation');
    expect(html).toContain('14-Day Momentum');
    expect(html).toContain('21-Day Habit Lock');
    expect(html).toContain('ACTIVE V1 JOURNEY');
    expect(html).toContain('No purchase is required.');
    expect(html).toContain('More Is Coming');
    expect(html).toContain('NOT PART OF V1');
    expect(html).toContain('/health-disclaimer');
  });

  it('serves the locked-in 7-Day Foundation with its next-step path and safety notice on both routes', async () => {
    for (const path of ['/challenge', '/challenges/7-day']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('7-DAY FOUNDATION');
      expect(html).toContain('CHALLENGE COMPLETE');
      expect(html).toContain('/challenges/14-day');
      expect(html).toContain('GO TO 14-DAY CHALLENGE');
      expect(html).toContain('BEFORE YOU START');
      expect(html).toContain('not medical advice');
      expect(html).toContain('READ THE FULL HEALTH &amp; FITNESS DISCLAIMER');
    }
  });

  it('serves the approved 14-Day Momentum challenge with a safety notice', async () => {
    for (const path of ['/challenges/14-day', '/challenges/14-day-get-active', '/momentum']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('14-DAY MOMENTUM');
      expect(html).toContain('Start Moving');
      expect(html).toContain('flexStandard.challenge7.v1');
      expect(html).toContain('21-DAY HABIT LOCK');
      expect(html).toContain('BEFORE YOU START');
      expect(html).toContain('/health-disclaimer');
    }
  });

  it('serves Habit Lock on current and compatibility routes with a safety notice', async () => {
    for (const path of ['/challenges/21-day', '/challenges/21-day-consistency']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('21-DAY HABIT LOCK');
      expect(html).toContain('flexStandard.challenge14.v3');
      expect(html).toContain('WELCOME BACK.');
      expect(html).toContain('CONTINUE WHERE I LEFT OFF');
      expect(html).toContain('You Completed the Free FLEX Path.');
      expect(html).toContain('Your FLEX Maintenance Standard');
      expect(html).toContain('COPY MY COMPLETION MESSAGE');
      expect(html).toContain('BEFORE YOU START');
      expect(html).toContain('/health-disclaimer');
      expect(html).not.toContain('VIEW 28-DAY MASTERY');
    }
  });

  it('keeps 28-Day Mastery locked while launch mode is closed', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/challenges/28-day'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('28-Day Mastery is locked.');
    expect(html).toContain('/health-disclaimer');
  });
});
