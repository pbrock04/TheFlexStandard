export const FLEX_PROOF_XP = 25;
export const ALLOWED_PROOF_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_PROOF_BYTES = 8 * 1024 * 1024;

export function validateProofFile({ contentType, size }) {
  const type = String(contentType || '').toLowerCase();
  const bytes = Number(size);
  if (!ALLOWED_PROOF_TYPES.includes(type)) throw new Error('FLEX Proof must be a JPG, PNG, or WEBP image.');
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_PROOF_BYTES) throw new Error('FLEX Proof must be 8 MB or smaller.');
  return { contentType: type, size: Math.floor(bytes) };
}

export function cleanProofCaption(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 280);
}

export function proofMissionKey(day) {
  const value = Number(day);
  if (!Number.isInteger(value) || value < 1 || value > 28) throw new Error('FLEX Proof day must be 1 through 28.');
  return `mastery-day-${value}-proof`;
}

export function proofObjectKey({ userId, day, submissionId, contentType }) {
  const user = String(userId || '').trim();
  const id = String(submissionId || '').trim();
  if (!user || !id) throw new Error('Proof participant and submission ID are required.');
  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const safeUser = user.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return `private/mastery/${safeUser}/day-${Number(day)}/${id}.${ext}`;
}

export function buildProofRecord({ userId, day, submissionId, contentType, caption = '', now = Date.now() }) {
  const fileType = validateProofFile({ contentType, size: 1 }).contentType;
  const missionKey = proofMissionKey(day);
  return {
    id: String(submissionId),
    userId: String(userId),
    masteryDay: Number(day),
    missionKey,
    objectKey: proofObjectKey({ userId, day, submissionId, contentType: fileType }),
    contentType: fileType,
    caption: cleanProofCaption(caption),
    proofXpAwarded: 0,
    spotlightOptIn: 0,
    moderationStatus: 'private',
    publicUseConsentAt: null,
    submittedAt: Number(now),
  };
}

export function applySpotlightConsent(record, optedIn, now = Date.now()) {
  return {
    ...record,
    spotlightOptIn: optedIn ? 1 : 0,
    moderationStatus: optedIn ? 'pending' : 'private',
    publicUseConsentAt: optedIn ? Number(now) : null,
  };
}
