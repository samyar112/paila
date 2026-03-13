// ─────────────────────────────────────────────
// EntitlementService — RevenueCat abstraction layer
// ─────────────────────────────────────────────
//
// This service wraps RevenueCat (react-native-purchases) behind a testable
// interface. It is the sole owner of entitlement / purchase logic on the client.
//
// API keys come from app.config.ts extra or env vars — NEVER hardcoded.
// Customer is identified with Firebase UID on sign-in.
//
// Architecture: Services → Repositories → Firestore  (DIP)

import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { getAppEnvironment } from '../../shared/config/app-env';

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

export interface OfferingInfo {
  priceLabel: string;
  packageToPurchase: PurchasesPackage | null;
}

/** Map RevenueCat CustomerInfo to our EntitlementResult for a given entitlement key. */
function mapEntitlement(
  customerInfo: CustomerInfo,
  entitlementKey: string,
): EntitlementResult {
  const entitlement = customerInfo.entitlements.active[entitlementKey];
  if (entitlement) {
    return {
      status: 'active',
      productId: entitlement.productIdentifier,
      expiresAt: entitlement.expirationDate ?? null,
    };
  }
  return { status: 'inactive', productId: null, expiresAt: null };
}

export class EntitlementService {
  private static isConfigured = false;
  /** Default entitlement key used for the trek unlock. */
  private static readonly ENTITLEMENT_KEY = 'premium_trek';

  /**
   * Configure RevenueCat with the project API key and identify the user.
   * API key must come from app.config.ts extra — never hardcoded.
   */
  static async configure(apiKey: string, userId: string): Promise<void> {
    if (this.isConfigured) return;

    try {
      const isProduction = getAppEnvironment() === 'production';
      if (!isProduction) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey });
      await Purchases.logIn(userId);
      this.isConfigured = true;
    } catch {
      // RevenueCat may fail in simulator — non-fatal
      this.isConfigured = false;
    }
  }

  /** Check whether the user holds an active entitlement for `routeId`. */
  static async checkEntitlement(_routeId: string): Promise<EntitlementResult> {
    if (!this.isConfigured) {
      return { status: 'unknown', productId: null, expiresAt: null };
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return mapEntitlement(customerInfo, this.ENTITLEMENT_KEY);
    } catch {
      return { status: 'unknown', productId: null, expiresAt: null };
    }
  }

  /**
   * Fetch the current offering and return the price label + package reference.
   * Used by PurchaseInvitationScreen to display dynamic pricing.
   */
  static async getCurrentOffering(): Promise<OfferingInfo> {
    if (!this.isConfigured) {
      return { priceLabel: '', packageToPurchase: null };
    }

    try {
      const offerings = await Purchases.getOfferings();
      const current: PurchasesOffering | null = offerings.current;
      if (!current || current.availablePackages.length === 0) {
        return { priceLabel: '', packageToPurchase: null };
      }

      const pkg = current.availablePackages[0];
      if (!pkg) {
        return { priceLabel: '', packageToPurchase: null };
      }

      return {
        priceLabel: pkg.product.priceString,
        packageToPurchase: pkg,
      };
    } catch {
      return { priceLabel: '', packageToPurchase: null };
    }
  }

  /**
   * Initiate a purchase flow for the given package.
   * Triggers native StoreKit (iOS) / Google Play Billing (Android).
   */
  static async purchase(packageId: string): Promise<PurchaseResult> {
    if (!this.isConfigured) {
      return { ok: false, entitlement: null, error: 'RevenueCat not configured' };
    }

    try {
      // Fetch the offering to get the package object
      const offerings = await Purchases.getOfferings();
      const current: PurchasesOffering | null = offerings.current;

      const pkg = current?.availablePackages.find(
        (p: PurchasesPackage) => p.identifier === packageId,
      ) ?? current?.availablePackages[0];

      if (!pkg) {
        return { ok: false, entitlement: null, error: 'No package available' };
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const entitlement = mapEntitlement(customerInfo, this.ENTITLEMENT_KEY);

      return {
        ok: entitlement.status === 'active',
        entitlement,
        error: null,
      };
    } catch (err) {
      // RevenueCat throws with userCancelled for user-initiated cancellations
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      return {
        ok: false,
        entitlement: null,
        error: errorMessage,
      };
    }
  }

  /** Ask RevenueCat to restore any previous purchases on this device. */
  static async restorePurchases(): Promise<PurchaseResult> {
    if (!this.isConfigured) {
      return { ok: false, entitlement: null, error: 'RevenueCat not configured' };
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      const entitlement = mapEntitlement(customerInfo, this.ENTITLEMENT_KEY);

      return {
        ok: true,
        entitlement,
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
    if (!this.isConfigured) return;

    try {
      await Purchases.logOut();
    } catch {
      // Non-fatal — may fail if already logged out
    }
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
