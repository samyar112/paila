const KM_PER_METER = 0.001;
const MI_PER_METER = 0.000621371;
const FT_PER_METER = 3.28084;

export function formatDistance(meters: number): string {
  const km = (meters * KM_PER_METER).toFixed(1);
  const mi = (meters * MI_PER_METER).toFixed(1);
  return `${km} km (${mi} mi)`;
}

export function formatElevation(meters: number): string {
  const ft = Math.round(meters * FT_PER_METER).toLocaleString();
  const m = meters.toLocaleString();
  return `${m}m (${ft} ft)`;
}

export function formatDistanceShort(meters: number): string {
  const km = (meters * KM_PER_METER).toFixed(1);
  return `${km} km`;
}
