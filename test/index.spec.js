import { describe, it, expect } from 'vitest';
import worker from '../src/worker.js';

describe('The Flex Standard worker', () => {
  it('returns 200 OK for home', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/'), {});
    expect(response.status).toBe(200);
  });

  it('serves the enhanced 7-Day Challenge with optional handoff', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/challenge'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('SKIP FOR NOW — CONTINUE');
    expect(html).toContain('SAVE & CONTINUE');
    expect(html).toContain('/challenges/14-day-get-active');
  });

  it('serves the 14-Day challenge route', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/challenges/14-day-get-active'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('14-DAY GET ACTIVE CHALLENGE');
    expect(html).toContain('flexStandard.challenge7.v1');
  });

  it('keeps legacy momentum route compatible', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/momentum'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('14-DAY GET ACTIVE CHALLENGE');
  });

  it('serves the 21-Day and 28-Day challenge routes', async () => {
    const r21 = await worker.fetch(new Request('https://theflexstandard.com/challenges/21-day-consistency'), {});
    const h21 = await r21.text();
    expect(r21.status).toBe(200);
    expect(h21).toContain('21-Day Consistency Challenge');

    const r28 = await worker.fetch(new Request('https://theflexstandard.com/challenges/28-day-mastery'), {});
    const h28 = await r28.text();
    expect(r28.status).toBe(200);
    expect(h28).toContain('28-Day Mastery');
  });
});
