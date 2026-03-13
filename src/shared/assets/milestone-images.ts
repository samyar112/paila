// Milestone image registry. Maps milestone slugs to bundled image requires.
// Images that are not yet bundled use null — screens should show a colored placeholder.
// Replace null entries with require() calls as images are added to assets/images/milestones/

export type MilestoneSlug =
  | 'lukla' | 'phakding' | 'namche-bazaar' | 'tengboche' | 'dingboche'
  | 'lobuche' | 'gorak-shep' | 'everest-base-camp' | 'camp-1' | 'camp-2'
  | 'camp-3' | 'camp-4-south-col' | 'the-summit' | 'base-camp-return'
  | 'lukla-return' | 'kathmandu';

// Use require() for bundled images so Metro can resolve them at build time.
// null = image not yet bundled, screen should show themed placeholder.
const MILESTONE_IMAGES: Record<MilestoneSlug, ReturnType<typeof require> | null> = {
  'lukla': require('../../../assets/images/milestones/lukla.jpg'),
  'phakding': require('../../../assets/images/milestones/phakding.jpg'),
  'namche-bazaar': require('../../../assets/images/milestones/namche-bazaar.jpg'),
  'tengboche': require('../../../assets/images/milestones/tengboche.jpg'),
  'dingboche': require('../../../assets/images/milestones/dingboche.jpg'),
  'lobuche': require('../../../assets/images/milestones/lobuche.jpg'),
  'gorak-shep': require('../../../assets/images/milestones/gorak-shep.jpg'),
  'everest-base-camp': require('../../../assets/images/milestones/everest-base-camp.jpg'),
  'camp-1': require('../../../assets/images/milestones/camp-1.jpg'),
  'camp-2': require('../../../assets/images/milestones/camp-2.jpg'),
  'camp-3': require('../../../assets/images/milestones/camp-3.jpg'),
  'camp-4-south-col': require('../../../assets/images/milestones/camp-4-south-col.jpg'),
  'the-summit': require('../../../assets/images/milestones/the-summit.jpg'),
  'base-camp-return': require('../../../assets/images/milestones/base-camp-return.jpg'),
  'lukla-return': require('../../../assets/images/milestones/lukla-return.jpg'),
  'kathmandu': require('../../../assets/images/milestones/kathmandu.jpg'),
};

export function getMilestoneImage(slug: string): ReturnType<typeof require> | null {
  return MILESTONE_IMAGES[slug as MilestoneSlug] ?? null;
}

// Lazy-loaded when wired to TrailMapView. Not bundled by default (3.4MB).
export const TRAIL_MAP_IMAGE: ReturnType<typeof require> | null = null;

// Airplane intro background
export const AIRPLANE_INTRO_IMAGE: ReturnType<typeof require> | null =
  require('../../../assets/images/airplane-intro.jpg');
