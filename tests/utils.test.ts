import {
  getLocalDateString,
  getLocalMidnightISO,
  isNewDay,
  isMidnightExpired,
  diffCalendarDays,
} from '../src/utils/dates';

import {
  stepsToMeters,
  progressPercent,
  capAtCeiling,
} from '../src/utils/meters';

import {
  InvalidArgumentError,
  InvalidStateError,
  NotFoundError,
} from '../src/utils/errors';

// ─── dates.ts ────────────────────────────────────────────────────────

describe('dates', () => {
  describe('getLocalDateString', () => {
    it('formats a known date as YYYY-MM-DD', () => {
      const date = new Date(2026, 0, 5); // Jan 5 2026
      expect(getLocalDateString(date)).toBe('2026-01-05');
    });

    it('pads single-digit month and day', () => {
      const date = new Date(2026, 2, 3); // Mar 3 2026
      expect(getLocalDateString(date)).toBe('2026-03-03');
    });

    it('handles December 31 correctly', () => {
      const date = new Date(2026, 11, 31); // Dec 31 2026
      expect(getLocalDateString(date)).toBe('2026-12-31');
    });

    it('returns today when called with no argument', () => {
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(getLocalDateString()).toBe(expected);
    });
  });

  describe('getLocalMidnightISO', () => {
    it('returns ISO string for midnight of the next day', () => {
      const date = new Date(2026, 2, 13, 15, 30, 0); // Mar 13 2026, 3:30 PM
      const result = getLocalMidnightISO(date);
      const parsed = new Date(result);
      // Should be Mar 14 at midnight local time
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(2); // March
      expect(parsed.getDate()).toBe(14);
      expect(parsed.getHours()).toBe(0);
      expect(parsed.getMinutes()).toBe(0);
      expect(parsed.getSeconds()).toBe(0);
    });

    it('returns an ISO 8601 string', () => {
      const result = getLocalMidnightISO(new Date(2026, 0, 1));
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('handles end of month rollover', () => {
      const date = new Date(2026, 0, 31); // Jan 31
      const result = getLocalMidnightISO(date);
      const parsed = new Date(result);
      expect(parsed.getMonth()).toBe(1); // February
      expect(parsed.getDate()).toBe(1);
    });

    it('handles end of year rollover', () => {
      const date = new Date(2026, 11, 31); // Dec 31
      const result = getLocalMidnightISO(date);
      const parsed = new Date(result);
      expect(parsed.getFullYear()).toBe(2027);
      expect(parsed.getMonth()).toBe(0); // January
      expect(parsed.getDate()).toBe(1);
    });

    it('defaults to today when called with no argument', () => {
      const result = getLocalMidnightISO();
      const parsed = new Date(result);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(parsed.getDate()).toBe(tomorrow.getDate());
    });
  });

  describe('isNewDay', () => {
    it('returns true when lastDate is null', () => {
      expect(isNewDay(null)).toBe(true);
    });

    it('returns true when lastDate is undefined', () => {
      expect(isNewDay(undefined)).toBe(true);
    });

    it('returns true when lastDate is empty string', () => {
      // empty string is falsy, so should return true
      expect(isNewDay('')).toBe(true);
    });

    it('returns false when lastDate matches today', () => {
      const today = getLocalDateString();
      expect(isNewDay(today)).toBe(false);
    });

    it('returns true when lastDate is yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      expect(isNewDay(yesterdayStr)).toBe(true);
    });
  });

  describe('isMidnightExpired', () => {
    it('returns false when expiresAt is null', () => {
      expect(isMidnightExpired(null)).toBe(false);
    });

    it('returns true when expiresAt is in the past', () => {
      const past = new Date(2020, 0, 1).toISOString();
      expect(isMidnightExpired(past)).toBe(true);
    });

    it('returns false when expiresAt is far in the future', () => {
      const future = new Date(2099, 11, 31).toISOString();
      expect(isMidnightExpired(future)).toBe(false);
    });

    it('returns true when expiresAt equals now (boundary)', () => {
      // current time >= expiresAt → true
      const now = new Date().toISOString();
      // Tiny race possible but should be true since we compare >=
      expect(isMidnightExpired(now)).toBe(true);
    });
  });

  describe('diffCalendarDays', () => {
    it('returns 0 for the same date', () => {
      expect(diffCalendarDays('2026-03-13', '2026-03-13')).toBe(0);
    });

    it('returns 1 for consecutive days', () => {
      expect(diffCalendarDays('2026-03-13', '2026-03-14')).toBe(1);
    });

    it('returns correct value for multi-day span', () => {
      expect(diffCalendarDays('2026-01-01', '2026-01-10')).toBe(9);
    });

    it('returns 0 when endDate is before startDate (no negatives)', () => {
      expect(diffCalendarDays('2026-03-15', '2026-03-10')).toBe(0);
    });

    it('handles cross-month boundaries', () => {
      expect(diffCalendarDays('2026-01-30', '2026-02-02')).toBe(3);
    });

    it('handles cross-year boundaries', () => {
      expect(diffCalendarDays('2025-12-30', '2026-01-02')).toBe(3);
    });

    it('handles leap year', () => {
      // 2028 is a leap year
      expect(diffCalendarDays('2028-02-28', '2028-03-01')).toBe(2);
    });
  });
});

// ─── meters.ts ───────────────────────────────────────────────────────

describe('meters', () => {
  describe('stepsToMeters', () => {
    it('converts steps proportionally', () => {
      // 500 steps out of 1000 total, route is 2000m → 1000m
      expect(stepsToMeters(500, 1000, 2000)).toBe(1000);
    });

    it('returns 0 when totalStepsCanonical is 0', () => {
      expect(stepsToMeters(100, 0, 2000)).toBe(0);
    });

    it('returns 0 when steps is 0', () => {
      expect(stepsToMeters(0, 1000, 2000)).toBe(0);
    });

    it('handles exact match (all steps taken)', () => {
      expect(stepsToMeters(1000, 1000, 5000)).toBe(5000);
    });

    it('allows exceeding total steps (returns more than totalMeters)', () => {
      // If a user takes more steps than canonical, meters can exceed total
      expect(stepsToMeters(2000, 1000, 5000)).toBe(10000);
    });

    it('handles large step counts', () => {
      const result = stepsToMeters(100000, 200000, 300000);
      expect(result).toBe(150000);
    });

    it('handles fractional results', () => {
      const result = stepsToMeters(1, 3, 100);
      expect(result).toBeCloseTo(33.333, 2);
    });
  });

  describe('progressPercent', () => {
    it('returns 0 when totalMeters is 0', () => {
      expect(progressPercent(100, 0)).toBe(0);
    });

    it('returns 0 when progressMeters is 0', () => {
      expect(progressPercent(0, 1000)).toBe(0);
    });

    it('returns 0.5 at halfway', () => {
      expect(progressPercent(500, 1000)).toBe(0.5);
    });

    it('returns 1 at completion', () => {
      expect(progressPercent(1000, 1000)).toBe(1);
    });

    it('caps at 1 even when progress exceeds total', () => {
      expect(progressPercent(1500, 1000)).toBe(1);
    });

    it('handles small fractions', () => {
      expect(progressPercent(1, 10000)).toBeCloseTo(0.0001, 4);
    });
  });

  describe('capAtCeiling', () => {
    it('returns value when below ceiling', () => {
      expect(capAtCeiling(50, 100)).toBe(50);
    });

    it('returns ceiling when value exceeds it', () => {
      expect(capAtCeiling(150, 100)).toBe(100);
    });

    it('returns value when equal to ceiling', () => {
      expect(capAtCeiling(100, 100)).toBe(100);
    });

    it('works with zero values', () => {
      expect(capAtCeiling(0, 100)).toBe(0);
      expect(capAtCeiling(100, 0)).toBe(0);
    });

    it('works with negative values', () => {
      expect(capAtCeiling(-10, 5)).toBe(-10);
      expect(capAtCeiling(10, -5)).toBe(-5);
    });
  });
});

// ─── errors.ts ───────────────────────────────────────────────────────

describe('errors', () => {
  describe('InvalidArgumentError', () => {
    it('sets name correctly', () => {
      const err = new InvalidArgumentError('bad input');
      expect(err.name).toBe('InvalidArgumentError');
    });

    it('sets message correctly', () => {
      const err = new InvalidArgumentError('bad input');
      expect(err.message).toBe('bad input');
    });

    it('is an instance of Error', () => {
      const err = new InvalidArgumentError('test');
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('InvalidStateError', () => {
    it('sets name correctly', () => {
      const err = new InvalidStateError('unexpected state');
      expect(err.name).toBe('InvalidStateError');
    });

    it('sets message correctly', () => {
      const err = new InvalidStateError('unexpected state');
      expect(err.message).toBe('unexpected state');
    });

    it('is an instance of Error', () => {
      const err = new InvalidStateError('test');
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('NotFoundError', () => {
    it('sets name correctly', () => {
      const err = new NotFoundError('User', 'abc123');
      expect(err.name).toBe('NotFoundError');
    });

    it('composes message from resource and id', () => {
      const err = new NotFoundError('User', 'abc123');
      expect(err.message).toBe('User not found: abc123');
    });

    it('is an instance of Error', () => {
      const err = new NotFoundError('Journey', 'xyz');
      expect(err).toBeInstanceOf(Error);
    });

    it('handles empty strings for resource and id', () => {
      const err = new NotFoundError('', '');
      expect(err.message).toBe(' not found: ');
    });
  });
});
