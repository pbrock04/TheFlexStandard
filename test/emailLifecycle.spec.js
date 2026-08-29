import { describe, expect, it } from 'vitest';
import { FLEX_EVENTS } from '../src/eventTaxonomy.js';
import { buildLaunchEmailPayload, shouldSendLaunchEmail } from '../src/emailLifecycle.js';

describe('minimum launch lifecycle emails', () => {
  it('sends only the three approved soft-launch emails', () => {
    expect(shouldSendLaunchEmail(FLEX_EVENTS.LEAD_CAPTURED)).toBe(true);
    expect(shouldSendLaunchEmail(FLEX_EVENTS.FOUNDATION_COMPLETED)).toBe(true);
    expect(shouldSendLaunchEmail(FLEX_EVENTS.HABIT_LOCK_COMPLETED)).toBe(true);
    expect(shouldSendLaunchEmail(FLEX_EVENTS.FOUNDATION_DAY_3_REACHED)).toBe(false);
    expect(shouldSendLaunchEmail(FLEX_EVENTS.MOMENTUM_COMPLETED)).toBe(false);
    expect(shouldSendLaunchEmail(FLEX_EVENTS.INACTIVITY_48H_DETECTED)).toBe(false);
  });

  it('includes the workbook in the voluntary opt-in welcome email', () => {
    const payload = buildLaunchEmailPayload({
      eventName: FLEX_EVENTS.LEAD_CAPTURED,
      participant: { email: 'member@example.com' },
    });
    expect(payload.route_url).toBe('https://theflexstandard.com/challenges/7-day');
    expect(payload.workbook_url).toBe('https://theflexstandard.com/downloads/flex-7day-foundation-workbook.pdf');
  });

  it('never builds email payloads for anonymous users', () => {
    expect(buildLaunchEmailPayload({ eventName: FLEX_EVENTS.LEAD_CAPTURED, participant: {} })).toBeNull();
  });
});
