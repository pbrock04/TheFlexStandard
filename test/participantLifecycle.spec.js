import { describe, expect, it } from 'vitest';
import { validEmail } from '../src/participantLifecycle.js';
import { FLEX_EVENTS, FLEX_TIERS, normalizeLifecycleEvent, masteryEligibilityFromEvent, isPurchaseConfirmedEvent } from '../src/eventTaxonomy.js';

describe('participant acquisition contract', () => {
  it('accepts a normal lead email and rejects malformed input', () => {
    expect(validEmail('member@example.com')).toBe(true);
    expect(validEmail('not-an-email')).toBe(false);
  });

  it('supports the progress-driven Foundation Day 3 event', () => {
    const event = normalizeLifecycleEvent({
      event_name: FLEX_EVENTS.FOUNDATION_DAY_3_REACHED,
      user_id: 'participant-1',
      tier_id: FLEX_TIERS.FOUNDATION,
    });
    expect(event.event_name).toBe('foundation_day_3_reached');
  });

  it('keeps Mastery eligibility separate from checkout and purchase', () => {
    expect(masteryEligibilityFromEvent(FLEX_EVENTS.HABIT_LOCK_COMPLETED)).toBe(true);
    expect(isPurchaseConfirmedEvent(FLEX_EVENTS.MASTERY_CHECKOUT_STARTED)).toBe(false);
    expect(isPurchaseConfirmedEvent(FLEX_EVENTS.MASTERY_PURCHASED)).toBe(true);
  });
});
