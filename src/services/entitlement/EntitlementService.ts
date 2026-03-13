// ─────────────────────────────────────────────
// EntitlementService — RevenueCat abstraction layer
// ─────────────────────────────────────────────
//
// This service wraps RevenueCat (react-native-purchases) behind a testable
// interface.  All native SDK calls are commented out as TODO placeholders.
// When the native module is installed, uncomment the real calls and remove
// the stub return values.
//
// Architecture: Services → Repositories → Firestore  (DIP)
// This service is the sole owner of entitlement / purchase logic on the client.

export type EntitlementStatus = 'active' | 'inactive' | 'unknown';

export interface EntitlementResult {
  status: EntitlementStatus;
  productId: string | null;
  expiresAt: string | null;
}

export interface PurchaseResult {
  ok: boolean;
  entitlement: EntitlementResult | null;
  error: string | null;
}

export class EntitlementService {
  private static isConfigured = false;

  /** Initialise RevenueCat with the project API key and log the user in. */
  static async configure(apiKey: string, userId: string): Promise<void> {
    // TODO: uncomment when react-native-purchases is installed
    // Purchases.configure({ apiKey });
    // await Purchases.logIn(userId);
    this.isConfigured = true;
  }

  /** Check whether the user holds an active entitlement for `routeId`. */
  static async checkEntitlement(routeId: string): Promise<EntitlementResult> {
    if (!this.isConfigured) {
      return { status: 'unknown', productId: null, expiresAt: null };
    }

    try {
      // TODO: uncomment when react-native-purchases is installed
      // const customerInfo = await Purchases.getCustomerInfo();
      // const entitlement = customerInfo.entitlements.active[routeId];
      // For now, return inactive (no purchase)
      return { status: 'inactive', productId: null, expiresAt: null };
    } catch {
      return { status: 'unknown', productId: null, expiresAt: null };
    }
  }

  /** Initiate a purchase flow for the given package. */
  static async purchase(packageId: string): Promise<PurchaseResult> {
    if (!this.isConfigured) {
      return { ok: false, entitlement: null, error: 'RevenueCat not configured' };
    }

    try {
      // TODO: uncomment when react-native-purchases is installed
      // const { customerInfo } = await Purchases.purchasePackage(package);
      // Return the entitlement from customerInfo
      return {
        ok: true,
        entitlement: {
          status: 'active',
          productId: packageId,
          expiresAt: null,
        },
        error: null,
      };
    } catch (err) {
      return {
        ok: false,
        entitlement: null,
        error: err instanceof Error ? err.message : 'Purchase failed',
      };
    }
  }

  /** Ask RevenueCat to restore any previous purchases on this device. */
  static async restorePurchases(): Promise<PurchaseResult> {
    if (!this.isConfigured) {
      return { ok: false, entitlement: null, error: 'RevenueCat not configured' };
    }

    try {
      // TODO: uncomment when react-native-purchases is installed
      // const customerInfo = await Purchases.restorePurchases();
      return {
        ok: true,
        entitlement: { status: 'inactive', productId: null, expiresAt: null },
        error: null,
      };
    } catch (err) {
      return {
        ok: false,
        entitlement: null,
        error: err instanceof Error ? err.message : 'Restore failed',
      };
    }
  }

  /** Log the current user out of RevenueCat. */
  static async logOut(): Promise<void> {
    // TODO: uncomment when react-native-purchases is installed
    // await Purchases.logOut();
    this.isConfigured = false;
  }

  /** Whether RevenueCat has been configured for the current session. */
  static getIsConfigured(): boolean {
    return this.isConfigured;
  }

  /** Reset internal state — test-only helper. */
  static _resetForTesting(): void {
    this.isConfigured = false;
  }
}
