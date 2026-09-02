import { describe, expect, it, vi } from 'vitest';
import {
  enhanceSevenDayProgression,
  enhanceFourteenDayProgression,
  enhanceTwentyOneDayProgression,
} from '../src/challengeProgression.js';
import { handleMilestoneComplete, VALID_MILESTONE_EVENTS } from '../src/milestoneApi.js';

function mockDb() {
  const run = vi.fn(async () => ({ success: true, meta: { changes: 1 } }));
  const bind = vi.fn(() => ({ run }));
  const prepare = vi.fn(() => ({ bind }));
  return { DB: { prepare }, prepare, bind, run };
}

const legacy14 = "<html><body><script>const sevenKey='flexStandard.challenge7.v1';let sevenComplete=false;try{const s=JSON.parse(localStorage.getItem(sevenKey)||'{}');sevenComplete=Array.isArray(s.completed)&&new Set(s.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=7)).size===7}catch(e){}if(localStorage.getItem('flexStandard.momentum14.unlocked')==='true')sevenComplete=true;</script></body></html>";

describe('free challenge progression integration', () => {
  it('adds Foundation milestone sync using current v2 key', () => {
    const out = enhanceSevenDayProgression('<html><body></body></html>');
    expect(out).toContain('flexStandard.challenge7.v2');
    expect(out).toContain('flexStandard.momentum14.unlocked');
    expect(out).toContain('7_day_foundation_completed');
  });

  it('repairs Foundation -> Momentum gating with current and legacy keys', () => {
    const out = enhanceFourteenDayProgression(legacy14);
    expect(out).toContain("['flexStandard.challenge7.v2','flexStandard.challenge7.v1']");
    expect(out).not.toContain("const sevenKey='flexStandard.challenge7.v1'");
  });

  it('adds Momentum completion unlock and milestone sync', () => {
    const out = enhanceFourteenDayProgression('<html><body></body></html>');
    expect(out).toContain('flexStandard.challenge14.v3');
    expect(out).toContain('flexStandard.habit21.unlocked');
    expect(out).toContain('14_day_momentum_completed');
  });

  it('adds Habit Lock completion milestone sync', () => {
    const out = enhanceTwentyOneDayProgression('<html><body></body></html>');
    expect(out).toContain('flexStandard.challenge21.v2');
    expect(out).toContain('21_day_habit_lock_completed');
  });

  it('does not inject the milestone script twice', () => {
    const once = enhanceSevenDayProgression('<html><body></body></html>');
    const twice = enhanceSevenDayProgression(once);
    expect(twice.match(/id="flex-milestone-sync"/g)).toHaveLength(1);
  });
});

describe('milestone completion API', () => {
  it('uses the exact three-event whitelist', () => {
    expect([...VALID_MILESTONE_EVENTS]).toEqual([
      '7_day_foundation_completed',
      '14_day_momentum_completed',
      '21_day_habit_lock_completed',
    ]);
  });

  it('accepts a valid milestone and uses INSERT OR IGNORE', async () => {
    const db = mockDb();
    const request = new Request('https://theflexstandard.com/api/milestones/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: 'anon_123', event_name: '7_day_foundation_completed' }),
    });
    const response = await handleMilestoneComplete(request, { DB: db.DB });
    expect(response.status).toBe(200);
    expect(db.prepare.mock.calls[0][0]).toContain('INSERT OR IGNORE INTO milestone_events');
    expect(db.bind).toHaveBeenCalledWith('anon_123', '7_day_foundation_completed');
  });

  it('rejects an invalid event', async () => {
    const db = mockDb();
    const request = new Request('https://theflexstandard.com/api/milestones/complete', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: 'anon_123', event_name: 'foundation_7day_completed' }),
    });
    expect((await handleMilestoneComplete(request, { DB: db.DB })).status).toBe(400);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('rejects a missing user id', async () => {
    const db = mockDb();
    const request = new Request('https://theflexstandard.com/api/milestones/complete', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event_name: '7_day_foundation_completed' }),
    });
    expect((await handleMilestoneComplete(request, { DB: db.DB })).status).toBe(400);
  });

  it('rejects invalid JSON', async () => {
    const db = mockDb();
    const request = new Request('https://theflexstandard.com/api/milestones/complete', { method: 'POST', body: '{' });
    expect((await handleMilestoneComplete(request, { DB: db.DB })).status).toBe(400);
  });

  it('rejects non-POST requests', async () => {
    const request = new Request('https://theflexstandard.com/api/milestones/complete');
    expect((await handleMilestoneComplete(request, { DB: {} })).status).toBe(405);
  });

  it('returns 503 when D1 is unavailable', async () => {
    const request = new Request('https://theflexstandard.com/api/milestones/complete', { method: 'POST' });
    expect((await handleMilestoneComplete(request, {})).status).toBe(503);
  });

  it('keeps client milestone sync non-blocking', () => {
    const out = enhanceSevenDayProgression('<html><body></body></html>');
    expect(out).toContain("fetch('/api/milestones/complete'");
    expect(out).toContain('.catch(()=>{})');
  });
});
