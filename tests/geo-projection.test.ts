import { projectToPixel, projectTrailToPixels, interpolateProgress } from '../src/utils/geo-projection';
import type { TrailBounds } from '../src/shared/everest-trail-coordinates';

const bounds: TrailBounds = {
  north: 28.01,
  south: 27.68,
  east: 86.93,
  west: 86.70,
};

const IMAGE_WIDTH = 1000;
const IMAGE_HEIGHT = 800;

describe('projectToPixel', () => {
  it('maps top-left corner (north, west) to (0, 0)', () => {
    // Arrange
    const lat = bounds.north;
    const lon = bounds.west;

    // Act
    const result = projectToPixel(lat, lon, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);

    // Assert
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
  });

  it('maps bottom-right corner (south, east) to (imageWidth, imageHeight)', () => {
    // Arrange
    const lat = bounds.south;
    const lon = bounds.east;

    // Act
    const result = projectToPixel(lat, lon, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);

    // Assert
    expect(result.x).toBeCloseTo(IMAGE_WIDTH, 5);
    expect(result.y).toBeCloseTo(IMAGE_HEIGHT, 5);
  });

  it('maps center of bounds to center of image', () => {
    // Arrange
    const lat = (bounds.north + bounds.south) / 2;
    const lon = (bounds.east + bounds.west) / 2;

    // Act
    const result = projectToPixel(lat, lon, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);

    // Assert
    expect(result.x).toBeCloseTo(IMAGE_WIDTH / 2, 5);
    expect(result.y).toBeCloseTo(IMAGE_HEIGHT / 2, 5);
  });
});

describe('projectTrailToPixels', () => {
  it('returns the correct number of points', () => {
    // Arrange
    const coordinates = [
      { lat: 27.80, lon: 86.80 },
      { lat: 27.85, lon: 86.85 },
      { lat: 27.90, lon: 86.90 },
    ];

    // Act
    const result = projectTrailToPixels(coordinates, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);

    // Assert
    expect(result).toHaveLength(3);
  });

  it('returns empty array for empty input', () => {
    // Arrange
    const coordinates: Array<{ lat: number; lon: number }> = [];

    // Act
    const result = projectTrailToPixels(coordinates, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);

    // Assert
    expect(result).toHaveLength(0);
  });
});

describe('interpolateProgress', () => {
  const pixels = [
    { x: 0, y: 0 },
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    { x: 300, y: 300 },
  ];

  it('returns first point at progress 0', () => {
    // Arrange & Act
    const result = interpolateProgress(pixels, 0);

    // Assert
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('returns last point at progress 1', () => {
    // Arrange & Act
    const result = interpolateProgress(pixels, 1);

    // Assert
    expect(result.x).toBe(300);
    expect(result.y).toBe(300);
  });

  it('returns approximate midpoint at progress 0.5', () => {
    // Arrange & Act
    const result = interpolateProgress(pixels, 0.5);

    // Assert
    expect(result.x).toBeCloseTo(150, 1);
    expect(result.y).toBeCloseTo(150, 1);
  });

  it('clamps negative progress to first point', () => {
    // Arrange & Act
    const result = interpolateProgress(pixels, -0.5);

    // Assert
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('clamps progress > 1 to last point', () => {
    // Arrange & Act
    const result = interpolateProgress(pixels, 1.5);

    // Assert
    expect(result.x).toBe(300);
    expect(result.y).toBe(300);
  });

  it('returns (0, 0) for empty pixel array', () => {
    // Arrange & Act
    const result = interpolateProgress([], 0.5);

    // Assert
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });
});
