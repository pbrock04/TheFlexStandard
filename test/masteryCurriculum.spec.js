import { describe, expect, it } from 'vitest';
import { MASTERY_CURRICULUM, MASTERY_STORAGE_KEYS, masteryStageForDay } from '../src/masteryCurriculum.js';

describe('28-Day Mastery curriculum contract', () => {
  it('contains exactly 28 complete Mastery days', () => {
    expect(MASTERY_CURRICULUM).toHaveLength(28);
    expect(MASTERY_CURRICULUM.map(d => d.day)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
  });

  it('has all three tiers and all required curriculum fields every day', () => {
    const required = ['stage','pillar','title','theme','express','standard','excel','mod','habit','message','reflection'];
    for (const day of MASTERY_CURRICULUM) {
      for (const field of required) {
        expect(typeof day[field], `day ${day.day} ${field}`).toBe('string');
        expect(day[field].trim().length, `day ${day.day} ${field}`).toBeGreaterThan(0);
      }
    }
  });

  it('rejects bootcamp, placeholder, and burnout language', () => {
    const text = JSON.stringify(MASTERY_CURRICULUM);
    expect(text).not.toMatch(/\bburpees?\b|jump squats?|plank jacks?|\bEMOM\b|thrusters?|max[- ]?rep|AMRAP|tuck jumps?|century|Lorem ipsum|\bTBD\b|placeholder/i);
  });

  it('uses the approved four-stage boundaries', () => {
    expect(masteryStageForDay(1)).toEqual({ number: 1, name: 'Calibration', pillar: 'FOCUS' });
    expect(masteryStageForDay(7).name).toBe('Calibration');
    expect(masteryStageForDay(8)).toEqual({ number: 2, name: 'Resilience', pillar: 'LEARN' });
    expect(masteryStageForDay(14).name).toBe('Resilience');
    expect(masteryStageForDay(15)).toEqual({ number: 3, name: 'Autonomy', pillar: 'EXECUTE' });
    expect(masteryStageForDay(21).name).toBe('Autonomy');
    expect(masteryStageForDay(22)).toEqual({ number: 4, name: 'Ownership', pillar: 'eXCEL' });
    expect(masteryStageForDay(28).name).toBe('Ownership');
  });

  it('keeps Mastery storage isolated from the free funnel', () => {
    expect(Object.values(MASTERY_STORAGE_KEYS)).toEqual([
      'flexStandard.mastery28.v1',
      'flexStandard.mastery28.standardDays.v1',
      'flexStandard.mastery28.charter.v1'
    ]);
    for (const key of Object.values(MASTERY_STORAGE_KEYS)) {
      expect(key).not.toMatch(/challenge7|momentum14|habit21/);
    }
  });
});
