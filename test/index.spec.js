import { describe, it, expect } from 'vitest';
import worker from '../src/worker.js';

describe('The Flex Standard worker', () => {
  it('returns 200 OK for home', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/'), {});
    expect(response.status).toBe(200);
  });

  it('serves the enhanced 7-Day Challenge', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/challenge'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('SKIP FOR NOW — CONTINUE');
    expect(html).toContain('SAVE & CONTINUE');
  });

  it('serves the Momentum unlocked page', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/momentum'), {});
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('MOMENTUM UNLOCKED');
  });
});
