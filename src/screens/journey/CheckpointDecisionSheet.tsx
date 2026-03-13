import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useJourneyStore, selectIsAtCheckpoint } from '../../stores/useJourneyStore';
import { colors, radii, typography } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { useRouteContent } from '../../shared/content/RouteContentContext';
import { APP_STRINGS } from '../../shared/content/strings';

interface CheckpointDecisionSheetProps {
  userId: string;
}

export function CheckpointDecisionSheet({
  userId,
}: CheckpointDecisionSheetProps): React.JSX.Element | null {
  const routeContent = useRouteContent();
  const isAtCheckpoint = useJourneyStore(selectIsAtCheckpoint);
  const journey = useJourneyStore((s) => s.journey);
  const milestones = useJourneyStore((s) => s.milestones);
  const chooseRest = useJourneyStore((s) => s.chooseRest);
  const chooseKeepWalking = useJourneyStore((s) => s.chooseKeepWalking);

  if (!isAtCheckpoint || !journey) return null;

  const checkpoint = milestones.find(
    (m) => m.titleSlug === journey.currentCheckpointId,
  );

  const handleRest = (): void => {
    void chooseRest(userId);
  };

  const handleKeepWalking = (): void => {
    void chooseKeepWalking(userId);
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={handleRest}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Checkpoint Info */}
          <Text style={styles.arrivedLabel}>{APP_STRINGS.checkpoint.arrivedLabel}</Text>
          <Text style={styles.checkpointName}>
            {checkpoint?.englishTitle ?? APP_STRINGS.checkpoint.fallbackName}
          </Text>
          {checkpoint && (
            <Text style={styles.altitude}>
              {checkpoint.triggerMeters.toLocaleString()}m altitude
            </Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {(journey.progressMeters / 1000).toFixed(1)}km
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {Math.round(journey.progressPercent * 100)}%
              </Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>

          {/* Guide's words */}
          <Text style={styles.pembaQuote}>
            {routeContent.checkpoint.guideRestQuote}
          </Text>
          <Text style={styles.pembaName}>{routeContent.guide.attribution}</Text>

          {/* Decision buttons */}
          <PrimaryButton
            label={APP_STRINGS.checkpoint.rest}
            subtitle={APP_STRINGS.checkpoint.restSub}
            onPress={handleRest}
            style={styles.restButton}
          />
          <PrimaryButton
            label={APP_STRINGS.checkpoint.keepWalking}
            subtitle={APP_STRINGS.checkpoint.keepWalkingSub}
            onPress={handleKeepWalking}
            variant="outline"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
    padding: 24,
    paddingBottom: 40,
  },
  arrivedLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  checkpointName: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  altitude: {
    fontSize: 15,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 20,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.heading,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.mutedText,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  pembaQuote: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.accentDeep,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 22,
  },
  pembaName: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 24,
  },
  restButton: {
    marginBottom: 12,
  },
});
