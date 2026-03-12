import { buildUserDoc } from '../functions/src/user-doc';

describe('buildUserDoc', () => {
  it('maps auth user to firestore user doc defaults', () => {
    const user = {
      uid: 'user_1',
      email: 'user@example.com',
      displayName: 'User One',
      photoURL: 'https://example.com/avatar.png',
    };

    const timestamp = new Date('2026-03-10T00:00:00Z');
    const doc = buildUserDoc(user, timestamp);

    expect(doc.authUid).toBe('user_1');
    expect(doc.accessTier).toBe('standard_free');
    expect(doc.isNepalLocalEligible).toBe(false);
    expect(doc.timezone).toBeNull();
    expect(doc.createdAt).toBe(timestamp);
  });
});
