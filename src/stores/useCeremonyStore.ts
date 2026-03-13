import { create } from 'zustand';
import type { CeremonyPayload, CeremonyNextAction } from '../services/ceremony/CeremonyStrategy';

interface CeremonyStoreState {
  activeCeremony: CeremonyPayload | null;
  ceremonyQueue: CeremonyPayload[];
  lastDismissedAction: CeremonyNextAction | null;
}

interface CeremonyStoreActions {
  queueCeremony: (payload: CeremonyPayload) => void;
  dismissCeremony: () => void;
  clearLastDismissedAction: () => void;
  reset: () => void;
}

type CeremonyStore = CeremonyStoreState & CeremonyStoreActions;

const INITIAL_STATE: CeremonyStoreState = {
  activeCeremony: null,
  ceremonyQueue: [],
  lastDismissedAction: null,
};

export const useCeremonyStore = create<CeremonyStore>((set, get) => ({
  ...INITIAL_STATE,

  queueCeremony: (payload: CeremonyPayload) => {
    const { activeCeremony, ceremonyQueue } = get();
    if (!activeCeremony) {
      set({ activeCeremony: payload });
    } else {
      set({ ceremonyQueue: [...ceremonyQueue, payload] });
    }
  },

  dismissCeremony: () => {
    const { activeCeremony, ceremonyQueue } = get();
    const nextAction = activeCeremony?.nextAction ?? null;

    if (ceremonyQueue.length === 0) {
      set({ activeCeremony: null, lastDismissedAction: nextAction });
      return;
    }
    const [next, ...rest] = ceremonyQueue;
    set({ activeCeremony: next ?? null, ceremonyQueue: rest, lastDismissedAction: nextAction });
  },

  clearLastDismissedAction: () => set({ lastDismissedAction: null }),

  reset: () => set(INITIAL_STATE),
}));
