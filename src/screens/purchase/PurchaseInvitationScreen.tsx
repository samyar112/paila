import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useJourneyStore } from '../../stores/useJourneyStore';
import {
  EntitlementService,
  type OfferingInfo,
} from '../../services/entitlement/EntitlementService';
import { colors, radii } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { useRouteContent } from '../../shared/content/RouteContentContext';
import { APP_STRINGS } from '../../shared/content/strings';

interface PurchaseInvitationScreenProps {
  routeName: string;
  productId: string;
  /** Fallback price label — overridden by RevenueCat offering when available. */
  priceLabel: string;
  onPurchaseComplete: () => void;
  onReturnHome: () => void;
  onDismiss: () => void;
}

export function PurchaseInvitationScreen({
  routeName,
  productId,
  priceLabel,
  onPurchaseComplete,
  onReturnHome,
  onDismiss,
}: PurchaseInvitationScreenProps): React.JSX.Element {
  const routeContent = useRouteContent();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic price from RevenueCat offerings (replaces hardcoded "$4.99")
  const [dynamicPrice, setDynamicPrice] = useState<string>(priceLabel);
  const [offeringPackageId, setOfferingPackageId] = useState<string>(productId);

  const mountedRef = React.useRef(true);
  React.useEffect(() => () => { mountedRef.current = false; }, []);

  // Fetch real pricing from RevenueCat on mount
  useEffect(() => {
    const fetchOffering = async (): Promise<void> => {
      try {
        const offering: OfferingInfo =
          await EntitlementService.getCurrentOffering();
        if (!mountedRef.current) return;

        if (offering.priceLabel) {
          setDynamicPrice(offering.priceLabel);
        }
        if (offering.packageToPurchase) {
          setOfferingPackageId(offering.packageToPurchase.identifier);
        }
      } catch {
        // Non-fatal — fallback to the passed-in priceLabel
      }
    };

    void fetchOffering();
  }, []);

  const handlePurchase = useCallback(async (): Promise<void> => {
    setIsPurchasing(true);
    setError(null);
    const result = await EntitlementService.purchase(offeringPackageId);
    if (!mountedRef.current) return;
    setIsPurchasing(false);
    if (result.ok) {
      onPurchaseComplete();
    } else {
      setError(result.error ?? APP_STRINGS.purchase.purchaseFailed);
    }
  }, [offeringPackageId, onPurchaseComplete]);

  const handleRestore = useCallback(async (): Promise<void> => {
    setIsRestoring(true);
    setError(null);
    const result = await EntitlementService.restorePurchases();
    if (!mountedRef.current) return;
    setIsRestoring(false);
    if (result.ok && result.entitlement?.status === 'active') {
      onPurchaseComplete();
    } else {
      setError(APP_STRINGS.purchase.noRestore);
    }
  }, [onPurchaseComplete]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Hero section */}
      <View style={styles.heroArea}>
        <Text style={styles.locationLabel}>{routeContent.paywall.location}</Text>
        <Text style={styles.altitude}>{routeContent.paywall.altitude}</Text>
      </View>

      {/* Guide's words */}
      <View style={styles.dialogueSection}>
        <Text style={styles.pembaQuote}>
          {routeContent.paywall.guideQuote}
        </Text>
        <Text style={styles.pembaName}>{routeContent.guide.attribution}</Text>
      </View>

      {/* What you unlock */}
      <View style={styles.unlockSection}>
        <Text style={styles.unlockTitle}>{routeContent.paywall.unlockTitle}</Text>
        {routeContent.paywall.unlockItems.map((item, index) => (
          <Text key={index} style={styles.unlockItem}>{item}</Text>
        ))}
      </View>

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Purchase button — price from RevenueCat offering (dynamic) */}
      <PrimaryButton
        label={APP_STRINGS.purchase.unlock}
        subtitle={dynamicPrice}
        onPress={() => void handlePurchase()}
        variant="accent"
        loading={isPurchasing}
        disabled={isRestoring}
        style={styles.purchaseButton}
      />

      {/* Restore */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={() => void handleRestore()}
        disabled={isPurchasing || isRestoring}
        activeOpacity={0.8}
      >
        {isRestoring ? (
          <ActivityIndicator color={colors.mutedText} />
        ) : (
          <Text style={styles.restoreText}>{APP_STRINGS.purchase.restore}</Text>
        )}
      </TouchableOpacity>

      {/* Return home — free path */}
      <PrimaryButton
        label={APP_STRINGS.purchase.returnHome}
        subtitle={APP_STRINGS.purchase.returnHomeSub}
        onPress={onReturnHome}
        variant="outline"
        disabled={isPurchasing || isRestoring}
        style={styles.returnButton}
      />

      {/* Not now */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        activeOpacity={0.8}
      >
        <Text style={styles.dismissText}>{APP_STRINGS.purchase.notNow}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroArea: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: 32,
    marginBottom: 28,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sage,
    letterSpacing: 2,
    marginBottom: 8,
  },
  altitude: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.background,
  },
  dialogueSection: {
    marginBottom: 28,
  },
  pembaQuote: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
    color: colors.accentDeep,
    marginBottom: 8,
  },
  pembaName: {
    fontSize: 13,
    color: colors.mutedText,
  },
  unlockSection: {
    marginBottom: 28,
  },
  unlockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  unlockItem: {
    fontSize: 15,
    lineHeight: 28,
    color: colors.text,
    paddingLeft: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  purchaseButton: {
    marginBottom: 12,
  },
  restoreButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  restoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.mutedText,
    textDecorationLine: 'underline',
  },
  returnButton: {
    marginBottom: 12,
  },
  dismissButton: {
    padding: 12,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 14,
    color: colors.sage,
  },
});
