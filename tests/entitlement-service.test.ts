import { EntitlementService } from '../src/services/entitlement/EntitlementService';
import type {
  EntitlementResult,
  PurchaseResult,
} from '../src/services/entitlement/EntitlementService';

describe('EntitlementService', () => {
  beforeEach(() => {
    EntitlementService._resetForTesting();
  });

  // ─────────────────────────────────────────
  // configure()
  // ─────────────────────────────────────────

  describe('configure()', () => {
    it('sets isConfigured to true', async () => {
      // Arrange
      expect(EntitlementService.getIsConfigured()).toBe(false);

      // Act
      await EntitlementService.configure('rc_api_key_test', 'user-123');

      // Assert
      expect(EntitlementService.getIsConfigured()).toBe(true);
    });
  });

  // ─────────────────────────────────────────
  // checkEntitlement()
  // ─────────────────────────────────────────

  describe('checkEntitlement()', () => {
    it('returns unknown when not configured', async () => {
      // Arrange — service is not configured (reset in beforeEach)

      // Act
      const result: EntitlementResult =
        await EntitlementService.checkEntitlement('everest-trek');

      // Assert
      expect(result.status).toBe('unknown');
      expect(result.productId).toBeNull();
      expect(result.expiresAt).toBeNull();
    });

    it('returns inactive when configured (default stub state)', async () => {
      // Arrange
      await EntitlementService.configure('rc_api_key_test', 'user-123');

      // Act
      const result: EntitlementResult =
        await EntitlementService.checkEntitlement('everest-trek');

      // Assert
      expect(result.status).toBe('inactive');
      expect(result.productId).toBeNull();
      expect(result.expiresAt).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  // purchase()
  // ─────────────────────────────────────────

  describe('purchase()', () => {
    it('returns error when not configured', async () => {
      // Arrange — not configured

      // Act
      const result: PurchaseResult =
        await EntitlementService.purchase('com.paila.everest');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.entitlement).toBeNull();
      expect(result.error).toBe('RevenueCat not configured');
    });

    it('returns ok with active entitlement when configured', async () => {
      // Arrange
      await EntitlementService.configure('rc_api_key_test', 'user-123');

      // Act
      const result: PurchaseResult =
        await EntitlementService.purchase('com.paila.everest');

      // Assert
      expect(result.ok).toBe(true);
      expect(result.error).toBeNull();
      expect(result.entitlement).not.toBeNull();
      expect(result.entitlement!.status).toBe('active');
      expect(result.entitlement!.productId).toBe('com.paila.everest');
      expect(result.entitlement!.expiresAt).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  // restorePurchases()
  // ─────────────────────────────────────────

  describe('restorePurchases()', () => {
    it('returns error when not configured', async () => {
      // Arrange — not configured

      // Act
      const result: PurchaseResult =
        await EntitlementService.restorePurchases();

      // Assert
      expect(result.ok).toBe(false);
      expect(result.entitlement).toBeNull();
      expect(result.error).toBe('RevenueCat not configured');
    });

    it('returns ok when configured', async () => {
      // Arrange
      await EntitlementService.configure('rc_api_key_test', 'user-123');

      // Act
      const result: PurchaseResult =
        await EntitlementService.restorePurchases();

      // Assert
      expect(result.ok).toBe(true);
      expect(result.error).toBeNull();
      expect(result.entitlement).not.toBeNull();
      expect(result.entitlement!.status).toBe('inactive');
    });
  });

  // ─────────────────────────────────────────
  // logOut()
  // ─────────────────────────────────────────

  describe('logOut()', () => {
    it('sets isConfigured to false', async () => {
      // Arrange
      await EntitlementService.configure('rc_api_key_test', 'user-123');
      expect(EntitlementService.getIsConfigured()).toBe(true);

      // Act
      await EntitlementService.logOut();

      // Assert
      expect(EntitlementService.getIsConfigured()).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // _resetForTesting()
  // ─────────────────────────────────────────

  describe('_resetForTesting()', () => {
    it('resets isConfigured to false', async () => {
      // Arrange
      await EntitlementService.configure('rc_api_key_test', 'user-123');
      expect(EntitlementService.getIsConfigured()).toBe(true);

      // Act
      EntitlementService._resetForTesting();

      // Assert
      expect(EntitlementService.getIsConfigured()).toBe(false);
    });
  });
});
