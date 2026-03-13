export type CeremonyType = 'standard' | 'paywall' | 'completion';
export type CeremonyNextAction = 'continue' | 'paywall' | 'complete';

export interface CeremonyPayload {
  milestoneSlug: string;
  milestoneName: string;
  nepaliName: string;
  altitudeMeters: number;
  heroImageAssetKey: string;
  dialogueLines: string[];
  ceremonyType: CeremonyType;
  nextAction: CeremonyNextAction;
}

export interface CeremonyContext {
  milestoneSlug: string;
  englishTitle: string;
  nepaliTitle: string;
  triggerMeters: number;
  assetBundleId: string;
  ceremonyType: CeremonyType;
  dialogueLines: string[];
}

const NEXT_ACTION: Record<CeremonyType, CeremonyNextAction> = {
  standard: 'continue',
  paywall: 'paywall',
  completion: 'complete',
};

export function buildCeremonyPayload(context: CeremonyContext): CeremonyPayload {
  return {
    milestoneSlug: context.milestoneSlug,
    milestoneName: context.englishTitle,
    nepaliName: context.nepaliTitle,
    altitudeMeters: context.triggerMeters,
    heroImageAssetKey: `${context.assetBundleId}/image`,
    dialogueLines: context.dialogueLines,
    ceremonyType: context.ceremonyType,
    nextAction: NEXT_ACTION[context.ceremonyType],
  };
}
