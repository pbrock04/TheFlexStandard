import { describe, expect, it, vi } from 'vitest';
import { submitFlexProof, updateFlexProofSpotlightConsent } from '../src/masteryProofApi.js';

function file(type = 'image/jpeg', bytes = 4) {
  const data = new Uint8Array(bytes);
  return { type, size: bytes, arrayBuffer: async () => data.buffer };
}

describe('FLEX Proof API service', () => {
  it('rejects uploads when private storage is unavailable', async () => {
    await expect(submitFlexProof({ db: {}, bucket: null, userId: 'u1', day: 1, file: file() }))
      .rejects.toThrow('private image storage is unavailable');
  });

  it('rejects unsupported image types before storage', async () => {
    const bucket = { put: vi.fn() };
    await expect(submitFlexProof({ db: {}, bucket, userId: 'u1', day: 1, file: file('text/plain') }))
      .rejects.toThrow('JPG, PNG, or WEBP');
    expect(bucket.put).not.toHaveBeenCalled();
  });

  it('requires explicit spotlight consent changes and never ties consent to XP', async () => {
    const calls = [];
    const db = {
      prepare(sql) {
        return {
          bind(...args) {
            return {
              first: async () => sql.includes('SELECT id FROM') ? { id: 'p1' } : null,
              run: async () => { calls.push({ sql, args }); return {}; },
            };
          },
        };
      },
    };
    const result = await updateFlexProofSpotlightConsent({ db, userId: 'u1', submissionId: 'p1', optedIn: true, now: 1234 });
    expect(result).toEqual({ submissionId: 'p1', spotlightOptIn: true, moderationStatus: 'pending' });
    expect(calls.some((x) => x.args.includes(25))).toBe(false);
  });
});
