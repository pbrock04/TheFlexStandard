export const MASTERY_LEVELS = [
  { name: 'STARTER', minXp: 0 },
  { name: 'BUILDER', minXp: 500 },
  { name: 'CONSISTENT', minXp: 1000 },
  { name: 'LOCKED IN', minXp: 1600 },
  { name: 'MASTERY', minXp: 2200 },
];

export const BASE_ACTION_XP = Object.freeze({
  focus: 25,
  learn: 15,
  execute: 25,
  excel: 25,
  flex_plus: 15,
  flex_proof: 25,
  comeback: 40,
  halfway: 50,
  mastery_complete: 100,
});

export const CORE_ACHIEVEMENTS = Object.freeze([
  { key: 'FIRST_STEP', title: 'FIRST STEP', description: 'Meet the Standard for the first time.' },
  { key: 'FIRST_WEEK', title: 'FIRST WEEK', description: 'Complete seven Standard days.' },
  { key: 'ON_FIRE', title: 'ON FIRE', description: 'Build a truthful 7-day streak.' },
  { key: 'DECISION_MAKER', title: 'DECISION MAKER', description: 'Reach the Day 14 halfway checkpoint.' },
  { key: 'COMEBACK', title: 'COMEBACK', description: 'Return and complete a Comeback action.' },
  { key: 'OWN_IT', title: 'OWN IT', description: 'Reach Day 21 of Mastery.' },
  { key: 'SELF_STARTER', title: 'SELF STARTER', description: 'Reach Day 25 and set your own plan.' },
  { key: 'MASTERY', title: 'MASTERY', description: 'Complete the 28-Day Mastery program.' },
]);

export function normalizeXp(value) {
  const xp = Number(value);
  if (!Number.isFinite(xp) || xp < 0) return 0;
  return Math.floor(xp);
}

export function getMasteryLevel(totalXp) {
  const xp = normalizeXp(totalXp);
  let current = MASTERY_LEVELS[0];
  let next = null;

  for (let i = 0; i < MASTERY_LEVELS.length; i += 1) {
    const candidate = MASTERY_LEVELS[i];
    if (xp >= candidate.minXp) current = candidate;
    else {
      next = candidate;
      break;
    }
  }

  const nextThreshold = next?.minXp ?? null;
  return {
    name: current.name,
    totalXp: xp,
    nextLevel: next?.name ?? null,
    nextThreshold,
    xpToNext: nextThreshold == null ? 0 : Math.max(0, nextThreshold - xp),
  };
}

export function createXpKey({ userId, sourceType, sourceId }) {
  const parts = [userId, sourceType, sourceId].map((part) => String(part ?? '').trim());
  if (parts.some((part) => !part)) throw new Error('userId, sourceType and sourceId are required');
  return parts.join(':');
}

export function calculateConsistency(completedDays, windowSize = 14) {
  const size = Math.max(1, Math.floor(Number(windowSize) || 14));
  const unique = new Set(
    (Array.isArray(completedDays) ? completedDays : [])
      .map(Number)
      .filter((day) => Number.isInteger(day) && day > 0),
  );

  const maxDay = unique.size ? Math.max(...unique) : 0;
  const start = Math.max(1, maxDay - size + 1);
  let completedInWindow = 0;
  for (let day = start; day <= maxDay; day += 1) {
    if (unique.has(day)) completedInWindow += 1;
  }

  const denominator = maxDay === 0 ? size : Math.min(size, maxDay);
  const percent = Math.round((completedInWindow / denominator) * 100);

  return {
    completed: completedInWindow,
    total: denominator,
    percent: Number.isFinite(percent) ? percent : 0,
  };
}

export function calculateConsecutiveStreak(completedDayNumbers) {
  const days = [...new Set(
    (Array.isArray(completedDayNumbers) ? completedDayNumbers : [])
      .map(Number)
      .filter((day) => Number.isInteger(day) && day > 0),
  )].sort((a, b) => a - b);

  if (!days.length) return 0;

  let streak = 1;
  for (let i = days.length - 1; i > 0; i -= 1) {
    if (days[i] - days[i - 1] === 1) streak += 1;
    else break;
  }
  return streak;
}

export function shouldOfferComeback(lastCompletedAt, now = Date.now()) {
  const last = Number(lastCompletedAt);
  const current = Number(now);
  if (!Number.isFinite(last) || last <= 0 || !Number.isFinite(current) || current <= last) return false;
  return current - last >= 48 * 60 * 60 * 1000;
}

export function getMasteryWeek(day) {
  const value = Math.min(28, Math.max(1, Math.floor(Number(day) || 1)));
  if (value <= 7) return { week: 1, name: 'TAKE CONTROL', guidancePercent: 75 };
  if (value <= 14) return { week: 2, name: 'MAKE DECISIONS', guidancePercent: 50 };
  if (value <= 21) return { week: 3, name: 'OWN IT', guidancePercent: 25 };
  return { week: 4, name: 'LIVE THE STANDARD', guidancePercent: 0 };
}

export function buildDailyXpSummary(actions = {}) {
  const normalized = {
    focus: Boolean(actions.focus),
    learn: Boolean(actions.learn),
    execute: Boolean(actions.execute),
    excel: Boolean(actions.excel),
    flex_plus: Boolean(actions.flex_plus),
    flex_proof: Boolean(actions.flex_proof),
  };

  const earned = Object.entries(normalized)
    .filter(([, complete]) => complete)
    .reduce((sum, [key]) => sum + (BASE_ACTION_XP[key] || 0), 0);

  const requiredComplete = ['focus', 'learn', 'execute', 'excel'].every((key) => normalized[key]);
  return { actions: normalized, earnedXp: earned, standardMet: requiredComplete };
}

export function evaluateMasteryAchievements({
  completedStandardDays = [],
  currentDay = 1,
  comebackCount = 0,
} = {}) {
  const days = [...new Set(
    (Array.isArray(completedStandardDays) ? completedStandardDays : [])
      .map(Number)
      .filter((day) => Number.isInteger(day) && day >= 1 && day <= 28),
  )].sort((a, b) => a - b);

  const day = Math.min(28, Math.max(1, Math.floor(Number(currentDay) || 1)));
  const streak = calculateConsecutiveStreak(days);
  const unlocked = new Set();

  if (days.length >= 1) unlocked.add('FIRST_STEP');
  if (days.length >= 7) unlocked.add('FIRST_WEEK');
  if (streak >= 7) unlocked.add('ON_FIRE');
  if (day >= 14 || days.includes(14)) unlocked.add('DECISION_MAKER');
  if (Number(comebackCount) > 0) unlocked.add('COMEBACK');
  if (day >= 21 || days.includes(21)) unlocked.add('OWN_IT');
  if (day >= 25 || days.includes(25)) unlocked.add('SELF_STARTER');
  if (days.includes(28)) unlocked.add('MASTERY');

  return CORE_ACHIEVEMENTS.filter((achievement) => unlocked.has(achievement.key));
}
