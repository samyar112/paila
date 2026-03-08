import { z } from 'zod';

export const stepSourceSchema = z.enum([
  'healthkit',
  'health_connect',
  'phone_pedometer',
  'manual',
]);

export const accessTierSchema = z.enum([
  'local_free',
  'standard_free',
  'paid',
]);

export const journeyStatusSchema = z.enum([
  'active',
  'completed',
  'abandoned',
]);

export const purchaseStateSchema = z.enum([
  'free',
  'premium_unlocked',
]);

export const freezeReasonSchema = z.enum(['paywall']).nullable();

export const milestoneTierSchema = z.enum(['free', 'premium']);

export const ceremonyTypeSchema = z.enum([
  'standard',
  'paywall',
  'completion',
]);

export const routeDifficultySchema = z.enum([
  'easy',
  'moderate',
  'challenging',
  'extreme',
]);

export const contentDeliveryModeSchema = z.enum([
  'bundled',
  'download_pack',
]);

export const timestampLikeSchema = z.union([z.date(), z.string()]);

export const stepSourceReadingSchema = z.object({
  steps: z.number().int().min(0),
  fetchedAt: timestampLikeSchema,
  startAt: timestampLikeSchema,
  endAt: timestampLikeSchema,
  isComplete: z.boolean(),
  deviceLabel: z.string().trim().min(1).optional(),
});

export const stepSnapshotSchema = z.object({
  userId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1),
  sources: z.object({
    healthkit: stepSourceReadingSchema.optional(),
    health_connect: stepSourceReadingSchema.optional(),
    phone_pedometer: stepSourceReadingSchema.optional(),
    manual: stepSourceReadingSchema.optional(),
  }),
  chosenSource: stepSourceSchema.nullable(),
  chosenSteps: z.number().int().min(0),
  isFinal: z.boolean(),
  computedAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
});

export const userSchema = z.object({
  authUid: z.string().min(1),
  email: z.string().email().optional(),
  displayName: z.string().min(1).optional(),
  photoURL: z.string().url().optional(),
  homeDistrict: z.string().min(1).optional(),
  homeCity: z.string().min(1).optional(),
  timezone: z.string().min(1),
  locale: z.string().min(1).optional(),
  countryCode: z.string().length(2).optional(),
  accessTier: accessTierSchema,
  isNepalLocalEligible: z.boolean(),
  activeJourneyId: z.string().min(1).optional(),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
  deletedAt: timestampLikeSchema.nullish(),
});

export const routeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  version: z.number().int().min(1),
  isPublished: z.boolean(),
  isComingSoon: z.boolean(),
  totalMeters: z.number().nonnegative(),
  totalStepsCanonical: z.number().int().positive(),
  totalAltitudeGainMeters: z.number().nonnegative(),
  estimatedDays: z.number().int().positive(),
  difficulty: routeDifficultySchema,
  regionTag: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  priceUSD: z.number().nonnegative(),
  isFreeRoute: z.boolean(),
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  heroImageUrl: z.string().url(),
  heroVideoUrl: z.string().url().optional(),
  freeContentDeliveryMode: z.literal('bundled'),
  premiumContentDeliveryMode: contentDeliveryModeSchema,
  premiumContentPackId: z.string().min(1).nullable().optional(),
  paywallMilestoneId: z.string().min(1).nullable().optional(),
  paywallTriggerMeters: z.number().nonnegative().nullable().optional(),
  polylineRef: z.string().min(1),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }),
  milestoneIds: z.array(z.string().min(1)),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
}).superRefine((route, ctx) => {
  if (route.isFreeRoute && (route.paywallMilestoneId || route.paywallTriggerMeters)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Free routes must not define paywall fields.',
      path: ['paywallMilestoneId'],
    });
  }

  if (!route.isFreeRoute && (!route.paywallMilestoneId || route.paywallTriggerMeters == null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Paid routes must define paywall milestone and trigger meters.',
      path: ['paywallMilestoneId'],
    });
  }

  if (route.premiumContentDeliveryMode === 'download_pack' && !route.premiumContentPackId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Download-pack routes must define premiumContentPackId.',
      path: ['premiumContentPackId'],
    });
  }
});

export const milestoneSchema = z.object({
  routeId: z.string().min(1),
  routeVersion: z.number().int().min(1),
  index: z.number().int().min(0),
  nepaliTitle: z.string().min(1),
  englishTitle: z.string().min(1),
  titleSlug: z.string().min(1),
  triggerMeters: z.number().nonnegative(),
  triggerSteps: z.number().int().nonnegative(),
  tier: milestoneTierSchema,
  assetBundleId: z.string().min(1),
  unlockOnce: z.literal(true),
  badgeId: z.string().min(1).nullable().optional(),
  ceremonyType: ceremonyTypeSchema,
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
});

export const journeySchema = z.object({
  userId: z.string().min(1),
  routeId: z.string().min(1),
  routeVersion: z.number().int().min(1),
  status: journeyStatusSchema,
  startedAt: timestampLikeSchema,
  completedAt: timestampLikeSchema.nullish(),
  totalStepsApplied: z.number().int().min(0),
  progressMeters: z.number().nonnegative(),
  progressPercent: z.number().min(0).max(1),
  currentMilestoneIndex: z.number().int().min(0),
  unlockedMilestoneIds: z.array(z.string().min(1)),
  purchaseState: purchaseStateSchema,
  accessTier: accessTierSchema,
  frozenAtPaywall: z.boolean(),
  freezeReason: freezeReasonSchema,
  paywallArrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  acclimatizationDays: z.number().int().min(0),
  streakDays: z.number().int().min(0),
  longestStreakDays: z.number().int().min(0),
  lastStepDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  completionShareUnlocked: z.boolean(),
  ratingPromptEligible: z.boolean(),
  updatedAt: timestampLikeSchema,
});

