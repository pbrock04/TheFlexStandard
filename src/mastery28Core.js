export const MASTERY_STORAGE_KEYS = Object.freeze({
  progress: 'flexStandard.mastery28.v1',
  standardDays: 'flexStandard.mastery28.standardDays.v1',
  charter: 'flexStandard.mastery28.charter.v1',
});

export const MASTERY_TIERS = Object.freeze(['express', 'standard', 'excel']);
export const STAGE_REVIEW_DAYS = Object.freeze([7, 14, 21]);

const STAGES = Object.freeze([
  { number: 1, name: 'Calibration', pillar: 'FOCUS', start: 1, end: 7, message: 'Learn how the standard fits the life you actually have. Honest capacity beats unrealistic intensity.' },
  { number: 2, name: 'Resilience', pillar: 'LEARN', start: 8, end: 14, message: 'Life disrupting the plan does not mean failure. Adapt, return, and protect the floor.' },
  { number: 3, name: 'Autonomy', pillar: 'EXECUTE', start: 15, end: 21, message: 'Make good decisions without needing every step prescribed. Choose what fits and execute it.' },
  { number: 4, name: 'Ownership', pillar: 'eXCEL', start: 22, end: 28, message: 'This is no longer a challenge you follow. Define the standard you will own after Day 28.' },
]);

