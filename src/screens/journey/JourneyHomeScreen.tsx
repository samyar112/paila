import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { StepSyncService } from '../../services/step-sync/StepSyncService';
import { MidnightBoundaryHandler } from '../../services/journey/MidnightBoundaryHandler';
import { JourneyProgressionService } from '../../services/journey/JourneyProgressionService';
import { JourneyService } from '../../services/journey/JourneyService';
import { ElevationProfile } from '../../components/journey/ElevationProfile';
import { AdBanner } from '../../components/ads/AdBanner';
import { colors } from '../../shared/theme/placeholder-theme';
import { EVEREST_ELEVATION_DATA } from '../../shared/everest-elevation-data';
import { DEMO_JOURNEY_ID } from '../../shared/dev/demo-journey';

interface JourneyHomeScreenProps {
  userId: string;
}

export function JourneyHomeScreen({
  userId,
}: JourneyHomeScreenProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [todaySteps, setTodaySteps] = useState(0);

  const journey = useJourneyStore((s) => s.journey);
  const journeyId = useJourneyStore((s) => s.journeyId);
  const route = useJourneyStore((s) => s.route);
  const milestones = useJourneyStore((s) => s.milestones);
  const isLoading = useJourneyStore((s) => s.isLoading);
  const applyForegroundSteps = useJourneyStore((s) => s.applyForegroundSteps);
  const loadJourney = useJourneyStore((s) => s.loadJourney);

  const isDemo = journeyId === DEMO_JOURNEY_ID;

  useEffect(() => {
    if (isDemo) return;
    void useJourneyStore.getState().loadJourney(userId);
  }, [userId, isDemo]);

  useEffect(() => {
    if (isDemo) return;
    const state = useJourneyStore.getState();
    const j = state.journey;
    const jId = state.journeyId;
    if (!j || !jId) return;

    const { updated, journey: checked } = MidnightBoundaryHandler.check(j);
    if (updated) {
      void JourneyService.updateJourney(userId, jId, checked);
      void state.loadJourney(userId);
    }
  }, [journey?.lastStepDate, isDemo, userId]);

  const syncSteps = useCallback(async () => {
    if (isDemo) {
      setTodaySteps(12000);
      return;
    }
    const reading = await StepSyncService.claimForegroundSteps();
    const cached = StepSyncService.getTodayStepsFromCache();
    setTodaySteps(cached);

    if (reading && journey?.journeyState === 'WALKING') {
      await applyForegroundSteps(userId, reading.steps);
    }
  }, [userId, journey?.journeyState, applyForegroundSteps, isDemo]);

  useEffect(() => {
    void syncSteps();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncSteps();
    setRefreshing(false);
  }, [syncSteps]);

  const accessTier = journey?.accessTier ?? 'free';

  if (isLoading || !journey || !route) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading your journey...</Text>
      </View>
    );
  }

  const currentMilestone = milestones[journey.currentMilestoneIndex];
  const nextMilestone = milestones[journey.currentMilestoneIndex + 1];
  const distanceToNext = nextMilestone
    ? nextMilestone.triggerMeters - journey.progressMeters
    : 0;

  const stateLabel: Record<string, string> = {
    WALKING: 'Walking',
    PAUSED_AT_CHECKPOINT: 'At Checkpoint',
    RESTING: 'Resting',
    PAYWALL_FROZEN: 'Journey Paused',
    COMPLETED: 'Journey Complete',
  };

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Elevation Profile */}
      <View style={styles.elevationContainer}>
        <ElevationProfile
          elevationData={EVEREST_ELEVATION_DATA}
          progressMeters={journey.progressMeters}
          totalMeters={route.totalMeters}
          width={width - 32}
          height={200}
        />
      </View>

      {/* Journey State */}
      <View style={styles.stateRow}>
        <View style={[styles.stateDot, journey.journeyState === 'WALKING' && styles.stateDotActive]} />
        <Text style={styles.stateText}>
          {stateLabel[journey.journeyState] ?? journey.journeyState}
        </Text>
      </View>

      {/* Progress Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{todaySteps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Steps Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {(journey.progressMeters / 1000).toFixed(1)}km
          </Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round(journey.progressPercent * 100)}%
          </Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>

      {/* Current Position */}
      <View style={styles.positionCard}>
        <Text style={styles.positionTitle}>
          {currentMilestone?.englishTitle ?? 'Starting'}
        </Text>
        {nextMilestone && (
          <Text style={styles.positionSubtitle}>
            {(distanceToNext / 1000).toFixed(1)}km to{' '}
            {nextMilestone.englishTitle}
          </Text>
        )}
      </View>

      {/* Streak */}
      <View style={styles.streakRow}>
        <Text style={styles.streakText}>
          {journey.streakDays} day streak
        </Text>
        <Text style={styles.streakBest}>
          Best: {journey.longestStreakDays} days
        </Text>
      </View>

      {/* Dev Testing Panel */}
      {__DEV__ && isDemo && (
        <DevTestingPanel
          journey={journey}
          route={route}
          milestones={milestones}
          nextMilestone={nextMilestone ?? null}
          onOpenPurchase={() => navigation.navigate('Purchase' as never)}
          onOpenDelete={() => navigation.navigate('DeleteAccount' as never)}
        />
      )}
    </ScrollView>
    <AdBanner accessTier={accessTier} />
    </View>
  );
}