export const journeyLedgerSchema = z.object({
  userId: z.string().min(1),
  journeyId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  snapshotRef: z.string().min(1),
  appliedSource: stepSourceSchema,
  appliedSteps: z.number().int().min(0),
  appliedMeters: z.number().nonnegative(),
  wasFrozen: z.boolean(),
  freezeReason: freezeReasonSchema,
  appliedAt: timestampLikeSchema,
  recomputeVersion: z.number().int().min(1),
});

export const entitlementSchema = z.object({
  provider: z.literal('revenuecat'),
  productId: z.string().min(1),
  entitlementKey: z.string().min(1),
  status: z.enum(['active', 'inactive']),
  purchasedAt: timestampLikeSchema.nullish(),
  expiresAt: timestampLikeSchema.nullish(),
  rawEnvironment: z.enum(['sandbox', 'production']),
  updatedAt: timestampLikeSchema,
});

export const assetBundleSchema = z.object({
  imageUrl: z.string().url(),
  imageBlurhash: z.string().min(1).optional(),
  videoUrl: z.string().url().optional(),
  ambientAudioUrl: z.string().url().optional(),
  storyLines: z.array(z.string().min(1)),
  nepaliPhrase: z.string().min(1).optional(),
  pronunciation: z.string().min(1).optional(),
  weatherMode: z.enum(['none', 'live']),
  shareCardTemplate: z.string().min(1).optional(),
  updatedAt: timestampLikeSchema,
});

export const contentPackSchema = z.object({
  routeId: z.string().min(1),
  routeVersion: z.number().int().min(1),
  deliveryMode: z.literal('download_pack'),
  version: z.number().int().min(1),
  downloadUrl: z.string().url(),
  checksumSha256: z.string().min(32),
  compressedSizeBytes: z.number().int().positive(),
  uncompressedSizeBytes: z.number().int().positive(),
  wifiRecommended: z.boolean(),
  retainAfterDownload: z.literal(true),
  assets: z.array(z.object({
    assetBundleId: z.string().min(1),
    relativePath: z.string().min(1),
    contentType: z.enum(['image', 'video', 'audio', 'json']),
    checksumSha256: z.string().min(32),
    sizeBytes: z.number().int().positive(),
  })),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
});

export const badgeSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  iconUrl: z.string().url(),
  unlockType: z.enum([
    'journey_start',
    'milestone',
    'streak',
    'journey_complete',
  ]),
  unlockValue: z.union([z.string(), z.number()]).optional(),
  sortOrder: z.number().int().min(0),
});

export const userBadgeSchema = z.object({
  badgeId: z.string().min(1),
  journeyId: z.string().min(1),
  unlockedAt: timestampLikeSchema,
  source: z.enum([
    'journey_start',
    'milestone',
    'streak',
    'journey_complete',
  ]),
});

export const userEventSchema = z.object({
  type: z.enum([
    'journey_started',
    'milestone_unlocked',
    'paywall_arrived',
    'purchase_unlocked',
    'journey_completed',
    'rating_prompt_shown',
  ]),
  journeyId: z.string().min(1),
  milestoneId: z.string().min(1).optional(),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  createdAt: timestampLikeSchema,
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const usageCounterSchema = z.object({
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  userId: z.string().min(1),
  stepSyncCount: z.number().int().min(0),
  weatherCallCount: z.number().int().min(0),
  lastStepSyncAt: timestampLikeSchema.nullish(),
  lastWeatherFetchAt: timestampLikeSchema.nullish(),
  updatedAt: timestampLikeSchema,
});

export const weatherCacheSchema = z.object({
  cacheKey: z.string().min(1),
  locationKey: z.string().min(1),
  provider: z.literal('openweathermap'),
  payload: z.record(z.unknown()),
  fetchedAt: timestampLikeSchema,
  expiresAt: timestampLikeSchema,
});

export type StepSource = z.infer<typeof stepSourceSchema>;
export type UserDoc = z.infer<typeof userSchema>;
export type StepSnapshotDoc = z.infer<typeof stepSnapshotSchema>;
export type RouteDoc = z.infer<typeof routeSchema>;
export type MilestoneDoc = z.infer<typeof milestoneSchema>;
export type JourneyDoc = z.infer<typeof journeySchema>;
export type JourneyLedgerDoc = z.infer<typeof journeyLedgerSchema>;
export type EntitlementDoc = z.infer<typeof entitlementSchema>;
export type AssetBundleDoc = z.infer<typeof assetBundleSchema>;
export type ContentPackDoc = z.infer<typeof contentPackSchema>;
export type BadgeDoc = z.infer<typeof badgeSchema>;
export type UserBadgeDoc = z.infer<typeof userBadgeSchema>;
export type UserEventDoc = z.infer<typeof userEventSchema>;
export type UsageCounterDoc = z.infer<typeof usageCounterSchema>;
export type WeatherCacheDoc = z.infer<typeof weatherCacheSchema>;
