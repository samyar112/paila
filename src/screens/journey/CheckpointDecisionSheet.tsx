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
import { PEMBA_ATTRIBUTION } from '../../shared/data/pemba-dialogue';
import { PrimaryButton } from '../../components/shared/PrimaryButton';

interface CheckpointDecisionSheetProps {
  userId: string;
}

export function CheckpointDecisionSheet({
  userId,
}: CheckpointDecisionSheetProps): React.JSX.Element | null {
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
          <Text style={styles.arrivedLabel}>You have arrived at</Text>
          <Text style={styles.checkpointName}>
            {checkpoint?.englishTitle ?? 'Checkpoint'}
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

          {/* Pemba's words */}
          <Text style={styles.pembaQuote}>
            "Rest well. The mountain will be here tomorrow."
          </Text>
          <Text style={styles.pembaName}>{PEMBA_ATTRIBUTION}</Text>

          {/* Decision buttons */}
          <PrimaryButton
            label="Rest here"
            subtitle="End today. Tomorrow starts from here."
            onPress={handleRest}
            style={styles.restButton}
          />
          <PrimaryButton
            label="Keep walking today"
            subtitle="Continue until midnight. Open the app again to claim more steps."
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