const RAW_DAYS = [
  [1,'The Foundation','Squat Logic','Air Squats: 2x10','3x12 Squats, 2x20s Plank','4x15 Squats, 3x30s Plank, 2x10 Lunges','Chair Sit-to-Stand','Phone away 1hr before bed'],
  [2,'Upper Integrity','Push Mechanics','Incline Pushups: 2x8','3x10 Pushups, 3x12 Squats','4x12 Pushups, 4x15 Squats, 2x20s Deadbugs','Wall Pushups','Drink 500ml water on wake'],
  [3,'Core Stability','Static Strength','Plank: 3x20s','3x30s Plank, 3x10 Bird-Dogs','4x45s Plank, 4x12 Bird-Dogs, 3x15 Deadbugs','Knee Planks','5-minute morning sunlight'],
  [4,'Posterior Chain','Hinge/Glutes','Glute Bridges: 2x15','3x15 Bridges, 3x12 Air Squats','4x20 Bridges, 4x15 Squats, 3x8 Superman','Assisted Bridge','No liquid calories today'],
  [5,'Lateral Power','Side Movement','Lateral Steps: 3x10/side','3x10 Side Steps, 3x10 Pushups','4x12 Side Steps, 4x12 Pushups, 3x15 Side Lunges','Supported Side Step','Audit 3 digital distractions'],
  [6,'Unilateral Load','Balance/Split','Split Squats: 2x8/side','3x10 Split Squats, 3x20s Plank','4x12 Split Squats, 4x30s Plank, 3x10 Step-ups','Wall-supported Split Squat',"Prep tomorrow's clothes/mat"],
  [7,'Full Calibration','Review/Flow','5 min Mobility Flow','10 min Flow + 2x8 Squat/Push','15 min Flow + 3x10 Squat/Push/Plank','Seated Stretch Flow','Reflect: Week 1 Win/Loss'],
  [8,'Friction Test','The Hinge','RDL (BW): 2x12','3x15 RDL, 3x10 Pushups','4x15 RDL, 4x12 Pushups, 3x30s Iso-Bridge','PVC/Broomstick Hinge','Identify your Floor time'],
  [9,'Under Pressure','Tempo Work','Slow Squats: 3x8','3x10 Slow Squats, 3x12 Glute Bridges','4x12 Slow Squats, 4x15 Bridges, 3x30s Plank','High Incline Hold','10-minute walk with no phone'],
  [10,'The Midsection','Rotation/Core','Deadbugs: 3x10','3x12 Deadbugs, 3x12 Glute Bridges','4x15 Deadbugs, 4x15 Bridges, 3x20s Side Plank','Feet-on-floor twists','No snoozing the alarm'],
  [11,'Resilience Walk','Zone 2 / Tempo','10 min Brisk Walk','20 min Interval Walk','30 min Incline/Steady Walk','Level-ground steady pace','List 3 Resilience Triggers'],
  [12,'Upper Volume','Push Capacity','Incline Pushups: 3x8','3x10 Pushups, 3x12 Squats','4x12 Pushups, 4x15 Squats, 3x30s Plank','Elevated-surface Push','One meal: protein first'],
  [13,'Lower Volume','Lunge Depth','Reverse Lunges: 3x10','3x12 Lunges, 3x10 Diamond Incline Pushups','4x15 Lunges, 4x12 Diamond Incline Pushups, 3x30s Wall Sit','Small-range Reverse Lunges','Set your Comeback trigger'],
  [14,'Midpoint Audit','Capacity Review','2 rounds: 10 controlled squats and 6 pushups; focus on smooth breathing','3 rounds: 12 controlled squats, 8 pushups, 20s plank','4 rounds: 12 tempo squats (3s down), 10 pushups, 30s plank, 12 glute bridges','Timed holds or assisted reps','Complete the midpoint review'],
  [15,'Choice Circuit A','Push + Squat','Box Squats 2x10 or Incline Pushups 2x8 + 5m walk','3 rounds: 10 Squats and 8 Incline Pushups + 10m walk','4 rounds: 12 Tempo Squats (3s down), 10 Pushups, 25s Plank + 12m walk','Choose the supported version that preserves form',"Commit to today's tier early"],
  [16,'Choice Circuit B','Hinge + Core','Glute Bridges 2x12 or Deadbugs 2x10 + 5m walk','3 rounds: 12 Glute Bridges and 10 Deadbugs + 10m walk','4 rounds: 15 Glute Bridges (2s hold), 12 Deadbugs, 10 Bird-Dogs + 12m walk','Choose the supported version that preserves form','Protect one 50-minute deep-work block'],
  [17,'The Audit','Tempo Control','Slow Squats: 3x10','3x12 Slow Squat/Pushup','4x15 Slow Reps + Iso-Hold','Use a 3-second eccentric with a comfortable range','Audit evening scrolling'],
  [18,'Steady Drive','Zone 2 Focus','10 min Walk','20 min Walk','30 min Walk','Steady step-ups or level walking','Stand every 60 minutes'],
  [19,'Iso-Tension','Stillness/Power','Wall Sit: 4x45s','3x60s Wall Sit + Pushups','4x75s Wall Sit + Core','Use a higher wall-sit position','Practice The Floor now'],
  [20,'Compound Coordination','Kinetic Chain Integration','2 rounds: 8 reverse lunges (4/side), 8 glute bridges + 5m walk','3 rounds: 10 reverse lunges (5/side), 10 glute bridges, 8 incline pushups','4 rounds: 12 reverse lunges, 12 glute bridges, 10 pushups, 30s plank','Chair-assisted reverse step-backs','Review your FLEX Charter draft'],
  [21,'Autonomy Integration','Guided Personal Selection','10m brisk walk + 5m gentle personal stretch flow','15m walk + 2 rounds of your 2 favorite Stage 3 movements (10 reps each)','20m walk + 3 rounds of your 3 favorite Stage 3 movements (10 reps each) + 5m mobility','Choose comfortable Stage 3 movements you can repeat','Finalize your Stage 3 reflection'],
  [22,'Mastery Focus 1','The Squat','Air Squats: 3x15','4x15 Squats + 3x30s Plank','5x15 Squats, 4x45s Plank, 3x12 Lunges','Chair Squat focus','Set your lifetime Floor time'],
  [23,'Mastery Focus 2','The Push','2 sets: 8 incline/floor pushups with a slow 2s descent + 5m walk','3 sets: 10 pushups (3s descent), 10 air squats, 25s plank','4 sets: 12 tempo pushups, 12 squats, 12 glute bridges, 35s plank','Elevated / Incline Pushup','Use one brief intentional discomfort practice that is safe for you'],
  [24,'Mastery Focus 3','The Core','Slow Deadbugs: 3x12','4x12 Deadbugs + 3x12 Bridges','5x12 Deadbugs, 4x15 Bridges, 3x15 Side Lunges','Slow Deadbugs with reduced range','Digital fast for 3 hours'],
  [25,'The Standard Run','Endurance','12 min Brisk Walk','24 min Brisk Walk','36 min Brisk Walk','Power Walk at a comfortable pace','Plan your post-Day 28 schedule'],
  [26,'Integrated Power','Full Body','3x12 Squat-to-Reach','4x12 Reach + 3x12 Pushups','5x12 Reach, 4x12 Pushups, 3x10 Step-ups','Squat-to-Overhead Reach with supported depth','Confirm 3 Non-Negotiables'],
  [27,'Pre-Charter Prep','Active Recovery','10 min Mobility Flow','20 min Mobility/Yoga','30 min Full Body Mobility','Seated Mobility','Clean your movement space'],
  [28,'THE GRADUATION','Mastery Session','The Floor Session: 5 minutes of your safest repeatable movement pattern','The Standard Session: 20 minutes using the movement patterns that best fit you','The eXcel Session: 35 minutes using sustainable movement, walking, and mobility','Use your best proven modification','Build your Personal FLEX Charter'],
];

