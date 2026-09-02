import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { getOrCreateUserId, FLEX_USER_ID_KEY } from '../src/identity.js';
import { MILESTONE_EVENTS, recordMilestone } from '../src/milestones.js';
import { transformFreeFunnelHtml } from '../src/freeFunnelReleaseWrapper.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const indexSource = read('src/index.js');
const momentumSource = read('src/challenge14.js');
const habitSource = read('src/challenge21.js');
const migrationSource = read('migrations/0006_milestone_events.sql');

function objectCurriculum(source) {
  const match = source.match(/const DAYS=\[([\s\S]*?)\n\];/);
  expect(match, 'DAYS array must exist').toBeTruthy();
  return match[1].split(/\n(?=\{title:)/).map(s => s.replace(/,$/, '').trim()).filter(s => s.startsWith('{title:'));
}

function foundationCurriculum(source) {
  const match = source.match(/7:\{[\s\S]*?days:\[([\s\S]*?)\]\},\n14:\{/);
  expect(match, 'Foundation days array must exist').toBeTruthy();
  return match[1].match(/\['[^']+','[^']+','[^']+'\]/g) || [];
}

const PLACEHOLDER = /Execute your daily standard|\bTBD\b|Lorem ipsum|placeholder/i;

describe('free funnel curriculum release gate', () => {
  it('contains exactly 7 Foundation, 14 Momentum, and 21 Habit Lock days', () => {
    expect(foundationCurriculum(indexSource)).toHaveLength(7);
    expect(objectCurriculum(momentumSource)).toHaveLength(14);
    expect(objectCurriculum(habitSource)).toHaveLength(21);
  });

  it('requires complete daily schema for Momentum and Habit Lock', () => {
    for (const day of [...objectCurriculum(momentumSource), ...objectCurriculum(habitSource)]) {
      for (const field of ['title', 'move', 'alt', 'action', 'message']) {
        expect(day, `${field} missing from ${day}`).toContain(`${field}:'`);
        expect(day, `${field} empty in ${day}`).not.toContain(`${field}:''`);
      }
    }
  });

  it('rejects placeholder curriculum text and duplicate daily titles', () => {
    const content = [
      ...foundationCurriculum(indexSource),
      ...objectCurriculum(momentumSource),
      ...objectCurriculum(habitSource),
    ].join('\n');
    expect(content).not.toMatch(PLACEHOLDER);

    const titles = [...content.matchAll(/title:'([^']+)'/g)].map(match => match[1]);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('free funnel architecture release gate', () => {
  it('keeps canonical storage keys and corrects the legacy Foundation prerequisite at runtime', () => {
    expect(indexSource).toContain("key:'flexStandard.challenge7.v2'");
    expect(momentumSource).toContain("const KEY='flexStandard.challenge14.v3'");
    expect(habitSource).toContain("const KEY='flexStandard.challenge21.v2'");

    const transformed = transformFreeFunnelHtml(momentumSource, '/challenges/14-day');
    expect(transformed).toContain("const sevenKey='flexStandard.challenge7.v2'");
    expect(transformed).not.toContain("const sevenKey='flexStandard.challenge7.v1'");
  });

  it('removes deferred Mastery promotion from the free-funnel homepage copy', () => {
    const sample = '<p>The free challenges are the recommended FLEX path, not a gate. Choose the level that fits where you are today.</p><a href="/challenges/28-day">28-DAY MASTERY</a><a class="card path" href="/challenges/28-day"><small>PREMIUM · MASTERY</small></a></div></section>';
    const transformed = transformFreeFunnelHtml(sample, '/');
    expect(transformed).toContain('7-Day Foundation → 14-Day Momentum → 21-Day Habit Lock');
    expect(transformed).not.toContain('28-DAY MASTERY');
    expect(transformed).not.toContain('PREMIUM · MASTERY');
  });

  it('uses a stable anonymous user id fallback', () => {
    const values = new Map();
    const storage = {
      getItem: key => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
    };
    const cryptoApi = { randomUUID: () => 'test-user-123' };
    expect(getOrCreateUserId(storage, cryptoApi)).toBe('test-user-123');
    expect(getOrCreateUserId(storage, { randomUUID: () => 'different' })).toBe('test-user-123');
    expect(values.get(FLEX_USER_ID_KEY)).toBe('test-user-123');
  });

  it('whitelists exactly the three free-funnel completion milestones', () => {
    expect([...MILESTONE_EVENTS]).toEqual([
      '7_day_foundation_completed',
      '14_day_momentum_completed',
      '21_day_habit_lock_completed',
    ]);
  });

  it('records milestone completions with duplicate-safe SQL', async () => {
    let sql = '';
    let bound = [];
    const env = {
      DB: {
        prepare(statement) {
          sql = statement;
          return {
            bind(...args) {
              bound = args;
              return { run: async () => ({ meta: { changes: 1 } }) };
            },
          };
        },
      },
    };

    const result = await recordMilestone(env, {
      userId: 'abc',
      eventName: '21_day_habit_lock_completed',
      completedAt: 123,
    });

    expect(result.ok).toBe(true);
    expect(result.created).toBe(true);
    expect(sql).toContain('ON CONFLICT(user_id, event_name) DO NOTHING');
    expect(bound.slice(0, 3)).toEqual(['abc', '21_day_habit_lock_completed', 123]);
    expect(migrationSource).toContain('UNIQUE(user_id, event_name)');
  });
});
