import { describe, expect, it } from 'vitest';
import { FLEX_EVENTS, FLEX_TIERS, normalizeLifecycleEvent, masteryEligibilityFromEvent, isPurchaseConfirmedEvent } from '../src/eventTaxonomy.js';

describe('advertising lifecycle taxonomy', () => {
  it('accepts the locked Foundation lead event', () => {
    const event = normalizeLifecycleEvent({
      event_id: 'evt-1',
      event_name: FLEX_EVENTS.LEAD_CAPTURED,
      user_id: 'user-1',
      tier_id: FLEX_TIERS.FOUNDATION,
      lead_source: FLEX_TIERS.FOUNDATION,
      occurred_at: 123,
    });
    expect(event.event_name).toBe('lead_captured');
    expect(event.tier_id).toBe('7_day_foundation');
  });

  it('makes Mastery eligible only from Habit Lock completion', () => {
    expect(masteryEligibilityFromEvent(FLEX_EVENTS.HABIT_LOCK_COMPLETED)).toBe(true);
    expect(masteryEligibilityFromEvent(FLEX_EVENTS.FOUNDATION_COMPLETED)).toBe(false);
  });

  it('does not treat checkout start as purchase confirmation', () => {
    expect(isPurchaseConfirmedEvent(FLEX_EVENTS.MASTERY_CHECKOUT_STARTED)).toBe(false);
    expect(isPurchaseConfirmedEvent(FLEX_EVENTS.MASTERY_PURCHASED)).toBe(true);
  });

  it('rejects unknown public event names', () => {
    expect(() => normalizeLifecycleEvent({ event_name: 'purchase', user_id: 'u1' })).toThrow('Unsupported lifecycle event.');
  });
});
