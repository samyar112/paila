import { ContentPackService } from '../src/services/content/ContentPackService';
import type { ContentPackDoc } from '../src/shared/schemas';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __resetStore } = require('react-native-mmkv') as { __resetStore: () => void };

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function makeContentPack(overrides?: Partial<ContentPackDoc>): ContentPackDoc {
  return {
    routeId: 'everest',
    routeVersion: 1,
    deliveryMode: 'download_pack',
    version: 1,
    downloadUrl: 'https://cdn.paila.app/packs/everest-v1.zip',
    checksumSha256: 'abc123def456abc123def456abc123def456',
    compressedSizeBytes: 50_000_000,
    uncompressedSizeBytes: 120_000_000,
    wifiRecommended: true,
    retainAfterDownload: true,
    assets: [
      {
        assetBundleId: 'everest-namche',
        relativePath: 'namche/image.webp',
        contentType: 'image',
        checksumSha256: 'aaa111bbb222ccc333ddd444eee555fff666',
        sizeBytes: 2_000_000,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

describe('ContentPackService', () => {
  beforeEach(() => {
    __resetStore();
  });

  // ─────────────────────────────────────────
  // getStatus()
  // ─────────────────────────────────────────

  describe('getStatus()', () => {
    it('returns idle for unknown pack', () => {
      // Arrange
      const packId = 'nonexistent-pack';

      // Act
      const status = ContentPackService.getStatus(packId);

      // Assert
      expect(status.state).toBe('idle');
      expect(status.progress).toBe(0);
      expect(status.error).toBeNull();
      expect(status.version).toBeNull();
    });

    it('returns idle after clearPack', async () => {
      // Arrange — download a pack first, then clear it
      const pack = makeContentPack();
      await ContentPackService.download(pack);
      const packId = `${pack.routeId}-v${pack.version}`;

      // Act
      ContentPackService.clearPack(packId);
      const status = ContentPackService.getStatus(packId);

      // Assert
      expect(status.state).toBe('idle');
      expect(status.progress).toBe(0);
      expect(status.error).toBeNull();
      expect(status.version).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  // isReady()
  // ─────────────────────────────────────────

  describe('isReady()', () => {
    it('returns false for unknown pack', () => {
      // Arrange
      const packId = 'unknown-pack';

      // Act
      const ready = ContentPackService.isReady(packId);

      // Assert
      expect(ready).toBe(false);
    });

    it('returns true after successful download', async () => {
      // Arrange
      const pack = makeContentPack();
      await ContentPackService.download(pack);
      const packId = `${pack.routeId}-v${pack.version}`;

      // Act
      const ready = ContentPackService.isReady(packId);

      // Assert
      expect(ready).toBe(true);
    });
  });

  // ─────────────────────────────────────────
  // needsUpdate()
  // ─────────────────────────────────────────

  describe('needsUpdate()', () => {
    it('returns true for unknown pack', () => {
      // Arrange
      const packId = 'unknown-pack';

      // Act
      const needs = ContentPackService.needsUpdate(packId, 1);

      // Assert
      expect(needs).toBe(true);
    });

    it('returns true when version is older', async () => {
      // Arrange — download version 1
      const pack = makeContentPack({ version: 1 });
      await ContentPackService.download(pack);
      const packId = `${pack.routeId}-v${pack.version}`;

      // Act — check against version 2
      const needs = ContentPackService.needsUpdate(packId, 2);

      // Assert
      expect(needs).toBe(true);
    });

    it('returns false when version matches', async () => {
      // Arrange — download version 3
      const pack = makeContentPack({ version: 3 });
      await ContentPackService.download(pack);
      const packId = `${pack.routeId}-v${pack.version}`;

      // Act
      const needs = ContentPackService.needsUpdate(packId, 3);

      // Assert
      expect(needs).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // download()
  // ─────────────────────────────────────────

  describe('download()', () => {
    it('transitions through states: downloading → verifying → extracting → ready', async () => {
      // Arrange
      const pack = makeContentPack();
      const states: string[] = [];
      const packId = `${pack.routeId}-v${pack.version}`;

      // Act — capture states via onProgress checkpoints
      await ContentPackService.download(pack, () => {
        const status = ContentPackService.getStatus(packId);
        states.push(status.state);
      });

      // Assert — expect all four pipeline stages captured
      expect(states).toContain('downloading');
      expect(states).toContain('verifying');
      expect(states).toContain('extracting');
      expect(states).toContain('ready');
    });

    it('calls onProgress callback with increasing values', async () => {
      // Arrange
      const pack = makeContentPack();
      const progressValues: number[] = [];

      // Act
      await ContentPackService.download(pack, (progress) => {
        progressValues.push(progress);
      });

      // Assert — progress should be monotonically increasing
      expect(progressValues.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]!).toBeGreaterThanOrEqual(progressValues[i - 1]!);
      }
    });

    it('final state is ready with progress 1', async () => {
      // Arrange
      const pack = makeContentPack();

      // Act
      const result = await ContentPackService.download(pack);

      // Assert
      expect(result.state).toBe('ready');
      expect(result.progress).toBe(1);
      expect(result.error).toBeNull();
      expect(result.version).toBe(pack.version);
    });
  });

  // ─────────────────────────────────────────
  // verifyIntegrity()
  // ─────────────────────────────────────────

  describe('verifyIntegrity()', () => {
    it('returns true when checksum matches', async () => {
      // Arrange
      const pack = makeContentPack({
        checksumSha256: 'sha256-match-test-checksum-value-here',
      });
      await ContentPackService.download(pack);
      const packId = `${pack.routeId}-v${pack.version}`;

      // Act
      const valid = ContentPackService.verifyIntegrity(
        packId,
        'sha256-match-test-checksum-value-here',
      );

      // Assert
      expect(valid).toBe(true);
    });

    it('returns false when checksum does not match', async () => {
      // Arrange
      const pack = makeContentPack({
        checksumSha256: 'correct-checksum-value-abcdef1234',
      });
      await ContentPackService.download(pack);
      const packId = `${pack.routeId}-v${pack.version}`;

      // Act
      const valid = ContentPackService.verifyIntegrity(packId, 'wrong-checksum');

      // Assert
      expect(valid).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // clearPack()
  // ─────────────────────────────────────────

  describe('clearPack()', () => {
    it('removes status and checksum from storage', async () => {
      // Arrange
      const pack = makeContentPack();
      await ContentPackService.download(pack);
      const packId = `${pack.routeId}-v${pack.version}`;

      // Verify pack is ready before clearing
      expect(ContentPackService.isReady(packId)).toBe(true);
      expect(
        ContentPackService.verifyIntegrity(packId, pack.checksumSha256),
      ).toBe(true);

      // Act
      ContentPackService.clearPack(packId);

      // Assert — status reverted to idle
      const status = ContentPackService.getStatus(packId);
      expect(status.state).toBe('idle');

      // Assert — checksum removed
      const integrityCheck = ContentPackService.verifyIntegrity(
        packId,
        pack.checksumSha256,
      );
      expect(integrityCheck).toBe(false);
    });
  });
});
