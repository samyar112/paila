import { create } from 'zustand';
import type { JourneyDoc, RouteDoc, MilestoneDoc } from '../shared/schemas';
import { JourneyService } from '../services/journey/JourneyService';
import { JourneyProgressionService } from '../services/journey/JourneyProgressionService';
import { JourneyStateMachine } from '../services/journey/JourneyStateMachine';
import { StaticContentRepository } from '../repositories/StaticContentRepository';
import { getLocalMidnightISO } from '../utils/dates';

interface JourneyStoreState {
  journey: JourneyDoc | null;
  journeyId: string | null;
  route: RouteDoc | null;
  milestones: MilestoneDoc[];
  isLoading: boolean;
  error: string | null;
}

interface JourneyStoreActions {
  loadJourney: (userId: string) => Promise<void>;
  startJourney: (
    userId: string,
    routeId: string,
    routeVersion: number,
  ) => Promise<void>;
  applyForegroundSteps: (
    userId: string,
    newSourceSteps: number,
  ) => Promise<void>;
  chooseRest: (userId: string) => Promise<void>;
  chooseKeepWalking: (userId: string) => Promise<void>;
  reset: () => void;
}

type JourneyStore = JourneyStoreState & JourneyStoreActions;

const INITIAL_STATE: JourneyStoreState = {
  journey: null,
  journeyId: null,
  route: null,
  milestones: [],
  isLoading: false,
  error: null,
};

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  ...INITIAL_STATE,

  loadJourney: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const active = await JourneyService.getActiveJourney(userId);
      if (!active) {
        set({ ...INITIAL_STATE, isLoading: false });
        return;
      }

      const route = await StaticContentRepository.getRoute(
        active.data.routeId,
      );
      const milestones = route
        ? await StaticContentRepository.getMilestones(active.data.routeId)
        : [];

      set({
        journey: active.data,
        journeyId: active.id,
        route,
        milestones,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load journey',
        isLoading: false,
      });
    }
  },

  startJourney: async (
    userId: string,
    routeId: string,
    routeVersion: number,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await JourneyService.startJourney(userId, routeId, routeVersion);
      await get().loadJourney(userId);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to start journey',
        isLoading: false,
      });
    }
  },

  applyForegroundSteps: async (userId: string, newSourceSteps: number) => {
    const { journey, journeyId, route, milestones } = get();
    if (!journey || !journeyId || !route) return;
    if (journey.journeyState !== 'WALKING') return;

    try {
      const { updatedJourney } = JourneyProgressionService.applySteps(
        journey,
        route,
        milestones,
        newSourceSteps,
      );

      set({ journey: updatedJourney });
      await JourneyService.updateJourney(userId, journeyId, updatedJourney);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to apply steps',
      });
    }
  },

  chooseRest: async (userId: string) => {
    const { journey, journeyId } = get();
    if (!journey || !journeyId) return;
    if (journey.journeyState !== 'PAUSED_AT_CHECKPOINT') return;

    const prev = journey;
    const newState = JourneyStateMachine.transition(
      journey.journeyState,
      'USER_CHOSE_REST',
    );

    const updated: JourneyDoc = {
      ...journey,
      journeyState: newState,
      pausedAtCheckpoint: false,
      keepWalkingToday: false,
      keepWalkingExpiresAt: null,
      updatedAt: new Date(),
    };

    set({ journey: updated });
    try {
      await JourneyService.updateJourney(userId, journeyId, updated);
    } catch (err) {
      set({
        journey: prev,
        error: err instanceof Error ? err.message : 'Failed to save rest choice',
      });
    }
  },

  chooseKeepWalking: async (userId: string) => {
    const { journey, journeyId } = get();
    if (!journey || !journeyId) return;
    if (journey.journeyState !== 'PAUSED_AT_CHECKPOINT') return;

    const prev = journey;
    const newState = JourneyStateMachine.transition(
      journey.journeyState,
      'USER_CHOSE_KEEP_WALKING',
    );

    const updated: JourneyDoc = {
      ...journey,
      journeyState: newState,
      pausedAtCheckpoint: false,
      currentCheckpointId: null,
      keepWalkingToday: true,
      keepWalkingExpiresAt: getLocalMidnightISO(),
      updatedAt: new Date(),
    };

    set({ journey: updated });
    try {
      await JourneyService.updateJourney(userId, journeyId, updated);
    } catch (err) {
      set({
        journey: prev,
        error: err instanceof Error ? err.message : 'Failed to save keep walking choice',
      });
    }
  },

  reset: () => set(INITIAL_STATE),
}));

// Selectors
export const selectIsAtCheckpoint = (s: JourneyStore): boolean =>
  s.journey?.journeyState === 'PAUSED_AT_CHECKPOINT';

export const selectIsPaywallFrozen = (s: JourneyStore): boolean =>
  s.journey?.journeyState === 'PAYWALL_FROZEN';

export const selectIsCompleted = (s: JourneyStore): boolean =>
  s.journey?.journeyState === 'COMPLETED';
