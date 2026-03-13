export interface CeremonyPayload {
  milestoneSlug: string;
  milestoneName: string;
  nepaliName: string;
  altitudeMeters: number;
  heroImageAssetKey: string;
  dialogueLines: string[];
  ceremonyType: 'standard' | 'paywall' | 'completion';
  nextAction: 'continue' | 'paywall' | 'complete';
}

export interface CeremonyContext {
  milestoneSlug: string;
  englishTitle: string;
  nepaliTitle: string;
  triggerMeters: number;
  assetBundleId: string;
  ceremonyType: 'standard' | 'paywall' | 'completion';
  dialogueLines: string[];
}

export interface CeremonyStrategy {
  buildPayload(context: CeremonyContext): CeremonyPayload;
}
