import type { CeremonyStrategy, CeremonyContext, CeremonyPayload } from './CeremonyStrategy';
import { StandardCeremonyStrategy } from './StandardCeremonyStrategy';
import { PaywallCeremonyStrategy } from './PaywallCeremonyStrategy';
import { CompletionCeremonyStrategy } from './CompletionCeremonyStrategy';

type CeremonyType = 'standard' | 'paywall' | 'completion';

const strategies: Record<CeremonyType, CeremonyStrategy> = {
  standard: new StandardCeremonyStrategy(),
  paywall: new PaywallCeremonyStrategy(),
  completion: new CompletionCeremonyStrategy(),
};

export class CeremonyHandlerRegistry {
  static buildCeremony(context: CeremonyContext): CeremonyPayload {
    const strategy = strategies[context.ceremonyType];
    if (!strategy) {
      throw new Error(`Unknown ceremony type: ${context.ceremonyType}`);
    }
    return strategy.buildPayload(context);
  }

  static hasCeremony(type: string): boolean {
    return type in strategies;
  }
}
