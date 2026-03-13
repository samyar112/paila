import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AdService } from '../../services/ads/AdService';

interface AdBannerProps {
  accessTier: string;
}

export function AdBanner({ accessTier }: AdBannerProps): React.JSX.Element | null {
  if (!AdService.shouldShowAds(accessTier)) return null;

  // TODO: Replace placeholder with real BannerAd when native module is linked
  // import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
  // return (
  //   <BannerAd
  //     unitId={AdService.getBannerAdUnitId()}
  //     size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
  //     requestOptions={{ requestNonPersonalizedAdsOnly: true }}
  //   />
  // );

  return (
    <View style={styles.placeholder}>
      <Text style={styles.label}>Ad supports the app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#E8E4DD',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D0CABB',
  },
  label: {
    fontSize: 11,
    color: '#8B7355',
    letterSpacing: 0.3,
  },
});
