// Type declarations for react-native-purchases (RevenueCat)
// These types cover the subset of the API used by Paila.
// Full types ship with the actual package when installed.

declare module 'react-native-purchases' {
  export interface PurchasesConfiguration {
    apiKey: string;
    appUserID?: string;
  }

  export interface EntitlementInfo {
    identifier: string;
    isActive: boolean;
    productIdentifier: string;
    expirationDate: string | null;
    [key: string]: unknown;
  }

  export interface EntitlementInfos {
    active: Record<string, EntitlementInfo>;
    all: Record<string, EntitlementInfo>;
  }

  export interface CustomerInfo {
    entitlements: EntitlementInfos;
    activeSubscriptions: string[];
    allPurchasedProductIdentifiers: string[];
    [key: string]: unknown;
  }

  export interface PurchasesProduct {
    identifier: string;
    priceString: string;
    price: number;
    currencyCode: string;
    title: string;
    description: string;
    [key: string]: unknown;
  }

  export interface PurchasesPackage {
    identifier: string;
    packageType: string;
    product: PurchasesProduct;
    offeringIdentifier: string;
    [key: string]: unknown;
  }

  export interface PurchasesOffering {
    identifier: string;
    serverDescription: string;
    availablePackages: PurchasesPackage[];
    [key: string]: unknown;
  }

  export interface PurchasesOfferings {
    current: PurchasesOffering | null;
    all: Record<string, PurchasesOffering>;
  }

  export interface PurchaseResult {
    customerInfo: CustomerInfo;
    productIdentifier: string;
  }

  export interface LogInResult {
    customerInfo: CustomerInfo;
    created: boolean;
  }

  export enum LOG_LEVEL {
    VERBOSE = 'VERBOSE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
  }

  interface PurchasesStatic {
    configure(config: PurchasesConfiguration): void;
    logIn(appUserID: string): Promise<LogInResult>;
    logOut(): Promise<CustomerInfo>;
    getCustomerInfo(): Promise<CustomerInfo>;
    getOfferings(): Promise<PurchasesOfferings>;
    purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult>;
    restorePurchases(): Promise<CustomerInfo>;
    setLogLevel(level: LOG_LEVEL): void;
  }

  const Purchases: PurchasesStatic;
  export default Purchases;
}
