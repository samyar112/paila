import { formatDistance, formatElevation, formatDistanceShort } from '../src/utils/units';

describe('formatDistance', () => {
  it('formats zero meters', () => {
    expect(formatDistance(0)).toBe('0.0 km (0.0 mi)');
  });

  it('formats a small distance', () => {
    expect(formatDistance(500)).toBe('0.5 km (0.3 mi)');
  });

  it('formats a medium distance', () => {
    expect(formatDistance(10000)).toBe('10.0 km (6.2 mi)');
  });

  it('formats a large distance', () => {
    expect(formatDistance(340000)).toBe('340.0 km (211.3 mi)');
  });

  it('formats 1 meter', () => {
    expect(formatDistance(1)).toBe('0.0 km (0.0 mi)');
  });
});

describe('formatElevation', () => {
  it('formats zero elevation', () => {
    expect(formatElevation(0)).toBe('0m (0 ft)');
  });

  it('formats low elevation', () => {
    expect(formatElevation(100)).toBe('100m (328 ft)');
  });

  it('formats Everest summit elevation', () => {
    // 8849 * 3.28084 = 29,032 (rounded)
    expect(formatElevation(8849)).toMatch(/^8,849m \(29,03[12] ft\)$/);
  });

  it('formats a mid-range elevation', () => {
    // 5364 * 3.28084 = 17,598 (rounded)
    expect(formatElevation(5364)).toMatch(/^5,364m \(17,59[78] ft\)$/);
  });

  it('formats small elevation', () => {
    expect(formatElevation(1)).toBe('1m (3 ft)');
  });
});

describe('formatDistanceShort', () => {
  it('formats zero meters', () => {
    expect(formatDistanceShort(0)).toBe('0.0 km');
  });

  it('formats a small distance', () => {
    expect(formatDistanceShort(500)).toBe('0.5 km');
  });

  it('formats a medium distance', () => {
    expect(formatDistanceShort(10000)).toBe('10.0 km');
  });

  it('formats a large distance', () => {
    expect(formatDistanceShort(340000)).toBe('340.0 km');
  });
});
