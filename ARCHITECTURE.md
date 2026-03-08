# Paila Template Architecture

## Principle

Adding a new trek should feel like adding a product to a store, not writing new software.

That means:

- Every screen reads `RouteDoc`, `MilestoneDoc`, `AssetBundleDoc`, and `JourneyDoc`.
- No component branches on route slug like `if (route.slug === 'ebc')`.
- Pricing, paywall position, visual hero media, region labels, and route metadata all come from Firestore config.
- Milestone ceremony behavior comes from `ceremonyType`, not hardcoded screen forks.

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
- Build a `WeatherService` that reads local cache first, then calls the weather proxy only when the cached item is older than 6 hours.
- Build a `ContentPackService` abstraction now:
  purchase success -> fetch manifest -> download zip/tar pack once -> verify checksums -> extract -> persist local index.
- Asset lookup should go through a single resolver:
  bundled asset -> packaged path
  premium asset -> local filesystem path from downloaded content pack
  remote URLs should never be used for owned premium content after download succeeds.

## Future-Proofing

The following are intentionally route-driven today so later routes do not require refactors:

- paywall position
- free vs paid route behavior
- route difficulty and estimated duration
- badge association to milestones
- share-card unlocks and completion ceremony
- merchandising eligibility after completion

## Client Caching Recommendations

- Firestore offline persistence should be enabled for all user and static content collections.
- Mirror static Firestore docs into `MMKV` with a versioned key so route catalog and milestone content render without repeat reads.
- Use a persistent `downloadedContentPacks` index in `MMKV` or SQLite with:
  `contentPackId`, `version`, `localRootPath`, `downloadedAt`, `checksumVerified`, `compressedSizeBytes`.
- Use persistent local asset resolution from extracted content pack files, not ad hoc per-video streaming caches.
- Use persistent weather caching keyed by normalized location id.
- Prefetch only the active route's map region; do not bulk-download all Nepal tiles.
