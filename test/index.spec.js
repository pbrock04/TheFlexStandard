import { describe, it, expect } from 'vitest';
import worker from '../src/index.js';

describe('The Flex Standard worker', () => {
  it('returns 200 OK', async () => {
    const response = await worker.fetch(new Request('https://theflexstandard.com/'));
    expect(response.status).toBe(200);
  });
});
