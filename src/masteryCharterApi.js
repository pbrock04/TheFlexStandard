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
           created_at, updated_at
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

  const charter = {
    reason: cleanText(payload.reason),
    non_negotiable_1: cleanText(payload.non_negotiable_1, 300),
    non_negotiable_2: cleanText(payload.non_negotiable_2, 300),
    non_negotiable_3: cleanText(payload.non_negotiable_3, 300),
    minimum_floor: cleanText(payload.minimum_floor),
    normal_standard: cleanText(payload.normal_standard),
    comeback_rule: cleanText(payload.comeback_rule),
    next_30_days: cleanText(payload.next_30_days),
    signed_name: cleanText(payload.signed_name, 160),
  };

  const missing = Object.entries(charter).filter(([, value]) => !value).map(([key]) => key);
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
      charter_version, signed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      updated_at = excluded.updated_at
  `).bind(
    id,
    user,
    charter.reason,
    charter.non_negotiable_1,
    charter.non_negotiable_2,
    charter.non_negotiable_3,
    charter.minimum_floor,
    charter.normal_standard,
    charter.comeback_rule,
    charter.next_30_days,
    charter.signed_name,
    version,
    timestamp,
    createdAt,
    timestamp,
  ).run();

  await db.prepare(
    'UPDATE mastery_profiles SET updated_at = ? WHERE user_id = ?'
  ).bind(timestamp, user).run();

  return getMasteryCharter(db, user);
}
