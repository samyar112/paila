export function stepsToMeters(
  steps: number,
  totalStepsCanonical: number,
  totalMeters: number,
): number {
  if (totalStepsCanonical === 0) return 0;
  return steps * (totalMeters / totalStepsCanonical);
}

export function progressPercent(
  progressMeters: number,
  totalMeters: number,
): number {
  if (totalMeters === 0) return 0;
  return Math.min(1, progressMeters / totalMeters);
}

export function capAtCeiling(value: number, ceiling: number): number {
  return Math.min(value, ceiling);
}
