import { z } from 'zod';

// ─────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────

export const timestampLikeSchema = z.union([z.date(), z.string()]);

// StepSource — 'manual' is NOT a valid source, ever.
export const stepSourceSchema = z.enum([
  'healthkit',
  'health_connect',
  'phone_pedometer',
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

// JourneyState — the canonical state machine states.
// Full transition rules live in ARCHITECTURE.md and JourneyStateMachine.ts.
export const journeyStateSchema = z.enum([
  'WALKING',
  'PAUSED_AT_CHECKPOINT',
  'RESTING',
  'PAYWALL_FROZEN',
  'COMPLETED',
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

// ─────────────────────────────────────────────
// Step Snapshot
// ─────────────────────────────────────────────

export const stepSourceReadingSchema = z.object({
  steps: z.number().int().min(0),
  fetchedAt: timestampLikeSchema,
  startAt: timestampLikeSchema,
  endAt: timestampLikeSchema,
  isComplete: z.boolean(),
  deviceLabel: z.string().trim().min(1).optional(),
});

// Sources only allow the three valid step providers.
// 'manual' is intentionally excluded — manual entry is never permitted.
export const stepSnapshotSchema = z.object({
  userId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1).nullable(),
  sources: z.object({
    healthkit: stepSourceReadingSchema.optional(),
    health_connect: stepSourceReadingSchema.optional(),
    phone_pedometer: stepSourceReadingSchema.optional(),
  }),
  chosenSource: stepSourceSchema.nullable(),
  chosenSteps: z.number().int().min(0),
  isFinal: z.boolean(),
  computedAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
});

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export const userSchema = z.object({
  authUid: z.string().min(1),
  // email and displayName stored in Firebase Auth only.
  // These fields are optional here for denormalized display only.
  // Never log, never send to third parties.
  email: z.string().email().optional(),
  displayName: z.string().min(1).optional(),
  photoURL: z.string().url().optional(),
  homeDistrict: z.string().min(1).optional(),
  homeCity: z.string().min(1).optional(),
  timezone: z.string().min(1).nullable(),
  locale: z.string().min(1).optional(),
  countryCode: z.string().length(2).optional(),
  accessTier: accessTierSchema,
  isNepalLocalEligible: z.boolean(),
  activeJourneyId: z.string().min(1).optional(),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
  deletedAt: timestampLikeSchema.nullish(),
});

// ─────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────

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
  heroImageKey: z.string().min(1),
  heroVideoKey: z.string().min(1).optional(),
  freeContentDeliveryMode: z.literal('bundled'),
  premiumContentDeliveryMode: z.literal('download_pack'),
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

  if (!route.isFreeRoute && !route.premiumContentPackId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Paid routes must define premiumContentPackId.',
      path: ['premiumContentPackId'],
    });
  }
});

// ─────────────────────────────────────────────
// Milestone
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Journey
// ─────────────────────────────────────────────

export const journeySchema = z.object({
  userId: z.string().min(1),
  routeId: z.string().min(1),
  routeVersion: z.number().int().min(1),
  status: journeyStatusSchema,

  // State machine — canonical journey state.
  // Transitions validated by JourneyStateMachine.ts.
  journeyState: journeyStateSchema,

  startedAt: timestampLikeSchema,
  completedAt: timestampLikeSchema.nullish(),

  // Progression
  totalStepsApplied: z.number().int().min(0),
  progressMeters: z.number().nonnegative(),
  progressPercent: z.number().min(0).max(1),
  currentMilestoneIndex: z.number().int().min(0),
  currentCheckpointId: z.string().min(1).nullable(),
  unlockedMilestoneIds: z.array(z.string().min(1)),

  // Checkpoint pause state
  pausedAtCheckpoint: z.boolean(),

  // Keep walking today
  keepWalkingToday: z.boolean(),
  keepWalkingExpiresAt: z.string().nullable(), // ISO local midnight string

  // Step tracking for today — resets each new day
  lastClaimedSourceStepsToday: z.number().int().min(0),

  // Purchase + entitlement
  purchaseState: purchaseStateSchema,
  accessTier: accessTierSchema,
  frozenAtPaywall: z.boolean(),
  freezeReason: freezeReasonSchema,
  paywallArrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  acclimatizationDays: z.number().int().min(0),

  // Streak
  streakDays: z.number().int().min(0),
  longestStreakDays: z.number().int().min(0),
  lastStepDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),

  // Completion
  completionShareUnlocked: z.boolean(),
  ratingPromptEligible: z.boolean(),

  updatedAt: timestampLikeSchema,
});

// ─────────────────────────────────────────────
// Journey Ledger
// ─────────────────────────────────────────────

// One entry per day per journey.
// Updated when meaningful journey events occur (checkpoint, rest/keep walking, end of day).
// Append-only — never delete entries.
// Multiple checkpoints can be reached in a single day (keep walking today flow).
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

  // Multi-checkpoint support — a user can reach multiple checkpoints in one day
  // if they choose Keep walking today after each one.
  checkpointsReachedToday: z.array(z.string().min(1)).default([]),

  // The final rest decision for the day.
  // null = day not yet closed
  // 'rest_here' = user chose to rest
  // 'keep_walking' = user chose to keep walking (may still be active)
  // 'midnight' = day closed by midnight boundary
  restDecision: z.enum(['rest_here', 'keep_walking', 'midnight']).nullable(),

  // Steps discarded because the user rested before using their full daily allotment.
  discardedSurplusSteps: z.number().int().min(0).default(0),

  appliedAt: timestampLikeSchema,
  recomputeVersion: z.number().int().min(1),
});

// ─────────────────────────────────────────────
// Entitlement
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Asset Bundle
// ─────────────────────────────────────────────

const assetRefSchema = z.object({
  source: z.enum(['bundled', 'content_pack']),
  assetPath: z.string().min(1),
});

export const assetBundleSchema = z.object({
  imageAsset: assetRefSchema,
  imageBlurhash: z.string().min(1).optional(),
  videoAsset: assetRefSchema.optional(),
  ambientAudioAsset: assetRefSchema.optional(),
  storyLines: z.array(z.string().min(1)),
  nepaliPhrase: z.string().min(1).optional(),
  pronunciation: z.string().min(1).optional(),
  weatherMode: z.enum(['none', 'live']),
  shareCardTemplate: z.string().min(1).optional(),
  updatedAt: timestampLikeSchema,
});

// ─────────────────────────────────────────────
// Content Pack
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Badges
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Usage Counter
// stepSyncCount removed — step sync is now unlimited reads from HealthKit.
// Only weatherCallCount remains for cost protection.
// ─────────────────────────────────────────────

export const usageCounterSchema = z.object({
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  userId: z.string().min(1),
  weatherCallCount: z.number().int().min(0),
  lastWeatherFetchAt: timestampLikeSchema.nullish(),
  updatedAt: timestampLikeSchema,
});

// ─────────────────────────────────────────────
// Weather Cache
// ─────────────────────────────────────────────

export const weatherCacheSchema = z.object({
  cacheKey: z.string().min(1),
  locationKey: z.string().min(1),
  provider: z.literal('open_meteo'),
  payload: z.record(z.unknown()),
  fetchedAt: timestampLikeSchema,
  expiresAt: timestampLikeSchema,
});

// ─────────────────────────────────────────────
// Exported TypeScript types
// ─────────────────────────────────────────────

export type StepSource = z.infer<typeof stepSourceSchema>;
export type JourneyState = z.infer<typeof journeyStateSchema>;
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
