// Mock for expo-constants
// Used in tests where Expo native modules are not available.

const Constants = {
  expoConfig: {
    extra: {
      appEnv: 'development',
      firebaseProjectId: 'paila-dev',
      googleWebClientId: '',
      revenueCatApiKeyIos: '',
      revenueCatApiKeyAndroid: '',
      admobBannerIos: '',
      admobBannerAndroid: '',
    },
  },
  executionEnvironment: 'storeClient',
};

export default Constants;
