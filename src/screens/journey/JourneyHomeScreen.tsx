import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { StepSyncService } from '../../services/step-sync/StepSyncService';
import { MidnightBoundaryHandler } from '../../services/journey/MidnightBoundaryHandler';
import { JourneyService } from '../../services/journey/JourneyService';
import { ElevationProfile } from '../../components/journey/ElevationProfile';
import { EVEREST_ELEVATION_DATA } from '../../shared/everest-elevation-data';

interface JourneyHomeScreenProps {
  userId: string;
}

export function JourneyHomeScreen({
  userId,
}: JourneyHomeScreenProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [todaySteps, setTodaySteps] = useState(0);

  const journey = useJourneyStore((s) => s.journey);
  const journeyId = useJourneyStore((s) => s.journeyId);
  const route = useJourneyStore((s) => s.route);
  const milestones = useJourneyStore((s) => s.milestones);
  const isLoading = useJourneyStore((s) => s.isLoading);
  const applyForegroundSteps = useJourneyStore((s) => s.applyForegroundSteps);
  const loadJourney = useJourneyStore((s) => s.loadJourney);

  const isDemo = journeyId === 'demo-journey-001';

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
    <ScrollView
      style={styles.container}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3ED',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F3ED',
  },
  loadingText: {
    fontSize: 16,
    color: '#8B7355',
  },
  elevationContainer: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#C4B89B',
    marginRight: 8,
  },
  stateDotActive: {
    backgroundColor: '#4A6741',
  },
  stateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2A43',
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
    backgroundColor: '#FFFFFF',
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
    color: '#0F2A43',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B7355',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  positionCard: {
    backgroundColor: '#0F2A43',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  positionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F6F3ED',
  },
  positionSubtitle: {
    fontSize: 14,
    color: '#C4B89B',
    marginTop: 6,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#0F2A43',
  },
  streakBest: {
    fontSize: 13,
    color: '#8B7355',
  },
});
