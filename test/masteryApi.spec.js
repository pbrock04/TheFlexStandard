import { describe, expect, it } from 'vitest';
import {
  validateActionType,
  validateMasteryDay,
  xpForAction,
} from '../src/masteryApi.js';

describe('Mastery API contract helpers', () => {
  it('accepts only Mastery days 1 through 28', () => {
    expect(validateMasteryDay(1)).toBe(1);
    expect(validateMasteryDay(28)).toBe(28);
    expect(() => validateMasteryDay(0)).toThrow();
    expect(() => validateMasteryDay(29)).toThrow();
    expect(() => validateMasteryDay(2.5)).toThrow();
  });

  it('normalizes supported action types', () => {
    expect(validateActionType('FOCUS')).toBe('focus');
    expect(validateActionType('flex_plus')).toBe('flex_plus');
    expect(() => validateActionType('made_up')).toThrow();
  });

  it('uses base XP for normal FLEX actions while leaving custom missions explicit', () => {
    expect(xpForAction('focus')).toBe(25);
    expect(xpForAction('learn')).toBe(15);
    expect(xpForAction('execute')).toBe(25);
    expect(xpForAction('excel')).toBe(25);
    expect(xpForAction('flex_plus')).toBe(15);
    expect(xpForAction('comeback')).toBe(40);
    expect(xpForAction('mission')).toBe(0);
    expect(xpForAction('event')).toBe(0);
  });
});
