import type { CeremonyStrategy, CeremonyContext, CeremonyPayload } from './CeremonyStrategy';

export class CompletionCeremonyStrategy implements CeremonyStrategy {
  buildPayload(context: CeremonyContext): CeremonyPayload {
    return {
      milestoneSlug: context.milestoneSlug,
      milestoneName: context.englishTitle,
      nepaliName: context.nepaliTitle,
      altitudeMeters: context.triggerMeters,
      heroImageAssetKey: `${context.assetBundleId}/image`,
      dialogueLines: context.dialogueLines,
      ceremonyType: 'completion',
      nextAction: 'complete',
    };
  }
}
