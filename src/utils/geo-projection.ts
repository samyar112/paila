import type { TrailBounds } from '../shared/everest-trail-coordinates';

export interface PixelPoint {
  x: number;
  y: number;
}

export function projectToPixel(
  lat: number,
  lon: number,
  bounds: TrailBounds,
  imageWidth: number,
  imageHeight: number,
): PixelPoint {
  const x = ((lon - bounds.west) / (bounds.east - bounds.west)) * imageWidth;
  // Latitude is inverted (north = top = y:0)
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * imageHeight;
  return { x, y };
}

export function projectTrailToPixels(
  coordinates: Array<{ lat: number; lon: number }>,
  bounds: TrailBounds,
  imageWidth: number,
  imageHeight: number,
): PixelPoint[] {
  return coordinates.map((c) => projectToPixel(c.lat, c.lon, bounds, imageWidth, imageHeight));
}

export function interpolateProgress(
  pixels: PixelPoint[],
  progressFraction: number,
): PixelPoint {
  if (pixels.length === 0) return { x: 0, y: 0 };
  if (progressFraction <= 0) return pixels[0]!;
  if (progressFraction >= 1) return pixels[pixels.length - 1]!;

  const totalSegments = pixels.length - 1;
  const exactIndex = progressFraction * totalSegments;
  const segmentIndex = Math.floor(exactIndex);
  const segmentFraction = exactIndex - segmentIndex;

  const start = pixels[segmentIndex]!;
  const end = pixels[Math.min(segmentIndex + 1, pixels.length - 1)]!;

  return {
    x: start.x + (end.x - start.x) * segmentFraction,
    y: start.y + (end.y - start.y) * segmentFraction,
  };
}