function stageForDay(day) {
  return STAGES.find(stage => day >= stage.start && day <= stage.end) || STAGES[0];
}

export const MASTERY_CURRICULUM = Object.freeze(RAW_DAYS.map(row => {
  const [day, title, theme, express, standard, excel, modification, action] = row;
  const stage = stageForDay(day);
  return Object.freeze({
    day,
    stage: stage.name,
    stageNumber: stage.number,
    pillar: stage.pillar,
    title,
    theme,
    express,
    standard,
    excel,
    modification,
    action,
    message: stage.message,
    reflection: `Did I choose the tier that fit my real life today? What did ${title} teach me about protecting my floor?`,
  });
}));

export function createMasteryState(now = Date.now()) {
  return {
    version: 1,
    currentDay: 1,
    completedDays: [],
    selectedTierByDay: {},
    floorDays: [],
    reflections: {},
    stageReviews: {},
    standardDays: 0,
    startedAt: now,
    lastCompletedAt: null,
    completedAt: null,
  };
}

function uniqueDays(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(Number).filter(day => Number.isInteger(day) && day >= 1 && day <= 28))].sort((a, b) => a - b);
}

export function normalizeMasteryState(raw, now = Date.now()) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const state = createMasteryState(Number(source.startedAt) || now);
  state.completedDays = uniqueDays(source.completedDays);
  state.floorDays = uniqueDays(source.floorDays).filter(day => state.completedDays.includes(day));
  state.selectedTierByDay = source.selectedTierByDay && typeof source.selectedTierByDay === 'object' ? { ...source.selectedTierByDay } : {};
  for (const [day, tier] of Object.entries(state.selectedTierByDay)) {
    if (!MASTERY_TIERS.includes(String(tier))) delete state.selectedTierByDay[day];
  }
  state.reflections = source.reflections && typeof source.reflections === 'object' ? { ...source.reflections } : {};
  state.stageReviews = source.stageReviews && typeof source.stageReviews === 'object' ? { ...source.stageReviews } : {};
  state.standardDays = state.completedDays.length;
  state.lastCompletedAt = Number(source.lastCompletedAt) || null;
  state.completedAt = state.completedDays.length === 28 ? (Number(source.completedAt) || state.lastCompletedAt || now) : null;
  state.currentDay = nextAvailableDay(state);
  return state;
}

export function getStageForDay(day) {
  const value = Number(day);
  if (!Number.isInteger(value) || value < 1 || value > 28) throw new Error('day must be an integer from 1 to 28');
  return { ...stageForDay(value) };
}

export function requiredReviewBeforeDay(day) {
  const value = Number(day);
  if (value === 8) return 7;
  if (value === 15) return 14;
  if (value === 22) return 21;
  return null;
}

