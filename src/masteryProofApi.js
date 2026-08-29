import { FLEX_PROOF_XP, buildProofRecord, applySpotlightConsent, validateProofFile } from './masteryProof.js';

function nowMs(now) {
  const value = Number(now ?? Date.now());
  return Number.isFinite(value) ? Math.floor(value) : Date.now();
}

export async function submitFlexProof({ db, bucket, userId, day, file, caption = '', spotlightOptIn = false, now = Date.now() }) {
  if (!db) throw new Error('FLEX Proof database storage is unavailable.');
  if (!bucket) throw new Error('FLEX Proof private image storage is unavailable.');
  const user = String(userId || '').trim();
  if (!user) throw new Error('A Mastery participant ID is required.');
  if (!file || typeof file.arrayBuffer !== 'function') throw new Error('Choose an image to upload.');

  const { contentType, size } = validateProofFile({ contentType: file.type, size: file.size });
  const submissionId = crypto.randomUUID();
  let record = buildProofRecord({ userId: user, day, submissionId, contentType, caption, now });
  record = applySpotlightConsent(record, Boolean(spotlightOptIn), now);

  const existing = await db.prepare(
    'SELECT id, object_key, proof_xp_awarded, spotlight_opt_in, moderation_status FROM mastery_proof_submissions WHERE user_id = ? AND mission_key = ?',
  ).bind(user, record.missionKey).first();
  if (existing) {
    return { created: false, xpAwarded: 0, proof: existing };
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength !== size) throw new Error('FLEX Proof file size changed during upload. Please try again.');

  await bucket.put(record.objectKey, bytes, {
    httpMetadata: { contentType },
    customMetadata: { userId: user, masteryDay: String(record.masteryDay), submissionId },
  });

  try {
    await db.prepare(`
      INSERT INTO mastery_proof_submissions (
        id,user_id,mastery_day,mission_key,object_key,content_type,caption,
        proof_xp_awarded,spotlight_opt_in,moderation_status,public_use_consent_at,submitted_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      record.id, record.userId, record.masteryDay, record.missionKey, record.objectKey,
      record.contentType, record.caption || null, 1, record.spotlightOptIn,
      record.moderationStatus, record.publicUseConsentAt, record.submittedAt,
    ).run();

    await db.prepare(`
      INSERT OR IGNORE INTO mastery_xp_ledger
        (user_id, source_type, source_key, xp, mastery_day, metadata_json, awarded_at)
      VALUES (?, 'flex_proof', ?, ?, ?, ?, ?)
    `).bind(
      user, record.missionKey, FLEX_PROOF_XP, record.masteryDay,
      JSON.stringify({ submission_id: record.id }), nowMs(now),
    ).run();
  } catch (error) {
    try { await bucket.delete(record.objectKey); } catch {}
    throw error;
  }

  return {
    created: true,
    xpAwarded: FLEX_PROOF_XP,
    proof: { ...record, proofXpAwarded: 1 },
  };
}

export async function updateFlexProofSpotlightConsent({ db, userId, submissionId, optedIn, now = Date.now() }) {
  if (!db) throw new Error('FLEX Proof database storage is unavailable.');
  const user = String(userId || '').trim();
  const id = String(submissionId || '').trim();
  if (!user || !id) throw new Error('Proof participant and submission ID are required.');
  const timestamp = nowMs(now);

  const existing = await db.prepare(
    'SELECT id FROM mastery_proof_submissions WHERE id = ? AND user_id = ?',
  ).bind(id, user).first();
  if (!existing) throw new Error('FLEX Proof submission not found.');

  await db.prepare(`
    UPDATE mastery_proof_submissions
    SET spotlight_opt_in = ?, moderation_status = ?, public_use_consent_at = ?
    WHERE id = ? AND user_id = ?
  `).bind(optedIn ? 1 : 0, optedIn ? 'pending' : 'private', optedIn ? timestamp : null, id, user).run();

  return { submissionId: id, spotlightOptIn: Boolean(optedIn), moderationStatus: optedIn ? 'pending' : 'private' };
}