function DevTestingPanel({
  journey,
  route,
  milestones,
  nextMilestone,
  onOpenPurchase,
  onOpenDelete,
}: {
  journey: NonNullable<ReturnType<typeof useJourneyStore.getState>['journey']>;
  route: NonNullable<ReturnType<typeof useJourneyStore.getState>['route']>;
  milestones: ReturnType<typeof useJourneyStore.getState>['milestones'];
  nextMilestone: (typeof milestones)[number] | null;
  onOpenPurchase: () => void;
  onOpenDelete: () => void;
}): React.JSX.Element {
  const [stepInput, setStepInput] = useState('');
  const [lastEvent, setLastEvent] = useState('');

  const applyDevSteps = (totalSourceSteps: number): void => {
    const state = useJourneyStore.getState();
    const j = state.journey;
    if (!j || !state.route) return;

    if (j.journeyState !== 'WALKING') {
      setLastEvent(`Cannot apply steps in state: ${j.journeyState}`);
      return;
    }

    try {
      const { updatedJourney, events } = JourneyProgressionService.applySteps(
        j,
        state.route,
        state.milestones,
        totalSourceSteps,
      );
      useJourneyStore.setState({ journey: updatedJourney });

      if (events.length > 0) {
        const labels = events.map((e) => {
          if (e.type === 'CHECKPOINT_ARRIVED') return `Checkpoint: ${e.milestoneId}`;
          if (e.type === 'PAYWALL_REACHED') return `Paywall: ${e.milestoneId}`;
          return 'Journey Complete!';
        });
        setLastEvent(labels.join(', '));
      } else {
        setLastEvent(`Applied. Progress: ${(updatedJourney.progressMeters / 1000).toFixed(1)}km`);
      }
    } catch (err) {
      setLastEvent(err instanceof Error ? err.message : 'Error applying steps');
    }
  };

  const handleApplyCustom = (): void => {
    const steps = parseInt(stepInput, 10);
    if (isNaN(steps) || steps <= 0) {
      setLastEvent('Enter a valid step count');
      return;
    }
    const totalSource = journey.lastClaimedSourceStepsToday + steps;
    applyDevSteps(totalSource);
    setStepInput('');
  };

  const handleJumpToNextCheckpoint = (): void => {
    if (!nextMilestone) {
      setLastEvent('No next milestone');
      return;
    }
    const metersNeeded = nextMilestone.triggerMeters - journey.progressMeters + 1;
    const stepsNeeded = Math.ceil(
      (metersNeeded / route.totalMeters) * route.totalStepsCanonical,
    );
    applyDevSteps(journey.lastClaimedSourceStepsToday + stepsNeeded);
  };

  const handleJumpToPaywall = (): void => {
    if (!route.paywallTriggerMeters) {
      setLastEvent('No paywall on this route');
      return;
    }
    if (journey.progressMeters >= route.paywallTriggerMeters) {
      setLastEvent('Already past paywall');
      return;
    }
    const metersNeeded = route.paywallTriggerMeters - journey.progressMeters + 1;
    const stepsNeeded = Math.ceil(
      (metersNeeded / route.totalMeters) * route.totalStepsCanonical,
    );
    applyDevSteps(journey.lastClaimedSourceStepsToday + stepsNeeded);
  };

  const handleJumpToEnd = (): void => {
    const metersNeeded = route.totalMeters - journey.progressMeters + 1;
    const stepsNeeded = Math.ceil(
      (metersNeeded / route.totalMeters) * route.totalStepsCanonical,
    );
    applyDevSteps(journey.lastClaimedSourceStepsToday + stepsNeeded);
  };

  const handleResetToWalking = (): void => {
    useJourneyStore.setState({
      journey: {
        ...journey,
        journeyState: 'WALKING',
        pausedAtCheckpoint: false,
        currentCheckpointId: null,
        keepWalkingToday: false,
        keepWalkingExpiresAt: null,
        frozenAtPaywall: false,
        freezeReason: null,
        updatedAt: new Date(),
      },
    });
    setLastEvent('Reset to WALKING state');
  };

  return (
    <View style={devStyles.container}>
      <Text style={devStyles.title}>DEV TESTING PANEL</Text>
      <Text style={devStyles.info}>
        State: {journey.journeyState} | Progress: {(journey.progressMeters / 1000).toFixed(1)}km |
        Claimed Today: {journey.lastClaimedSourceStepsToday}
      </Text>
      {nextMilestone && (
        <Text style={devStyles.info}>
          Next: {nextMilestone.englishTitle} at {(nextMilestone.triggerMeters / 1000).toFixed(1)}km
          ({Math.ceil(((nextMilestone.triggerMeters - journey.progressMeters) / route.totalMeters) * route.totalStepsCanonical)} steps away)
        </Text>
      )}

      {lastEvent !== '' && <Text style={devStyles.event}>{lastEvent}</Text>}

      <View style={devStyles.inputRow}>
        <TextInput
          style={devStyles.input}
          value={stepInput}
          onChangeText={setStepInput}
          placeholder="Steps to add"
          placeholderTextColor="#999"
          keyboardType="number-pad"
        />
        <TouchableOpacity style={devStyles.applyButton} onPress={handleApplyCustom}>
          <Text style={devStyles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      <View style={devStyles.buttonGrid}>
        <TouchableOpacity style={devStyles.quickButton} onPress={handleJumpToNextCheckpoint}>
          <Text style={devStyles.quickText}>Next Checkpoint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={devStyles.quickButton} onPress={handleJumpToPaywall}>
          <Text style={devStyles.quickText}>Jump to Paywall</Text>
        </TouchableOpacity>
        <TouchableOpacity style={devStyles.quickButton} onPress={handleJumpToEnd}>
          <Text style={devStyles.quickText}>Complete Journey</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[devStyles.quickButton, devStyles.resetButton]} onPress={handleResetToWalking}>
          <Text style={devStyles.quickText}>Reset to Walking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={devStyles.quickButton} onPress={onOpenPurchase}>
          <Text style={devStyles.quickText}>Open Purchase</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[devStyles.quickButton, devStyles.resetButton]} onPress={onOpenDelete}>
          <Text style={devStyles.quickText}>Open Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const devStyles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e94560',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e94560',
    letterSpacing: 2,
    marginBottom: 8,
  },
  info: {
    fontSize: 11,
    color: '#a0a0b0',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  event: {
    fontSize: 12,
    color: '#00ff88',
    fontFamily: 'Courier',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  applyButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  applyText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexGrow: 1,
    minWidth: '45%',
  },
  resetButton: {
    backgroundColor: '#4a2a2e',
  },
  quickText: {
    color: '#e0e0ff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedText,
  },
  elevationContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.sage,
    marginRight: 8,
  },
  stateDotActive: {
    backgroundColor: colors.accentDeep,
  },
  stateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.mutedText,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  positionCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  positionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.background,
  },
  positionSubtitle: {
    fontSize: 14,
    color: colors.sage,
    marginTop: 6,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  streakBest: {
    fontSize: 13,
    color: colors.mutedText,
  },
});