export function nextAvailableDay(input) {
  const completed = uniqueDays(input?.completedDays);
  for (let day = 1; day <= 28; day += 1) {
    if (!completed.includes(day)) return day;
  }
  return 28;
}

export function canAccessMasteryDay(input, day) {
  const state = normalizeMasteryState(input);
  const value = Number(day);
  if (!Number.isInteger(value) || value < 1 || value > 28) return false;
  if (state.completedDays.includes(value)) return true;
  if (value !== nextAvailableDay(state)) return false;
  const reviewDay = requiredReviewBeforeDay(value);
  return reviewDay == null || Boolean(state.stageReviews[String(reviewDay)]?.completedAt);
}

export function selectMasteryTier(input, day, tier) {
  const state = normalizeMasteryState(input);
  const value = Number(day);
  const selected = String(tier || '').toLowerCase();
  if (!Number.isInteger(value) || value < 1 || value > 28) throw new Error('invalid Mastery day');
  if (!MASTERY_TIERS.includes(selected)) throw new Error('invalid Mastery tier');
  state.selectedTierByDay[String(value)] = selected;
  return state;
}

export function saveMasteryReflection(input, day, reflection) {
  const state = normalizeMasteryState(input);
  const value = Number(day);
  if (!Number.isInteger(value) || value < 1 || value > 28) throw new Error('invalid Mastery day');
  state.reflections[String(value)] = String(reflection || '').trim().slice(0, 1200);
  return state;
}

export function completeStageReview(input, reviewDay, text, now = Date.now()) {
  const state = normalizeMasteryState(input, now);
  const day = Number(reviewDay);
  if (!STAGE_REVIEW_DAYS.includes(day) || !state.completedDays.includes(day)) throw new Error('stage review is not available yet');
  state.stageReviews[String(day)] = { text: String(text || '').trim().slice(0, 1600), completedAt: now };
  state.currentDay = nextAvailableDay(state);
  return state;
}

export function completeMasteryDay(input, day, { tier = 'standard', floorDay = false, reflection = '', now = Date.now() } = {}) {
  let state = normalizeMasteryState(input, now);
  const value = Number(day);
  if (!canAccessMasteryDay(state, value)) throw new Error('complete Mastery days in order and finish required stage reviews');
  state = selectMasteryTier(state, value, tier);
  state = saveMasteryReflection(state, value, reflection);
  if (!state.completedDays.includes(value)) state.completedDays.push(value);
  state.completedDays = uniqueDays(state.completedDays);
  if (floorDay && !state.floorDays.includes(value)) state.floorDays.push(value);
  state.floorDays = uniqueDays(state.floorDays);
  state.standardDays = state.completedDays.length;
  state.lastCompletedAt = now;
  if (state.completedDays.length === 28) state.completedAt = now;
  state.currentDay = nextAvailableDay(state);
  return state;
}

export function shouldOfferComeback(lastCompletedAt, now = Date.now()) {
  const last = Number(lastCompletedAt);
  const current = Number(now);
  return Number.isFinite(last) && last > 0 && Number.isFinite(current) && current > last && current - last > 48 * 60 * 60 * 1000;
}

export const REQUIRED_CHARTER_FIELDS = Object.freeze([
  'participantName',
  'primaryFocus',
  'learned',
  'executeConsistently',
  'excelNext',
  'movementFloor',
  'comebackRule',
  'nonNegotiable1',
  'nonNegotiable2',
  'nonNegotiable3',
  'motivationRule',
  'standardStatement',
]);

export function normalizeCharter(raw = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const charter = {};
  for (const field of REQUIRED_CHARTER_FIELDS) charter[field] = String(source[field] || '').trim().slice(0, 1200);
  charter.completionDate = String(source.completionDate || '').trim();
  charter.lifetimeStandardDays = Math.max(0, Math.floor(Number(source.lifetimeStandardDays) || 0));
  return charter;
}

export function isCharterValid(raw) {
  const charter = normalizeCharter(raw);
  return REQUIRED_CHARTER_FIELDS.every(field => charter[field].length > 0);
}
