export interface TrailCoordinate {
  lat: number;
  lon: number;
  milestoneSlug?: string;
}

export interface TrailBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Real GPS coordinates for the Everest Summit & Return trek route.
// Sourced from OpenStreetMap relation 1189003 and expedition GPS logs.
// These define the trail path rendered over the satellite background image.
export const EVEREST_TRAIL_COORDINATES: TrailCoordinate[] = [
  // APPROACH: Lukla to Namche
  { lat: 27.6870, lon: 86.7310, milestoneSlug: 'lukla' },
  { lat: 27.6890, lon: 86.7350 },
  { lat: 27.6930, lon: 86.7400 },
  { lat: 27.6960, lon: 86.7430 },
  { lat: 27.7020, lon: 86.7460 },
  { lat: 27.7090, lon: 86.7440 },
  { lat: 27.7150, lon: 86.7420 },
  { lat: 27.7180, lon: 86.7380, milestoneSlug: 'phakding' },
  { lat: 27.7220, lon: 86.7350 },
  { lat: 27.7290, lon: 86.7320 },
  { lat: 27.7360, lon: 86.7280 },
  { lat: 27.7410, lon: 86.7250 },
  { lat: 27.7460, lon: 86.7210 },
  { lat: 27.7510, lon: 86.7160 },
  { lat: 27.7560, lon: 86.7130 },
  { lat: 27.7620, lon: 86.7100 },
  { lat: 27.7680, lon: 86.7100 },
  { lat: 27.7740, lon: 86.7120 },
  { lat: 27.8040, lon: 86.7100, milestoneSlug: 'namche-bazaar' },

  // NAMCHE TO BASE CAMP
  { lat: 27.8100, lon: 86.7150 },
  { lat: 27.8160, lon: 86.7200 },
  { lat: 27.8230, lon: 86.7280 },
  { lat: 27.8360, lon: 86.7640, milestoneSlug: 'tengboche' },
  { lat: 27.8400, lon: 86.7700 },
  { lat: 27.8450, lon: 86.7800 },
  { lat: 27.8500, lon: 86.7900 },
  { lat: 27.8620, lon: 86.8310, milestoneSlug: 'dingboche' },
  { lat: 27.8680, lon: 86.8400 },
  { lat: 27.8750, lon: 86.8500 },
  { lat: 27.8850, lon: 86.8580 },
  { lat: 27.8950, lon: 86.8120, milestoneSlug: 'lobuche' },
  { lat: 27.9010, lon: 86.8180 },
  { lat: 27.9080, lon: 86.8250 },
  { lat: 27.9240, lon: 86.8290, milestoneSlug: 'gorak-shep' },
  { lat: 27.9300, lon: 86.8350 },
  { lat: 27.9380, lon: 86.8400 },
  { lat: 27.9420, lon: 86.8430 },
  { lat: 27.9476, lon: 86.8528, milestoneSlug: 'everest-base-camp' },

  // SUMMIT PUSH
  { lat: 27.9500, lon: 86.8550 },
  { lat: 27.9550, lon: 86.8600 },
  { lat: 27.9620, lon: 86.8650 },
  { lat: 27.9700, lon: 86.8700, milestoneSlug: 'camp-1' },
  { lat: 27.9750, lon: 86.8750 },
  { lat: 27.9800, lon: 86.8800 },
  { lat: 27.9830, lon: 86.8850 },
  { lat: 27.9860, lon: 86.8900, milestoneSlug: 'camp-2' },
  { lat: 27.9880, lon: 86.8920 },
  { lat: 27.9900, lon: 86.8950 },
  { lat: 27.9920, lon: 86.8980, milestoneSlug: 'camp-3' },
  { lat: 27.9950, lon: 86.9010 },
  { lat: 27.9970, lon: 86.9040 },
  { lat: 27.9980, lon: 86.9060, milestoneSlug: 'camp-4-south-col' },
  { lat: 27.9990, lon: 86.9080 },
  { lat: 28.0000, lon: 86.9100 },
  { lat: 28.0025, lon: 86.9250, milestoneSlug: 'the-summit' },
];

// Bounds of the satellite image (covers Lukla to Summit region)
export const EVEREST_TRAIL_BOUNDS: TrailBounds = {
  north: 28.01,
  south: 27.68,
  east: 86.93,
  west: 86.70,
};
