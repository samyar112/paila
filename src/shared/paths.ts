export const COLLECTIONS = {
  users: 'users',
  stepSnapshots: 'stepSnapshots',
  journeys: 'journeys',
  ledger: 'ledger',
  entitlements: 'entitlements',
  badges: 'badges',
  events: 'events',
  usageCounters: 'usageCounters',
  routes: 'routes',
  milestones: 'milestones',
  assetBundles: 'assetBundles',
  contentPacks: 'contentPacks',
  characters: 'characters',
  weatherCache: 'weatherCache',
} as const;

export const userDocPath = (userId: string) =>
  `${COLLECTIONS.users}/${userId}`;

export const userStepSnapshotPath = (userId: string, localDate: string) =>
  `${userDocPath(userId)}/${COLLECTIONS.stepSnapshots}/${localDate}`;

export const userJourneyPath = (userId: string, journeyId: string) =>
  `${userDocPath(userId)}/${COLLECTIONS.journeys}/${journeyId}`;

export const journeyLedgerPath = (
  userId: string,
  journeyId: string,
  localDate: string,
) => `${userJourneyPath(userId, journeyId)}/${COLLECTIONS.ledger}/${localDate}`;

export const userBadgePath = (userId: string, badgeId: string) =>
  `${userDocPath(userId)}/${COLLECTIONS.badges}/${badgeId}`;

export const userEntitlementPath = (userId: string, entitlementId: string) =>
  `${userDocPath(userId)}/${COLLECTIONS.entitlements}/${entitlementId}`;

export const userEventPath = (userId: string, eventId: string) =>
  `${userDocPath(userId)}/${COLLECTIONS.events}/${eventId}`;

export const userUsageCounterPath = (userId: string, localDate: string) =>
  `${userDocPath(userId)}/${COLLECTIONS.usageCounters}/${localDate}`;

export const routeDocPath = (routeId: string) =>
  `${COLLECTIONS.routes}/${routeId}`;

export const routeMilestonePath = (routeId: string, milestoneId: string) =>
  `${routeDocPath(routeId)}/${COLLECTIONS.milestones}/${milestoneId}`;

export const assetBundlePath = (assetBundleId: string) =>
  `${COLLECTIONS.assetBundles}/${assetBundleId}`;

export const contentPackPath = (contentPackId: string) =>
  `${COLLECTIONS.contentPacks}/${contentPackId}`;

export const badgeDocPath = (badgeId: string) =>
  `${COLLECTIONS.badges}/${badgeId}`;

export const routeCharacterPath = (routeId: string, characterId: string) =>
  `${routeDocPath(routeId)}/${COLLECTIONS.characters}/${characterId}`;

export const weatherCachePath = (cacheKey: string) =>
  `${COLLECTIONS.weatherCache}/${cacheKey}`;
