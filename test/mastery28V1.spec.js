import { describe, expect, it } from 'vitest';
import {
  MASTERY_CURRICULUM,
  MASTERY_STORAGE_KEYS,
  completeMasteryDay,
  completeStageReview,
  createMasteryState,
  getStageForDay,
  isCharterValid,
  normalizeMasteryState,
  selectMasteryTier,
  shouldOfferComeback,
} from '../src/mastery28Core.js';
import { mastery28Page } from '../src/mastery28Page.js';

const FREE_KEYS = ['flexStandard.challenge7.v2','flexStandard.challenge14.v3','flexStandard.challenge21.v2'];
const FREE_MILESTONES = ['7_day_foundation_completed','14_day_momentum_completed','21_day_habit_lock_completed'];

describe('28-Day Mastery V1 contract', () => {
  it('contains exactly 28 complete curriculum days', () => {
    expect(MASTERY_CURRICULUM).toHaveLength(28);
    const required = ['day','stage','stageNumber','pillar','title','theme','express','standard','excel','modification','action','message','reflection'];
    for (const day of MASTERY_CURRICULUM) for (const field of required) expect(String(day[field] ?? '').trim(), `Day ${day.day} ${field}`).not.toBe('');
  });

  it('has no placeholder or quarantined bootcamp language', () => {
    expect(JSON.stringify(MASTERY_CURRICULUM)).not.toMatch(/\bTBD\b|lorem ipsum|placeholder|AMRAP|burpee|tuck jump|century set|plank jack|thruster|max-rep/i);
  });

  it('uses the approved four stage boundaries', () => {
    for (let day = 1; day <= 28; day += 1) {
      const stage = getStageForDay(day);
      if (day <= 7) expect([stage.number, stage.name, stage.pillar]).toEqual([1, 'Calibration', 'FOCUS']);
      else if (day <= 14) expect([stage.number, stage.name, stage.pillar]).toEqual([2, 'Resilience', 'LEARN']);
      else if (day <= 21) expect([stage.number, stage.name, stage.pillar]).toEqual([3, 'Autonomy', 'EXECUTE']);
      else expect([stage.number, stage.name, stage.pillar]).toEqual([4, 'Ownership', 'eXCEL']);
    }
  });

  it('persists tier choices independently by day', () => {
    let state = createMasteryState(1);
    state = selectMasteryTier(state, 1, 'express');
    state = selectMasteryTier(state, 2, 'excel');
    expect(state.selectedTierByDay['1']).toBe('express');
    expect(state.selectedTierByDay['2']).toBe('excel');
  });

  it('counts an Express Floor Day as a Standard Day and never double counts', () => {
    let state = createMasteryState(1);
    state = completeMasteryDay(state, 1, { tier: 'express', floorDay: true, now: 2 });
    expect(state.standardDays).toBe(1);
    expect(state.floorDays).toEqual([1]);
    const normalized = normalizeMasteryState({ ...state, completedDays: [1, 1, 1], standardDays: 99 }, 3);
    expect(normalized.standardDays).toBe(1);
    expect(normalized.completedDays).toEqual([1]);
  });

  it('keeps completed progress after a gap and offers Comeback Mode after 48 hours', () => {
    let state = createMasteryState(1);
    state = completeMasteryDay(state, 1, { now: 10_000 });
    const later = 10_000 + (49 * 60 * 60 * 1000);
    expect(shouldOfferComeback(state.lastCompletedAt, later)).toBe(true);
    expect(normalizeMasteryState(state, later).completedDays).toEqual([1]);
  });

  it('requires stage reviews before the next stage', () => {
    let state = createMasteryState(1);
    for (let day = 1; day <= 7; day += 1) state = completeMasteryDay(state, day, { now: day + 1 });
    expect(() => completeMasteryDay(state, 8, { now: 20 })).toThrow(/stage reviews/i);
    state = completeStageReview(state, 7, 'Keep the floor simple.', 21);
    state = completeMasteryDay(state, 8, { now: 22 });
    expect(state.completedDays).toContain(8);
  });

  it('requires sequential completion and a valid state before Day 28', () => {
    let state = createMasteryState(1);
    expect(() => completeMasteryDay(state, 28, { now: 2 })).toThrow();
    for (let day = 1; day <= 27; day += 1) {
      if ([8, 15, 22].includes(day)) state = completeStageReview(state, day - 1, `Review ${day - 1}`, day * 10);
      state = completeMasteryDay(state, day, { now: day * 100 });
    }
    state = completeMasteryDay(state, 28, { tier: 'standard', now: 3000 });
    expect(state.completedDays).toHaveLength(28);
    expect(state.completedAt).toBe(3000);
  });

  it('keeps Mastery storage isolated from free challenge keys', () => {
    expect(Object.values(MASTERY_STORAGE_KEYS).some(key => FREE_KEYS.includes(key))).toBe(false);
  });

  it('validates the complete Personal FLEX Charter contract', () => {
    const charter = { participantName:'Test User',primaryFocus:'Consistency',learned:'Adapt instead of quit',executeConsistently:'Move daily',excelNext:'Progress gradually',movementFloor:'Five minutes',comebackRule:'Return next opportunity',nonNegotiable1:'Prepare',nonNegotiable2:'Move',nonNegotiable3:'Reflect',motivationRule:'Use the floor',standardStatement:'I return and keep going' };
    expect(isCharterValid(charter)).toBe(true);
    expect(isCharterValid({ ...charter, comebackRule: '' })).toBe(false);
  });

  it('renders staging UI, three tiers, Comeback Mode and Charter with no payment code', () => {
    const html = mastery28Page();
    expect(html).toContain('PRIVATE STAGING · 28-DAY MASTERY');
    expect(html).toContain('EXPRESS');
    expect(html).toContain('STANDARD');
    expect(html).toContain('eXCEL');
    expect(html).toContain('COMEBACK MODE');
    expect(html).toContain('PERSONAL FLEX CHARTER');
    expect(html).not.toMatch(/stripe|checkout|billing/i);
  });

  it('visually holds the completed stage day while its review is pending', () => {
    const html = mastery28Page();
    expect(html).toContain('if(pending)viewDay=pending');
    expect(html).toContain('Complete the stage review below to unlock the next stage.');
    expect(html).toContain('b.disabled=Boolean(pending)');
  });

  it('does not emit or reference any free-funnel milestone event', () => {
    const source = JSON.stringify(MASTERY_CURRICULUM) + mastery28Page();
    for (const event of FREE_MILESTONES) expect(source).not.toContain(event);
  });
});
