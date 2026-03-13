// Mock for react-native-google-mobile-ads (AdMob)
// Used in tests where the native module is not available.

export enum BannerAdSize {
  BANNER = 'BANNER',
  FULL_BANNER = 'FULL_BANNER',
  LARGE_BANNER = 'LARGE_BANNER',
  LEADERBOARD = 'LEADERBOARD',
  MEDIUM_RECTANGLE = 'MEDIUM_RECTANGLE',
  ANCHORED_ADAPTIVE_BANNER = 'ANCHORED_ADAPTIVE_BANNER',
}

export const BannerAd = 'BannerAd';

const mobileAds = jest.fn(() => ({
  initialize: jest.fn().mockResolvedValue(undefined),
}));

export default mobileAds;
