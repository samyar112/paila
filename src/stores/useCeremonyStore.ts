import { create } from 'zustand';
import type { CeremonyPayload } from '../services/ceremony/CeremonyStrategy';

interface CeremonyStoreState {
  activeCeremony: CeremonyPayload | null;
  ceremonyQueue: CeremonyPayload[];
}

interface CeremonyStoreActions {
  queueCeremony: (payload: CeremonyPayload) => void;
  dismissCeremony: () => void;
  reset: () => void;
}

type CeremonyStore = CeremonyStoreState & CeremonyStoreActions;

const INITIAL_STATE: CeremonyStoreState = {
  activeCeremony: null,
  ceremonyQueue: [],
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
    const { ceremonyQueue } = get();
    if (ceremonyQueue.length === 0) {
      set({ activeCeremony: null });
      return;
    }
    const [next, ...rest] = ceremonyQueue;
    set({ activeCeremony: next ?? null, ceremonyQueue: rest });
  },

  reset: () => set(INITIAL_STATE),
}));
