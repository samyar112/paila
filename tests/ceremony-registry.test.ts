import { CeremonyHandlerRegistry } from '../src/services/ceremony/CeremonyHandlerRegistry';
import { useCeremonyStore } from '../src/stores/useCeremonyStore';
import type { CeremonyContext, CeremonyPayload } from '../src/services/ceremony/CeremonyStrategy';

function makeContext(overrides: Partial<CeremonyContext> = {}): CeremonyContext {
  return {
    milestoneSlug: 'lukla',
    englishTitle: 'Lukla',
    nepaliTitle: 'लुक्ला',
    triggerMeters: 2860,
    assetBundleId: 'everest-lukla',
    ceremonyType: 'standard',
    dialogueLines: ['Welcome to Lukla.', 'The journey begins.'],
    ...overrides,
  };
}

function makePayload(overrides: Partial<CeremonyPayload> = {}): CeremonyPayload {
  return {
    milestoneSlug: 'lukla',
    milestoneName: 'Lukla',
    nepaliName: 'लुक्ला',
    altitudeMeters: 2860,
    heroImageAssetKey: 'everest-lukla/image',
    dialogueLines: ['Welcome to Lukla.'],
    ceremonyType: 'standard',
    nextAction: 'continue',
    ...overrides,
  };
}

describe('CeremonyHandlerRegistry', () => {
  describe('buildCeremony', () => {
    it('returns nextAction "continue" for standard type', () => {
      const result = CeremonyHandlerRegistry.buildCeremony(makeContext());
      expect(result.nextAction).toBe('continue');
      expect(result.ceremonyType).toBe('standard');
    });

    it('returns nextAction "paywall" for paywall type', () => {
      const result = CeremonyHandlerRegistry.buildCeremony(
        makeContext({ ceremonyType: 'paywall' }),
      );
      expect(result.nextAction).toBe('paywall');
      expect(result.ceremonyType).toBe('paywall');
    });

    it('returns nextAction "complete" for completion type', () => {
      const result = CeremonyHandlerRegistry.buildCeremony(
        makeContext({ ceremonyType: 'completion' }),
      );
      expect(result.nextAction).toBe('complete');
      expect(result.ceremonyType).toBe('completion');
    });

    it('includes all context fields in payload', () => {
      const ctx = makeContext({
        milestoneSlug: 'namche-bazaar',
        englishTitle: 'Namche Bazaar',
        nepaliTitle: 'नाम्चे बजार',
        triggerMeters: 3440,
        assetBundleId: 'everest-namche',
      });
      const result = CeremonyHandlerRegistry.buildCeremony(ctx);
      expect(result.milestoneSlug).toBe('namche-bazaar');
      expect(result.milestoneName).toBe('Namche Bazaar');
      expect(result.nepaliName).toBe('नाम्चे बजार');
      expect(result.altitudeMeters).toBe(3440);
      expect(result.heroImageAssetKey).toBe('everest-namche/image');
      expect(result.dialogueLines).toEqual(ctx.dialogueLines);
    });

    it('throws for unknown ceremony type', () => {
      expect(() =>
        CeremonyHandlerRegistry.buildCeremony(
          makeContext({ ceremonyType: 'unknown' as 'standard' }),
        ),
      ).toThrow('Unknown ceremony type');
    });
  });

  describe('hasCeremony', () => {
    it('returns true for standard', () => {
      expect(CeremonyHandlerRegistry.hasCeremony('standard')).toBe(true);
    });

    it('returns true for paywall', () => {
      expect(CeremonyHandlerRegistry.hasCeremony('paywall')).toBe(true);
    });

    it('returns true for completion', () => {
      expect(CeremonyHandlerRegistry.hasCeremony('completion')).toBe(true);
    });

    it('returns false for unknown', () => {
      expect(CeremonyHandlerRegistry.hasCeremony('unknown')).toBe(false);
    });
  });
});

describe('useCeremonyStore', () => {
  beforeEach(() => {
    useCeremonyStore.getState().reset();
  });

  it('sets activeCeremony when queue is empty', () => {
    const payload = makePayload();
    useCeremonyStore.getState().queueCeremony(payload);
    expect(useCeremonyStore.getState().activeCeremony).toEqual(payload);
    expect(useCeremonyStore.getState().ceremonyQueue).toEqual([]);
  });

  it('adds to queue when activeCeremony exists', () => {
    const first = makePayload({ milestoneSlug: 'lukla' });
    const second = makePayload({ milestoneSlug: 'phakding' });
    useCeremonyStore.getState().queueCeremony(first);
    useCeremonyStore.getState().queueCeremony(second);
    expect(useCeremonyStore.getState().activeCeremony).toEqual(first);
    expect(useCeremonyStore.getState().ceremonyQueue).toEqual([second]);
  });

  it('dismissCeremony shows next from queue', () => {
    const first = makePayload({ milestoneSlug: 'lukla' });
    const second = makePayload({ milestoneSlug: 'phakding' });
    useCeremonyStore.getState().queueCeremony(first);
    useCeremonyStore.getState().queueCeremony(second);
    useCeremonyStore.getState().dismissCeremony();
    expect(useCeremonyStore.getState().activeCeremony).toEqual(second);
    expect(useCeremonyStore.getState().ceremonyQueue).toEqual([]);
  });

  it('dismissCeremony clears when queue is empty', () => {
    useCeremonyStore.getState().queueCeremony(makePayload());
    useCeremonyStore.getState().dismissCeremony();
    expect(useCeremonyStore.getState().activeCeremony).toBeNull();
  });

  it('reset clears everything', () => {
    useCeremonyStore.getState().queueCeremony(makePayload());
    useCeremonyStore.getState().queueCeremony(makePayload());
    useCeremonyStore.getState().reset();
    expect(useCeremonyStore.getState().activeCeremony).toBeNull();
    expect(useCeremonyStore.getState().ceremonyQueue).toEqual([]);
  });
});
