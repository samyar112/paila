import { useJourneyStore } from '../src/stores/useJourneyStore';
import { useCeremonyStore } from '../src/stores/useCeremonyStore';
import { useContentStore } from '../src/stores/useContentStore';
import { resetAllStores } from '../src/stores/resetAllStores';

describe('resetAllStores', () => {
  it('resets journey store to initial state', () => {
    useJourneyStore.setState({
      journeyId: 'test-123',
      isLoading: true,
      error: 'some error',
    });

    resetAllStores();

    const state = useJourneyStore.getState();
    expect(state.journey).toBeNull();
    expect(state.journeyId).toBeNull();
    expect(state.route).toBeNull();
    expect(state.milestones).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('resets ceremony store to initial state', () => {
    useCeremonyStore.getState().queueCeremony({
      milestoneSlug: 'lukla',
      milestoneName: 'Lukla',
      nepaliName: 'लुक्ला',
      altitudeMeters: 2860,
      heroImageAssetKey: 'everest-lukla/image',
      dialogueLines: ['Welcome.'],
      ceremonyType: 'standard',
      nextAction: 'continue',
    });

    resetAllStores();

    const state = useCeremonyStore.getState();
    expect(state.activeCeremony).toBeNull();
    expect(state.ceremonyQueue).toEqual([]);
  });

  it('resets content store to initial state', () => {
    useContentStore.setState({
      downloadState: 'downloading',
      downloadProgress: 0.5,
      downloadError: 'test error',
    });

    resetAllStores();

    const state = useContentStore.getState();
    expect(state.downloadState).toBe('idle');
    expect(state.downloadProgress).toBe(0);
    expect(state.downloadError).toBeNull();
  });

  it('does not throw when stores are already in initial state', () => {
    expect(() => resetAllStores()).not.toThrow();
  });
});
