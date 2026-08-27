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

  it('keeps 21-Day and 28-Day compatibility routes active', async () => {
    const r21 = await worker.fetch(new Request('https://theflexstandard.com/challenges/21-day'), {});
    const h21 = await r21.text();
    expect(r21.status).toBe(200);
    expect(h21).toContain('21-Day Consistency Challenge');

    const r28 = await worker.fetch(new Request('https://theflexstandard.com/challenges/28-day'), {});
    const h28 = await r28.text();
    expect(r28.status).toBe(200);
    expect(h28).toContain('28-Day Mastery');
  });
});
