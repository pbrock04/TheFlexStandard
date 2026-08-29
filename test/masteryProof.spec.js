import { describe, expect, it } from 'vitest';
import {
  FLEX_PROOF_XP,
  applySpotlightConsent,
  buildProofRecord,
  cleanProofCaption,
  proofMissionKey,
  validateProofFile,
} from '../src/masteryProof.js';

describe('FLEX Proof rules', () => {
  it('accepts only supported private image uploads under 8 MB', () => {
    expect(validateProofFile({ contentType: 'image/jpeg', size: 1024 }).contentType).toBe('image/jpeg');
    expect(() => validateProofFile({ contentType: 'video/mp4', size: 1024 })).toThrow();
    expect(() => validateProofFile({ contentType: 'image/png', size: 9 * 1024 * 1024 })).toThrow();
  });

  it('creates a private-by-default proof record', () => {
    const record = buildProofRecord({ userId: 'user-1', day: 3, submissionId: 'proof-1', contentType: 'image/webp', caption: '  Show   the work  ', now: 123 });
    expect(record.missionKey).toBe(proofMissionKey(3));
    expect(record.objectKey).toContain('private/mastery/user-1/day-3/proof-1.webp');
    expect(record.moderationStatus).toBe('private');
    expect(record.spotlightOptIn).toBe(0);
    expect(record.publicUseConsentAt).toBeNull();
    expect(record.caption).toBe('Show the work');
  });

  it('keeps public consent separate from proof XP', () => {
    const record = buildProofRecord({ userId: 'u', day: 1, submissionId: 'p', contentType: 'image/jpeg' });
    const opted = applySpotlightConsent(record, true, 999);
    expect(opted.spotlightOptIn).toBe(1);
    expect(opted.moderationStatus).toBe('pending');
    expect(opted.publicUseConsentAt).toBe(999);
    expect(record.proofXpAwarded).toBe(0);
    expect(FLEX_PROOF_XP).toBe(25);
  });

  it('limits captions for safe display', () => {
    expect(cleanProofCaption(' a   b ')).toBe('a b');
    expect(cleanProofCaption('x'.repeat(400))).toHaveLength(280);
  });
});
