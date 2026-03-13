import type {
  JourneyDoc,
  JourneyState,
  MilestoneDoc,
  RouteDoc,
} from '../../shared/schemas';
import { InvalidStateError } from '../../utils/errors';
import { stepsToMeters, capAtCeiling, progressPercent } from '../../utils/meters';
import { diffCalendarDays, getLocalDateString } from '../../utils/dates';
import { JourneyStateMachine } from './JourneyStateMachine';

export type JourneyEvent =
  | { type: 'CHECKPOINT_ARRIVED'; milestoneId: string; milestoneIndex: number }
  | { type: 'PAYWALL_REACHED'; milestoneId: string }
  | { type: 'JOURNEY_COMPLETED' };

export interface ApplyStepsResult {
  updatedJourney: JourneyDoc;
  events: JourneyEvent[];
}

export class JourneyProgressionService {
  static applySteps(
    journey: JourneyDoc,
    route: RouteDoc,
    milestones: MilestoneDoc[],
    newSourceSteps: number,
  ): ApplyStepsResult {
    if (journey.journeyState !== 'WALKING') {
      throw new InvalidStateError(
        `Cannot apply steps in state ${journey.journeyState}`,
      );
    }

    const events: JourneyEvent[] = [];
    const localDate = getLocalDateString();

    const claimedDelta = Math.max(0, newSourceSteps - journey.lastClaimedSourceStepsToday);
    if (claimedDelta === 0) {
      return { updatedJourney: journey, events };
    }

    const deltaMeters = stepsToMeters(
      claimedDelta,
      route.totalStepsCanonical,
      route.totalMeters,
    );

    let newProgress = journey.progressMeters + deltaMeters;
    let newState: JourneyState = journey.journeyState;
    let pausedAtCheckpoint = false;
    let currentCheckpointId = journey.currentCheckpointId;

    const sortedMilestones = [...milestones].sort(
      (a, b) => a.triggerMeters - b.triggerMeters,
    );

    if (
      !route.isFreeRoute &&
      journey.purchaseState === 'free' &&
      route.paywallTriggerMeters != null &&
      newProgress >= route.paywallTriggerMeters
    ) {
      newProgress = route.paywallTriggerMeters;
      newState = JourneyStateMachine.transition(newState, 'PAYWALL_REACHED');
      const paywallMilestone = sortedMilestones.find(
        (m) => m.triggerMeters === route.paywallTriggerMeters,
      );
      if (paywallMilestone) {
        events.push({
          type: 'PAYWALL_REACHED',
          milestoneId: paywallMilestone.titleSlug,
        });
      }
    } else if (newProgress >= route.totalMeters) {
      newProgress = route.totalMeters;
      newState = JourneyStateMachine.transition(newState, 'BASE_CAMP_REACHED');
      events.push({ type: 'JOURNEY_COMPLETED' });
    } else {
      const nextCheckpoint = this.findNextCheckpoint(
        journey.progressMeters,
        sortedMilestones,
      );
      if (nextCheckpoint && newProgress >= nextCheckpoint.triggerMeters) {
        newProgress = capAtCeiling(newProgress, nextCheckpoint.triggerMeters);
        newState = JourneyStateMachine.transition(
          newState,
          'CHECKPOINT_REACHED',
        );
        pausedAtCheckpoint = true;
        currentCheckpointId = nextCheckpoint.titleSlug;
        events.push({
          type: 'CHECKPOINT_ARRIVED',
          milestoneId: nextCheckpoint.titleSlug,
          milestoneIndex: nextCheckpoint.index,
        });
      }
    }

    const totalStepsApplied = journey.totalStepsApplied + claimedDelta;

    const unlockedMilestones = sortedMilestones
      .filter((m) => m.triggerMeters <= newProgress)
      .map((m) => m.titleSlug);

    const currentMilestoneIndex =
      sortedMilestones.filter((m) => m.triggerMeters <= newProgress).length > 0
        ? (sortedMilestones
            .filter((m) => m.triggerMeters <= newProgress)
            .slice(-1)[0]?.index ?? 0)
        : 0;

    const lastStepDate = journey.lastStepDate;
    let streakDays = journey.streakDays;
    if (lastStepDate) {
      const dayDiff = diffCalendarDays(lastStepDate, localDate);
      if (dayDiff === 1) {
        streakDays += 1;
      } else if (dayDiff > 1) {
        streakDays = 1;
      }
    } else {
      streakDays = 1;
    }

    const isCompleted = newState === 'COMPLETED' as JourneyState;
    const isFrozen = newState === 'PAYWALL_FROZEN' as JourneyState;

    const updatedJourney: JourneyDoc = {
      ...journey,
      journeyState: newState,
      totalStepsApplied,
      progressMeters: newProgress,
      progressPercent: progressPercent(newProgress, route.totalMeters),
      currentMilestoneIndex,
      currentCheckpointId,
      unlockedMilestoneIds: unlockedMilestones,
      pausedAtCheckpoint,
      lastClaimedSourceStepsToday: newSourceSteps,
      streakDays,
      longestStreakDays: Math.max(journey.longestStreakDays, streakDays),
      lastStepDate: localDate,
      status: isCompleted ? 'completed' : journey.status,
      completedAt: isCompleted ? new Date() : journey.completedAt ?? null,
      completionShareUnlocked: isCompleted,
      ratingPromptEligible: isCompleted,
      frozenAtPaywall: isFrozen,
      freezeReason: isFrozen ? 'paywall' : null,
      paywallArrivalDate:
        isFrozen
          ? (journey.paywallArrivalDate ?? localDate)
          : journey.paywallArrivalDate,
      updatedAt: new Date(),
    };

    return { updatedJourney, events };
  }

  private static findNextCheckpoint(
    currentMeters: number,
    sortedMilestones: MilestoneDoc[],
  ): MilestoneDoc | null {
    return (
      sortedMilestones.find((m) => m.triggerMeters > currentMeters) ?? null
    );
  }
}
