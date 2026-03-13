import { Platform } from 'react-native';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type AssetSource = 'bundled' | 'content_pack';

export interface ResolvedAsset {
  readonly path: string;
  readonly source: AssetSource;
}

export interface AssetError {
  readonly code: 'NOT_FOUND' | 'INVALID_SOURCE';
  readonly message: string;
}

/** Discriminated union Result type — no throwing. */
export type AssetResult =
  | { readonly ok: true; readonly asset: ResolvedAsset }
  | { readonly ok: false; readonly error: AssetError };

// ─────────────────────────────────────────────
// Platform-specific path prefixes
// ─────────────────────────────────────────────

const BUNDLED_ASSET_PREFIX: string = Platform.select({
  ios: 'assets/',
  android: 'asset:/',
  default: 'assets/',
}) as string;

const CONTENT_PACK_BASE_DEFAULT: string = Platform.select({
  ios: 'content-packs/',
  android: 'content-packs/',
  default: 'content-packs/',
}) as string;

// ─────────────────────────────────────────────
// AssetResolver
// ─────────────────────────────────────────────

/**
 * Maps asset keys to local file paths.
 * Supports bundled assets and downloaded content packs.
 * Uses ok/error discriminated union — never throws.
 */
export class AssetResolver {
  private static contentPackBase: string = CONTENT_PACK_BASE_DEFAULT;

  /** Override the base path for content pack resolution (e.g. after downloading). */
  static setContentPackBase(basePath: string): void {
    this.contentPackBase = basePath;
  }

  /** Resolve an asset path from a given source. */
  static resolve(source: AssetSource, assetPath: string): AssetResult {
    if (!assetPath || assetPath.trim().length === 0) {
      return {
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Asset path is empty' },
      };
    }

    if (source === 'bundled') {
      return {
        ok: true,
        asset: {
          path: `${BUNDLED_ASSET_PREFIX}${assetPath}`,
          source: 'bundled',
        },
      };
    }

    if (source === 'content_pack') {
      return {
        ok: true,
        asset: {
          path: `${this.contentPackBase}${assetPath}`,
          source: 'content_pack',
        },
      };
    }

    return {
      ok: false,
      error: {
        code: 'INVALID_SOURCE',
        message: `Unknown source: ${String(source)}`,
      },
    };
  }

  /** Convenience: resolve a bundled asset by bundle ID and type. */
  static resolveFromBundle(
    assetBundleId: string,
    assetType: 'image' | 'video' | 'audio',
  ): AssetResult {
    const assetPath = `${assetBundleId}/${assetType}`;
    return this.resolve('bundled', assetPath);
  }
}
