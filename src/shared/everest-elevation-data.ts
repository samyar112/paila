import type { ElevationPoint } from '../components/journey/ElevationProfile';

// Real altitude data for the Everest Summit & Return route.
// Distances are cumulative meters along the route.
// Total route: ~340km (approach + summit + descent + flight to KTM)

export const EVEREST_ELEVATION_DATA: ElevationPoint[] = [
  // APPROACH
  { distanceMeters: 0, altitudeMeters: 2860, label: 'Lukla', isMilestone: true },
  { distanceMeters: 4000, altitudeMeters: 2700 },
  { distanceMeters: 8000, altitudeMeters: 2610, label: 'Phakding', isMilestone: true },
  { distanceMeters: 12000, altitudeMeters: 2800 },
  { distanceMeters: 16000, altitudeMeters: 3100 },
  { distanceMeters: 19000, altitudeMeters: 3440, label: 'Namche Bazaar', isMilestone: true },

  // TREK TO BASE CAMP
  { distanceMeters: 24000, altitudeMeters: 3600 },
  { distanceMeters: 29000, altitudeMeters: 3867, label: 'Tengboche', isMilestone: true },
  { distanceMeters: 34000, altitudeMeters: 3800 },
  { distanceMeters: 39000, altitudeMeters: 4100 },
  { distanceMeters: 44000, altitudeMeters: 4410, label: 'Dingboche', isMilestone: true },
  { distanceMeters: 50000, altitudeMeters: 4600 },
  { distanceMeters: 55000, altitudeMeters: 4940, label: 'Lobuche', isMilestone: true },
  { distanceMeters: 59000, altitudeMeters: 5050 },
  { distanceMeters: 62000, altitudeMeters: 5164, label: 'Gorak Shep', isMilestone: true },
  { distanceMeters: 65000, altitudeMeters: 5200 },
  { distanceMeters: 68000, altitudeMeters: 5364, label: 'Base Camp', isMilestone: true },

  // SUMMIT PUSH
  { distanceMeters: 71000, altitudeMeters: 5500 },
  { distanceMeters: 74000, altitudeMeters: 5943, label: 'Camp 1', isMilestone: true },
  { distanceMeters: 78000, altitudeMeters: 6100 },
  { distanceMeters: 81000, altitudeMeters: 6400, label: 'Camp 2', isMilestone: true },
  { distanceMeters: 84000, altitudeMeters: 6800 },
  { distanceMeters: 87000, altitudeMeters: 7162, label: 'Camp 3', isMilestone: true },
  { distanceMeters: 90000, altitudeMeters: 7500 },
  { distanceMeters: 93000, altitudeMeters: 7920, label: 'Camp 4', isMilestone: true },
  { distanceMeters: 95000, altitudeMeters: 8200 },
  { distanceMeters: 97000, altitudeMeters: 8600 },
  { distanceMeters: 98000, altitudeMeters: 8849, label: 'SUMMIT', isMilestone: true },

  // DESCENT
  { distanceMeters: 102000, altitudeMeters: 8200 },
  { distanceMeters: 108000, altitudeMeters: 7000 },
  { distanceMeters: 115000, altitudeMeters: 5943 },
  { distanceMeters: 128000, altitudeMeters: 5364, label: 'Base Camp (return)', isMilestone: true },
  { distanceMeters: 145000, altitudeMeters: 4400 },
  { distanceMeters: 170000, altitudeMeters: 3440 },
  { distanceMeters: 190000, altitudeMeters: 2860, label: 'Lukla (return)', isMilestone: true },

  // FLIGHT TO KATHMANDU
  { distanceMeters: 220000, altitudeMeters: 2400 },
  { distanceMeters: 280000, altitudeMeters: 1800 },
  { distanceMeters: 340000, altitudeMeters: 1400, label: 'Kathmandu', isMilestone: true },
];

export const EVEREST_TOTAL_METERS = 340000;
