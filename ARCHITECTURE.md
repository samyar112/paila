# Paila Template Architecture

## Principle

Adding a new trek should feel like adding a product to a store, not writing new software.

That means:

- Every screen reads `RouteDoc`, `MilestoneDoc`, `AssetBundleDoc`, and `JourneyDoc`.
- `AssetBundleDoc` stores local-resolved asset references, never runtime CDN or Firebase URLs.
- No component branches on route slug like `if (route.slug === 'ebc')`.
- Pricing, paywall position, visual hero media, region labels, and route metadata all come from Firestore config.
- Milestone ceremony behavior comes from `ceremonyType`, not hardcoded screen forks.

## Progression Model

- Step reads are foreground-only. The app claims progress when the user opens the app.
- No background step processing or passive progression.
- A reached checkpoint pauses the journey immediately.
- While paused at checkpoint, no further steps count until the user returns and chooses `Rest here` or `Keep walking today`.
- `Keep walking today` only permits additional same-day foreground claims; it does not grant passive continuation.
- `Keep walking today` expires at midnight. Unclaimed later steps from that day are lost.

## Cost Protection

The one-time purchase promise means cost control must come from caching and rate limits, not entitlement expiry.

- Static route content is read once, persisted locally, and reused indefinitely until content version changes.
- Map tiles for an active route area should be prefetched on first route load and reused offline afterward.
- Free milestone content should ship in the app binary so free users incur zero content-delivery cost.
- Premium milestone media should be delivered as a single downloadable content pack at purchase time, then served only from device storage.
- Weather is fetched through a server cache with a 6-hour TTL per location, never directly on every app open.
- Step sync and weather proxy calls are rate-limited per user per local day.

## Asset Delivery Contract

- `RouteDoc.freeContentDeliveryMode` is always `bundled` for MVP.
- `RouteDoc.premiumContentDeliveryMode` should be `download_pack` for paid routes.
- `RouteDoc.premiumContentPackId` points to a single downloadable package manifest.
- Free route assets required for onboarding and the entire free journey live in the app package.
- `AssetBundleDoc` references must resolve to bundled asset keys or extracted content-pack-relative paths, not remote URLs.
- Premium route assets are downloaded once after purchase, verified by checksum, decompressed locally, and never auto-deleted.
- After a successful premium pack download, milestone rendering must resolve assets from local filesystem paths only.
- Re-download is allowed only if the pack version changes or integrity verification fails.

## Route-Agnostic UI Boundaries

- `RouteCatalogScreen`
  Queries published routes and renders cards from `RouteDoc`.

- `JourneyHomeScreen`
  Reads the active `JourneyDoc` plus its `RouteDoc`.
  All headline copy should be parameterized by route fields, milestone titles, and progress.

- `MilestoneCeremonyScreen`
  Accepts `milestone`, `assetBundle`, `journey`, and `route`.
  Branches only on `milestone.ceremonyType`.

- `CheckpointDecisionSheet`
  Appears after checkpoint ceremony.
  Presents `Rest here` and `Keep walking today`.
  Owns the transition into paused vs resumed same-day progression.

- `PurchaseInvitationScreen`
  Uses `route.priceUSD`, `route.isFreeRoute`, `route.paywallMilestoneId`, and milestone titles.

- `CompletionScreen`
  Uses `route.totalAltitudeGainMeters`, `route.name`, hero media, and completion ceremony assets.

- `PremiumContentPackDownloadScreen`
  Uses only `RouteDoc` + `ContentPackDoc` metadata.
  Prompts for Wi-Fi, shows pack size, download progress, integrity verification, and final local-ready state.

## Route Content Contract

Every route must be creatable by loading:

1. One `routes/{routeId}` document
2. N `routes/{routeId}/milestones/*` documents
3. N referenced `assetBundles/*` documents
4. Zero or one `contentPacks/{contentPackId}` doc for premium media
5. Optional badge docs already referenced by milestone or streak rules

If a route requires code changes, the architecture has failed.

## Component Recommendations

- Build a single `RouteTheme` mapper from `RouteDoc` fields like `regionTag`, `difficulty`, and hero media.
- Keep map rendering generic: polyline, bounds, milestone markers, current progress marker.
- Keep notification copy templated against route and milestone fields.
- Keep purchase and entitlement logic product-driven:
  no screen should know EBC pricing or paywall location directly.
