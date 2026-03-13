import { buildCeremonyPayload, type CeremonyContext, type CeremonyPayload, type CeremonyType } from './CeremonyStrategy';

const VALID_TYPES: Set<CeremonyType> = new Set(['standard', 'paywall', 'completion']);

export class CeremonyHandlerRegistry {
  static buildCeremony(context: CeremonyContext): CeremonyPayload {
    if (!VALID_TYPES.has(context.ceremonyType)) {
      throw new Error(`Unknown ceremony type: ${context.ceremonyType}`);
    }
    return buildCeremonyPayload(context);
  }

  static hasCeremony(type: string): boolean {
    return VALID_TYPES.has(type as CeremonyType);
  }
}
