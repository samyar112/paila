import type { JourneyDoc } from '../../shared/schemas';
import { isNewDay, isMidnightExpired } from '../../utils/dates';
import { JourneyStateMachine } from './JourneyStateMachine';

export interface MidnightCheckResult {
  updated: boolean;
  journey: JourneyDoc;
}

export class MidnightBoundaryHandler {
  static check(journey: JourneyDoc): MidnightCheckResult {
    if (
      journey.journeyState === 'COMPLETED' ||
      journey.journeyState === 'PAYWALL_FROZEN'
    ) {
      return { updated: false, journey };
    }

    // A fresh journey (lastStepDate is null) should not be subject to midnight boundary.
    // The user hasn't taken any steps yet — don't move them to RESTING.
    if (journey.lastStepDate == null) {
      return { updated: false, journey };
    }

    const newDay = isNewDay(journey.lastStepDate);
    const keepWalkingExpired = isMidnightExpired(journey.keepWalkingExpiresAt);

    if (!newDay && !keepWalkingExpired) {
      return { updated: false, journey };
    }

    if (journey.journeyState === 'WALKING' && newDay) {
      const newState = JourneyStateMachine.transition(
        journey.journeyState,
        'MIDNIGHT',
      );
      return {
        updated: true,
        journey: {
          ...journey,
          journeyState: newState,
          keepWalkingToday: false,
          keepWalkingExpiresAt: null,
          lastClaimedSourceStepsToday: 0,
          updatedAt: new Date(),
        },
      };
    }

    if (journey.journeyState === 'PAUSED_AT_CHECKPOINT' && newDay) {
      return {
        updated: true,
        journey: {
          ...journey,
          journeyState: 'RESTING',
          pausedAtCheckpoint: false,
          keepWalkingToday: false,
          keepWalkingExpiresAt: null,
          lastClaimedSourceStepsToday: 0,
          updatedAt: new Date(),
        },
      };
    }

    if (journey.keepWalkingToday && keepWalkingExpired) {
      return {
        updated: true,
        journey: {
          ...journey,
          journeyState: 'RESTING',
          keepWalkingToday: false,
          keepWalkingExpiresAt: null,
          lastClaimedSourceStepsToday: 0,
          updatedAt: new Date(),
        },
      };
    }

    return { updated: false, journey };
  }
}
