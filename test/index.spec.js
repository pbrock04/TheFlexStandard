import { describe, it, expect, vi } from 'vitest';
import worker from '../src/index.js';

describe('Team Flex Slack Worker', () => {
  const env = { SLACK_BOT_TOKEN: 'xoxb-mock-test-token' };
  const ctx = {
    waitUntil: vi.fn((promise) => promise),
  };

  it('handles url_verification challenge', async () => {
    const request = new Request('https://the-flex-standard.pbrock04.workers.dev/slack/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'url_verification',
        challenge: 'test-challenge-12345',
      }),
    });

    const response = await worker.fetch(request, env, ctx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.challenge).toBe('test-challenge-12345');
  });

  it('ignores bot messages to prevent loops', async () => {
    const request = new Request('https://the-flex-standard.pbrock04.workers.dev/slack/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'event_callback',
        event: {
          type: 'message',
          bot_id: 'B12345678',
          text: 'TEAM FLEX ONLINE ✅',
          channel: 'C12345',
        },
      }),
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    expect(ctx.waitUntil).not.toHaveBeenCalled();
  });
});