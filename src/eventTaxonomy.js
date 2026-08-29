export const FLEX_EVENTS = Object.freeze({
  LEAD_CAPTURED: 'lead_captured',
  FOUNDATION_DAY_3_REACHED: 'foundation_day_3_reached',
  FOUNDATION_COMPLETED: '7_day_foundation_completed',
  MOMENTUM_COMPLETED: '14_day_momentum_completed',
  HABIT_LOCK_COMPLETED: '21_day_habit_lock_completed',
  MASTERY_CHECKOUT_STARTED: '28_day_mastery_checkout_started',
  MASTERY_PURCHASED: '28_day_mastery_purchased',
  MASTERY_COMPLETED: '28_day_mastery_completed',
  INACTIVITY_48H_DETECTED: 'inactivity_48h_detected',
});

export const FLEX_TIERS = Object.freeze({
  FOUNDATION: '7_day_foundation',
  MOMENTUM: '14_day_momentum',
  HABIT_LOCK: '21_day_habit_lock',
  MASTERY: '28_day_mastery',
});

export function normalizeLifecycleEvent(input = {}) {
  const eventName = String(input.event_name || '').trim();
  if (!Object.values(FLEX_EVENTS).includes(eventName)) {
    throw new Error('Unsupported lifecycle event.');
  }

  const userId = String(input.user_id || '').trim().slice(0, 128);
  if (!userId) throw new Error('user_id is required.');

  const tierId = input.tier_id == null ? null : String(input.tier_id).trim();
  if (tierId && !Object.values(FLEX_TIERS).includes(tierId)) {
    throw new Error('Unsupported tier_id.');
  }

  return {
    event_id: String(input.event_id || crypto.randomUUID()),
    event_name: eventName,
    user_id: userId,
    tier_id: tierId,
    lead_source: input.lead_source == null ? null : String(input.lead_source).trim().slice(0, 100),
    occurred_at: Number.isFinite(Number(input.occurred_at)) ? Number(input.occurred_at) : Date.now(),
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
  };
}

export function masteryEligibilityFromEvent(eventName) {
  return eventName === FLEX_EVENTS.HABIT_LOCK_COMPLETED;
}

export function isPurchaseConfirmedEvent(eventName) {
  return eventName === FLEX_EVENTS.MASTERY_PURCHASED;
}
