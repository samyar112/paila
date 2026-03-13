import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radii, typography, shadows } from '../../shared/theme/placeholder-theme';
import { APP_STRINGS } from '../../shared/content/strings';
import { PrimaryButton } from '../shared/PrimaryButton';
import type { ComingSoonRoute } from '../../shared/content/types';

const NOOP = () => {};

interface ComingSoonCardProps {
  route: ComingSoonRoute;
  onNotifyMe?: () => void;
  style?: ViewStyle;
}

export function ComingSoonCard({
  route,
  onNotifyMe,
  style,
}: ComingSoonCardProps): React.JSX.Element {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{APP_STRINGS.comingSoon.badge}</Text>
      </View>

      <Text style={styles.routeName}>{route.routeName}</Text>

      <Text style={styles.regionText}>
        {route.region} · {route.country}
      </Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{APP_STRINGS.comingSoon.distance}</Text>
        <Text style={styles.detailValue}>{route.distance}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{APP_STRINGS.comingSoon.guide}</Text>
        <Text style={styles.detailValue}>{route.guideName}</Text>
      </View>

      <Text style={styles.teaser}>{route.teaser}</Text>

      <PrimaryButton
        label={APP_STRINGS.comingSoon.notifyMe}
        variant="outline"
        onPress={onNotifyMe ?? NOOP}
        style={styles.notifyButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 20,
    ...shadows.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentDeep,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    color: colors.background,
    ...typography.caption,
    letterSpacing: 1,
  },
  routeName: {
    ...typography.heading,
    color: colors.text,
    marginBottom: 4,
  },
  regionText: {
    ...typography.body,
    color: colors.mutedText,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    ...typography.label,
    color: colors.mutedText,
  },
  detailValue: {
    ...typography.label,
    color: colors.text,
  },
  teaser: {
    ...typography.body,
    color: colors.mutedText,
    fontStyle: 'italic',
    marginTop: 12,
    marginBottom: 16,
  },
  notifyButton: {
    marginTop: 4,
  },
});