- Build a `StaticContentRepository` that serves `RouteDoc`, `MilestoneDoc`, and `AssetBundleDoc` from local cache first, then refreshes only when remote `updatedAt` or `version` changed.
- Build a `StepSyncService` that debounces foreground syncs and respects the `10/day` contract before calling backend workflows.
- Build progression around `claimed step deltas`, not raw daily totals reapplied on every open.
- Persist enough journey state to know:
  current checkpoint, last claimed source steps today, paused-at-checkpoint state, and whether `keep walking today` is still valid.
- Build a `WeatherService` that reads local cache first, then calls the weather proxy only when the cached item is older than 6 hours.
- Build a `ContentPackService` abstraction now:
  purchase success -> fetch manifest -> download zip/tar pack once -> verify checksums -> extract -> persist local index.
- Asset lookup should go through a single resolver:
  bundled asset -> packaged path
  premium asset -> local filesystem path from downloaded content pack
  remote URLs should never be used for owned premium content after download succeeds.

## Step Sync Architecture (Locked — March 2026)

This decision was made before S1-05 (HealthKit) was implemented. Codex must follow this model exactly.

### The Three Layers

```
Layer 1 — HealthKit (free, local, unlimited)
  → Read step count directly from HealthKit / Health Connect
  → No cost, no network, instant
  → User can refresh as many times as they want
  → Always returns the full daily total for today

Layer 2 — MMKV (local cache, persistent)
  → Every HealthKit read writes today's step count to MMKV
  → UI always reads from MMKV — never directly from HealthKit
  → Keyed by date: steps:2026-03-11 → { count, lastReadAt }
  → Entries older than today cleared on app open
  → Zero cost, zero network, instant UI updates

Layer 3 — Firestore (permanent record, event-driven only)
  → Written ONLY on meaningful journey events:
      - Checkpoint reached
      - User chooses Rest here or Keep walking today
      - End of day (midnight boundary)
      - App backgrounds after significant step gain (safety net)
  → Target: 2-5 Firestore writes per user per day
  → Never written on every app open or every refresh
```

### Rules

```
✅ HealthKit reads    → unlimited, always fresh, no rate limit
✅ MMKV writes        → on every HealthKit read, keyed by date
✅ MMKV reads         → UI reads from here, not HealthKit directly
✅ Firestore writes   → only on journey events listed above
✅ All writes         → foreground only, never background

❌ Never write to Firestore on every app open
❌ Never write to Firestore on every pull-to-refresh
❌ Never read HealthKit directly from UI components
❌ Never store steps in Firestore more than once per meaningful event
```

### Why

Users should be able to pull-to-refresh and see live step updates as often as they want.
HealthKit and MMKV make this free and instant.
Firestore is only touched when the journey actually changes state.
This keeps infrastructure costs predictable at scale.

### Data Loss on App Delete

```
MMKV cleared    → expected, only today's cache
Firestore data  → deleted when user deletes account (Delete Account button)
Firebase Auth   → cleared on account deletion

If user deletes app without deleting account:
  → Firestore data persists until account deletion is triggered
  → On reinstall + sign in → journey restored from Firestore

Delete Account flow (mandatory before launch):
  → Wipe all Firestore user data
  → Delete Firebase Auth account
  → Clear MMKV
  → Confirm to user
```

### Privacy

```
→ Firestore stores userId (Firebase UID) only — never name or email
→ Name and email stay in Firebase Auth only
→ No PII in Firestore, Crashlytics, Analytics, or logs
→ UID is a random string — meaningless without Firebase Auth
```

---

## Future-Proofing

The following are intentionally route-driven today so later routes do not require refactors:

- paywall position
- free vs paid route behavior
- route difficulty and estimated duration
- badge association to milestones
- share-card unlocks and completion ceremony
- merchandising eligibility after completion

## State Machine Notes

- `active_toward_checkpoint`
  user can claim newly walked steps on app open

- `paused_at_checkpoint`
  milestone reached, ceremony shown, waiting for user intention

- `keep_walking_today`
  same-day continuation allowed, but only via later foreground opens before midnight

- `day_closed`
  midnight boundary or explicit rest decision; next day requires a fresh claim cycle

## Client Caching Recommendations

- Firestore offline persistence should be enabled for all user and static content collections.
- Mirror static Firestore docs into `MMKV` with a versioned key so route catalog and milestone content render without repeat reads.
- Use a persistent `downloadedContentPacks` index in `MMKV` or SQLite with:
  `contentPackId`, `version`, `localRootPath`, `downloadedAt`, `checksumVerified`, `compressedSizeBytes`.
- Use persistent local asset resolution from extracted content pack files, not ad hoc per-video streaming caches.
- Use persistent weather caching keyed by normalized location id.
- Prefetch only the active route's map region; do not bulk-download all Nepal tiles.
