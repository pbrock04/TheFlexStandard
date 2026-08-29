import { describe, expect, it } from 'vitest';
import {
  BASE_ACTION_XP,
  buildDailyXpSummary,
  calculateConsecutiveStreak,
  calculateConsistency,
  createXpKey,
  getMasteryLevel,
  getMasteryWeek,
  shouldOfferComeback,
} from '../src/masteryLogic.js';

describe('Mastery logic', () => {
  it('maps XP into the five Mastery levels', () => {
    expect(getMasteryLevel(0).name).toBe('STARTER');
    expect(getMasteryLevel(500).name).toBe('BUILDER');
    expect(getMasteryLevel(1000).name).toBe('CONSISTENT');
    expect(getMasteryLevel(1600).name).toBe('LOCKED IN');
    expect(getMasteryLevel(2200).name).toBe('MASTERY');
    expect(getMasteryLevel(2199).xpToNext).toBe(1);
  });

  it('builds stable idempotency keys for XP awards', () => {
    expect(createXpKey({ userId: 'u1', sourceType: 'daily_action', sourceId: 'day-3-focus' }))
      .toBe('u1:daily_action:day-3-focus');
    expect(() => createXpKey({ userId: 'u1', sourceType: '', sourceId: 'x' })).toThrow();
  });

  it('keeps consecutive streaks mathematically truthful', () => {
    expect(calculateConsecutiveStreak([1, 2, 3, 5, 6])).toBe(2);
    expect(calculateConsecutiveStreak([1, 2, 3])).toBe(3);
    expect(calculateConsecutiveStreak([])).toBe(0);
  });

  it('calculates recent consistency independently of streak', () => {
    expect(calculateConsistency([1, 2, 4, 5], 5)).toEqual({ completed: 4, total: 5, percent: 80 });
  });

  it('offers Comeback Mode after 48 hours', () => {
    const hour = 60 * 60 * 1000;
    expect(shouldOfferComeback(0, 49 * hour)).toBe(false);
    expect(shouldOfferComeback(1000, 1000 + 47 * hour)).toBe(false);
    expect(shouldOfferComeback(1000, 1000 + 48 * hour)).toBe(true);
  });

  it('fades guidance across the four Mastery weeks', () => {
    expect(getMasteryWeek(1)).toEqual({ week: 1, name: 'TAKE CONTROL', guidancePercent: 75 });
    expect(getMasteryWeek(8).guidancePercent).toBe(50);
    expect(getMasteryWeek(15).guidancePercent).toBe(25);
    expect(getMasteryWeek(22).guidancePercent).toBe(0);
  });

  it('marks the standard met only when all four core FLEX actions are complete', () => {
    const complete = buildDailyXpSummary({ focus: true, learn: true, execute: true, excel: true, flex_plus: true });
    expect(complete.standardMet).toBe(true);
    expect(complete.earnedXp).toBe(
      BASE_ACTION_XP.focus + BASE_ACTION_XP.learn + BASE_ACTION_XP.execute + BASE_ACTION_XP.excel + BASE_ACTION_XP.flex_plus,
    );

    const incomplete = buildDailyXpSummary({ focus: true, learn: true, execute: false, excel: true });
    expect(incomplete.standardMet).toBe(false);
  });
});
