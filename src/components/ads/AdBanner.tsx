import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { colors, typography } from '../../shared/theme/placeholder-theme';
import { AdService, type AdBlockedContext } from '../../services/ads/AdService';
import { APP_STRINGS } from '../../shared/content/strings';

interface AdBannerProps {
  accessTier: string;
  /** If set, ads are suppressed for this context (ceremony, checkpoint, etc.). */
  blockedContext?: AdBlockedContext;
}

export function AdBanner({ accessTier, blockedContext }: AdBannerProps): React.JSX.Element | null {
  const [showConsent, setShowConsent] = useState(false);
  const consentChecked = useRef(false);

  // Check consent notice on first render
  useEffect(() => {
    if (!consentChecked.current && !AdService.hasShownConsentNotice()) {
      setShowConsent(true);
      consentChecked.current = true;
    }
  }, []);

  const handleAdLoaded = useCallback((): void => {
    // Track first ad impression — show consent notice once
    if (!AdService.hasShownConsentNotice()) {
      setShowConsent(true);
      AdService.markConsentNoticeShown();
    }
  }, []);

  if (!AdService.shouldShowAds(accessTier, blockedContext)) return null;

  return (
    <View style={styles.container}>
      {showConsent && (
        <View style={styles.consentNotice}>
          <Text style={styles.consentTitle}>{APP_STRINGS.ads.title}</Text>
          <Text style={styles.consentSubtitle}>{APP_STRINGS.ads.subtitle}</Text>
        </View>
      )}
      <BannerAd
        unitId={AdService.getBannerAdUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={() => {
          // Ads may fail in dev/simulator — non-fatal, hide banner
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.adBanner,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.adBannerBorder,
  },
  consentNotice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.adBanner,
  },
  consentTitle: {
    ...typography.caption,
    color: colors.mutedText,
    marginBottom: 2,
  },
  consentSubtitle: {
    fontSize: 10,
    color: colors.mutedText,
    lineHeight: 14,
  },
});
