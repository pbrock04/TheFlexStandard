function cleanText(value, max = 600) {
  return String(value ?? '').trim().slice(0, max);
}

function nowMs() {
  return Date.now();
}

export async function getMasteryCharter(db, userId) {
  const user = cleanText(userId, 128);
  if (!user) throw new Error('user_id is required');
  return db.prepare(`
    SELECT id, user_id, reason, non_negotiable_1, non_negotiable_2,
           non_negotiable_3, minimum_floor, normal_standard, comeback_rule,
           next_30_days, signed_name, charter_version, signed_at,
           created_at, updated_at,
           primary_focus, learned, execute_consistently, excel_plan,
           motivation_plan, completion_date, standard_days
    FROM mastery_charters
    WHERE user_id = ?
  `).bind(user).first();
}

export async function signMasteryCharter(db, userId, payload = {}) {
  const user = cleanText(userId, 128);
  if (!user) throw new Error('user_id is required');

  const profile = await db.prepare(
    'SELECT user_id, completed_at FROM mastery_profiles WHERE user_id = ?'
  ).bind(user).first();
  if (!profile) throw new Error('Mastery profile not found.');
  if (!profile.completed_at) throw new Error('Complete Day 28 before signing your Personal FLEX Charter.');

  const countRow = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM (
      SELECT mastery_day
      FROM mastery_daily_actions
      WHERE user_id = ? AND action_type IN ('focus','learn','execute','excel')
      GROUP BY mastery_day
      HAVING COUNT(DISTINCT action_type) = 4
    )
  `).bind(user).first();

  const charter = {
    primary_focus: cleanText(payload.primary_focus ?? payload.reason),
    learned: cleanText(payload.learned),
    execute_consistently: cleanText(payload.execute_consistently ?? payload.normal_standard),
    excel_plan: cleanText(payload.excel_plan ?? payload.next_30_days),
    minimum_floor: cleanText(payload.minimum_floor),
    comeback_rule: cleanText(payload.comeback_rule),
    non_negotiable_1: cleanText(payload.non_negotiable_1, 300),
    non_negotiable_2: cleanText(payload.non_negotiable_2, 300),
    non_negotiable_3: cleanText(payload.non_negotiable_3, 300),
    motivation_plan: cleanText(payload.motivation_plan),
    signed_name: cleanText(payload.signed_name, 160),
    completion_date: cleanText(payload.completion_date || new Date(Number(profile.completed_at)).toISOString().slice(0, 10), 32),
    standard_days: Math.max(0, Math.floor(Number(countRow?.count || 0))),
  };

  const required = [
    'primary_focus','learned','execute_consistently','excel_plan','minimum_floor',
    'comeback_rule','non_negotiable_1','non_negotiable_2','non_negotiable_3',
    'motivation_plan','signed_name'
  ];
  const missing = required.filter(key => !charter[key]);
  if (missing.length) throw new Error(`Missing required charter sections: ${missing.join(', ')}`);

  const existing = await getMasteryCharter(db, user);
  const timestamp = nowMs();
  const id = existing?.id || crypto.randomUUID();
  const version = Number(existing?.charter_version || 0) + 1;
  const createdAt = Number(existing?.created_at || timestamp);

  await db.prepare(`
    INSERT INTO mastery_charters (
      id, user_id, reason, non_negotiable_1, non_negotiable_2, non_negotiable_3,
      minimum_floor, normal_standard, comeback_rule, next_30_days, signed_name,
      charter_version, signed_at, created_at, updated_at,
      primary_focus, learned, execute_consistently, excel_plan,
      motivation_plan, completion_date, standard_days
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      reason = excluded.reason,
      non_negotiable_1 = excluded.non_negotiable_1,
      non_negotiable_2 = excluded.non_negotiable_2,
      non_negotiable_3 = excluded.non_negotiable_3,
      minimum_floor = excluded.minimum_floor,
      normal_standard = excluded.normal_standard,
      comeback_rule = excluded.comeback_rule,
      next_30_days = excluded.next_30_days,
      signed_name = excluded.signed_name,
      charter_version = excluded.charter_version,
      signed_at = excluded.signed_at,
      updated_at = excluded.updated_at,
      primary_focus = excluded.primary_focus,
      learned = excluded.learned,
      execute_consistently = excluded.execute_consistently,
      excel_plan = excluded.excel_plan,
      motivation_plan = excluded.motivation_plan,
      completion_date = excluded.completion_date,
      standard_days = excluded.standard_days
  `).bind(
    id,
    user,
    charter.primary_focus,
    charter.non_negotiable_1,
    charter.non_negotiable_2,
    charter.non_negotiable_3,
    charter.minimum_floor,
    charter.execute_consistently,
    charter.comeback_rule,
    charter.excel_plan,
    charter.signed_name,
    version,
    timestamp,
    createdAt,
    timestamp,
    charter.primary_focus,
    charter.learned,
    charter.execute_consistently,
    charter.excel_plan,
    charter.motivation_plan,
    charter.completion_date,
    charter.standard_days,
  ).run();

  await db.prepare(
    'UPDATE mastery_profiles SET updated_at = ? WHERE user_id = ?'
  ).bind(timestamp, user).run();

  return getMasteryCharter(db, user);
}
