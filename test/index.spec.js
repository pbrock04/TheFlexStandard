import { describe, it, expect } from 'vitest';
import worker from '../src/worker.js';

describe('The Flex Standard worker', () => {
  it('returns 200 OK for home', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/'), {});
    expect(response.status).toBe(200);
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
  });

  it('serves the enhanced 7-Day Challenge on both routes', async () => {
    for (const path of ['/challenge', '/challenges/7-day']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('SKIP FOR NOW — CONTINUE');
      expect(html).toContain('SAVE & CONTINUE');
      expect(html).toContain('/challenges/14-day');
    }
  });

  it('serves the approved 14-Day Momentum challenge', async () => {
    for (const path of ['/challenges/14-day', '/challenges/14-day-get-active', '/momentum']) {
      const response = await worker.fetch(new Request('https://theflexstandard.com' + path), {});
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('14-DAY MOMENTUM');
      expect(html).toContain('Start Moving');
      expect(html).toContain('flexStandard.challenge7.v1');
      expect(html).toContain('21-DAY HABIT LOCK');
    }
  });

  it('serves Habit Lock on current and compatibility routes', async () => {
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
      expect(html).not.toContain('VIEW 28-DAY MASTERY');
    }
  });

  it('keeps 28-Day Mastery locked while launch mode is closed', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/challenges/28-day'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('28-Day Mastery is locked.');
  });
});
