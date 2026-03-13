import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { EntitlementService } from '../../services/entitlement/EntitlementService';
import { colors, radii } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { PEMBA_ATTRIBUTION } from '../../shared/data/pemba-dialogue';

interface PurchaseInvitationScreenProps {
  routeName: string;
  productId: string;
  priceLabel: string;
  onPurchaseComplete: () => void;
  onDismiss: () => void;
}

export function PurchaseInvitationScreen({
  routeName,
  productId,
  priceLabel,
  onPurchaseComplete,
  onDismiss,
}: PurchaseInvitationScreenProps): React.JSX.Element {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (): Promise<void> => {
    setIsPurchasing(true);
    setError(null);
    const result = await EntitlementService.purchase(productId);
    setIsPurchasing(false);
    if (result.ok) {
      onPurchaseComplete();
    } else {
      setError(result.error ?? 'Purchase failed. Please try again.');
    }
  };

  const handleRestore = async (): Promise<void> => {
    setIsRestoring(true);
    setError(null);
    const result = await EntitlementService.restorePurchases();
    setIsRestoring(false);
    if (result.ok && result.entitlement?.status === 'active') {
      onPurchaseComplete();
    } else {
      setError('No previous purchase found.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Hero section */}
      <View style={styles.heroArea}>
        <Text style={styles.locationLabel}>NAMCHE BAZAAR</Text>
        <Text style={styles.altitude}>3,440m</Text>
      </View>

      {/* Pemba's words */}
      <View style={styles.dialogueSection}>
        <Text style={styles.pembaQuote}>
          "This is where most people decide if the mountain is for them.
          Beyond Namche, the trail belongs to those who commit."
        </Text>
        <Text style={styles.pembaName}>{PEMBA_ATTRIBUTION}</Text>
      </View>

      {/* What you unlock */}
      <View style={styles.unlockSection}>
        <Text style={styles.unlockTitle}>Unlock the Full Trek</Text>
        <Text style={styles.unlockItem}>13 more milestones to the summit</Text>
        <Text style={styles.unlockItem}>Real expedition camp ceremonies</Text>
        <Text style={styles.unlockItem}>Pemba's guidance through the Death Zone</Text>
        <Text style={styles.unlockItem}>The summit of Everest at 8,849m</Text>
        <Text style={styles.unlockItem}>Return journey to Kathmandu</Text>
      </View>

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Purchase button */}
      <PrimaryButton
        label="Unlock Full Trek"
        subtitle={priceLabel}
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
          <Text style={styles.restoreText}>Restore Purchase</Text>
        )}
      </TouchableOpacity>

      {/* Not now */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        activeOpacity={0.8}
      >
        <Text style={styles.dismissText}>Not now</Text>
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
  dismissButton: {
    padding: 12,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 14,
    color: colors.sage,
  },
});
