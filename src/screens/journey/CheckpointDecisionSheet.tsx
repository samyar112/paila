import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useJourneyStore, selectIsAtCheckpoint } from '../../stores/useJourneyStore';

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
          <Text style={styles.pembaName}>— Pemba Dorje Sherpa</Text>

          {/* Decision buttons */}
          <TouchableOpacity
            style={styles.restButton}
            onPress={handleRest}
            activeOpacity={0.8}
          >
            <Text style={styles.restButtonText}>Rest here</Text>
            <Text style={styles.restButtonSub}>
              End today. Tomorrow starts from here.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keepWalkingButton}
            onPress={handleKeepWalking}
            activeOpacity={0.8}
          >
            <Text style={styles.keepWalkingText}>Keep walking today</Text>
            <Text style={styles.keepWalkingSub}>
              Continue until midnight. Open the app again to claim more steps.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 42, 67, 0.5)',
  },
  sheet: {
    backgroundColor: '#F6F3ED',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  arrivedLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B7355',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  checkpointName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F2A43',
    textAlign: 'center',
    marginTop: 8,
  },
  altitude: {
    fontSize: 15,
    color: '#8B7355',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0F2A43',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B7355',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  pembaQuote: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#4A6741',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 22,
  },
  pembaName: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 24,
  },
  restButton: {
    backgroundColor: '#0F2A43',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
  },
  restButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F6F3ED',
    textAlign: 'center',
  },
  restButtonSub: {
    fontSize: 13,
    color: '#C4B89B',
    textAlign: 'center',
    marginTop: 4,
  },
  keepWalkingButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#0F2A43',
  },
  keepWalkingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F2A43',
    textAlign: 'center',
  },
  keepWalkingSub: {
    fontSize: 13,
    color: '#8B7355',
    textAlign: 'center',
    marginTop: 4,
  },
});
