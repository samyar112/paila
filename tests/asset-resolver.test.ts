import { AssetResolver } from '../src/services/content/AssetResolver';
import type { AssetResult, AssetSource } from '../src/services/content/AssetResolver';

// The react-native mock (tests/__mocks__/react-native.ts) provides:
//   Platform = { OS: 'ios', select: (obj) => obj.ios }
// So BUNDLED_ASSET_PREFIX = 'assets/' and CONTENT_PACK_BASE = 'content-packs/'

describe('AssetResolver', () => {
  // Reset content pack base before each test to avoid cross-test pollution.
  beforeEach(() => {
    AssetResolver.setContentPackBase('content-packs/');
  });

  // ─────────────────────────────────────────
  // resolve() — bundled source
  // ─────────────────────────────────────────

  describe('resolve() with bundled source', () => {
    it('returns ok with correct bundled path', () => {
      // Arrange
      const source: AssetSource = 'bundled';
      const assetPath = 'everest-lukla/image';

      // Act
      const result: AssetResult = AssetResolver.resolve(source, assetPath);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe('assets/everest-lukla/image');
        expect(result.asset.source).toBe('bundled');
      }
    });

    it('returns NOT_FOUND error for empty string', () => {
      // Arrange
      const source: AssetSource = 'bundled';

      // Act
      const result = AssetResolver.resolve(source, '');

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('NOT_FOUND');
        expect(result.error.message).toBe('Asset path is empty');
      }
    });

    it('returns NOT_FOUND error for whitespace-only string', () => {
      // Arrange
      const source: AssetSource = 'bundled';

      // Act
      const result = AssetResolver.resolve(source, '   ');

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('NOT_FOUND');
        expect(result.error.message).toBe('Asset path is empty');
      }
    });
  });

  // ─────────────────────────────────────────
  // resolve() — content_pack source
  // ─────────────────────────────────────────

  describe('resolve() with content_pack source', () => {
    it('returns ok with correct content pack path', () => {
      // Arrange
      const source: AssetSource = 'content_pack';
      const assetPath = 'everest-lukla/image';

      // Act
      const result = AssetResolver.resolve(source, assetPath);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe('content-packs/everest-lukla/image');
        expect(result.asset.source).toBe('content_pack');
      }
    });
  });

  // ─────────────────────────────────────────
  // resolve() — invalid source
  // ─────────────────────────────────────────

  describe('resolve() with invalid source', () => {
    it('returns INVALID_SOURCE error for unknown source', () => {
      // Arrange — cast to bypass compile-time check
      const source = 'cloud_storage' as AssetSource;
      const assetPath = 'some/path';

      // Act
      const result = AssetResolver.resolve(source, assetPath);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('INVALID_SOURCE');
        expect(result.error.message).toBe('Unknown source: cloud_storage');
      }
    });
  });

  // ─────────────────────────────────────────
  // resolveFromBundle()
  // ─────────────────────────────────────────

  describe('resolveFromBundle()', () => {
    it('builds correct path for image asset type', () => {
      // Arrange
      const bundleId = 'everest-namche';

      // Act
      const result = AssetResolver.resolveFromBundle(bundleId, 'image');

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe('assets/everest-namche/image');
        expect(result.asset.source).toBe('bundled');
      }
    });

    it('builds correct path for video asset type', () => {
      // Arrange & Act
      const result = AssetResolver.resolveFromBundle('everest-namche', 'video');

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe('assets/everest-namche/video');
        expect(result.asset.source).toBe('bundled');
      }
    });

    it('builds correct path for audio asset type', () => {
      // Arrange & Act
      const result = AssetResolver.resolveFromBundle('everest-namche', 'audio');

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe('assets/everest-namche/audio');
        expect(result.asset.source).toBe('bundled');
      }
    });
  });

  // ─────────────────────────────────────────
  // setContentPackBase()
  // ─────────────────────────────────────────

  describe('setContentPackBase()', () => {
    it('changes the base path for content_pack resolution', () => {
      // Arrange
      const customBase = '/data/user/0/com.paila/files/content-packs/';
      AssetResolver.setContentPackBase(customBase);

      // Act
      const result = AssetResolver.resolve('content_pack', 'everest-lukla/image');

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe(
          '/data/user/0/com.paila/files/content-packs/everest-lukla/image',
        );
        expect(result.asset.source).toBe('content_pack');
      }
    });

    it('does not affect bundled resolution', () => {
      // Arrange
      AssetResolver.setContentPackBase('/custom/path/');

      // Act
      const result = AssetResolver.resolve('bundled', 'everest-lukla/image');

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe('assets/everest-lukla/image');
        expect(result.asset.source).toBe('bundled');
      }
    });
  });

  // ─────────────────────────────────────────
  // Platform-specific prefixes (default mock = ios)
  // ─────────────────────────────────────────

  describe('Platform-specific prefixes', () => {
    it('uses ios prefix for bundled assets (from mock)', () => {
      // The mock returns obj.ios, so BUNDLED_ASSET_PREFIX = 'assets/'
      // Arrange & Act
      const result = AssetResolver.resolve('bundled', 'test/asset');

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe('assets/test/asset');
      }
    });

    it('uses ios prefix for content pack assets (from mock)', () => {
      // The mock returns obj.ios, so CONTENT_PACK_BASE = 'content-packs/'
      // Arrange & Act
      const result = AssetResolver.resolve('content_pack', 'test/asset');

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.asset.path).toBe('content-packs/test/asset');
      }
    });
  });
});
