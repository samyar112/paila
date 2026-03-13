import { useJourneyStore } from './useJourneyStore';
import { useContentStore } from './useContentStore';
import { useCeremonyStore } from './useCeremonyStore';

export function resetAllStores(): void {
  useJourneyStore.getState().reset();
  useContentStore.getState().reset();
  useCeremonyStore.getState().reset();
}
