// Mock for react-native-purchases (RevenueCat)
// Used in tests where the native module is not available.

export enum LOG_LEVEL {
  VERBOSE = 'VERBOSE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

const mockPackage = {
  identifier: 'com.paila.everest',
  packageType: 'CUSTOM',
  product: {
    identifier: 'com.paila.everest',
    priceString: '$4.99',
    price: 4.99,
    currencyCode: 'USD',
    title: 'Everest Trek',
    description: 'Unlock the full Everest trek',
  },
  offeringIdentifier: 'default',
};

const activeCustomerInfo = {
  entitlements: {
    active: {
      premium_trek: {
        identifier: 'premium_trek',
        isActive: true,
        productIdentifier: 'com.paila.everest',
        expirationDate: null,
      },
    },
    all: {},
  },
  activeSubscriptions: [],
  allPurchasedProductIdentifiers: ['com.paila.everest'],
};

const inactiveCustomerInfo = {
  entitlements: { active: {}, all: {} },
  activeSubscriptions: [],
  allPurchasedProductIdentifiers: [],
};

const Purchases = {
  configure: jest.fn(),
  logIn: jest.fn().mockResolvedValue({
    customerInfo: inactiveCustomerInfo,
    created: false,
  }),
  logOut: jest.fn().mockResolvedValue(inactiveCustomerInfo),
  getCustomerInfo: jest.fn().mockResolvedValue(inactiveCustomerInfo),
  getOfferings: jest.fn().mockResolvedValue({
    current: {
      identifier: 'default',
      serverDescription: 'Default Offering',
      availablePackages: [mockPackage],
    },
    all: {},
  }),
  purchasePackage: jest.fn().mockResolvedValue({
    customerInfo: activeCustomerInfo,
    productIdentifier: 'com.paila.everest',
  }),
  restorePurchases: jest.fn().mockResolvedValue(inactiveCustomerInfo),
  setLogLevel: jest.fn(),
};

export default Purchases;
