import type { UserDoc } from '../../src/shared/schemas';

type AuthUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

export function buildUserDoc(
  user: AuthUser,
  timestamp: Date,
): UserDoc {
  return {
    authUid: user.uid,
    email: user.email ?? undefined,
    displayName: user.displayName ?? undefined,
    photoURL: user.photoURL ?? undefined,
    homeDistrict: undefined,
    homeCity: undefined,
    timezone: null,
    locale: undefined,
    countryCode: undefined,
    accessTier: 'standard_free',
    isNepalLocalEligible: false,
    activeJourneyId: undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
}
