import { routeCharacterSchema } from '../src/shared/schemas';
import { PEMBA_CHARACTER } from '../src/shared/data/pemba-dialogue';

const EXPECTED_MILESTONES = [
  'lukla',
  'phakding',
  'namche-bazaar',
  'tengboche',
  'dingboche',
  'lobuche',
  'gorak-shep',
  'everest-base-camp',
  'camp-1',
  'camp-2',
  'camp-3',
  'camp-4-south-col',
  'the-summit',
  'base-camp-return',
  'lukla-return',
  'kathmandu',
  'namche-return',
  'phakding-return',
  'lukla-return-free',
  'kathmandu-return',
];

const EXPECTED_TRIGGERS = [
  'idle_1day',
  'idle_3days',
  'idle_7days',
  'streak_milestone',
  'morning_nudge',
] as const;

describe('routeCharacterSchema', () => {
  it('validates PEMBA_CHARACTER successfully', () => {
    const result = routeCharacterSchema.safeParse(PEMBA_CHARACTER);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    expect(routeCharacterSchema.safeParse({}).success).toBe(false);
    expect(routeCharacterSchema.safeParse({ routeId: 'x' }).success).toBe(false);
    expect(
      routeCharacterSchema.safeParse({
        routeId: 'x',
        characterId: 'y',
        name: 'Z',
      }).success,
    ).toBe(false);
  });

  it('rejects empty strings for required fields', () => {
    const invalid = {
      ...PEMBA_CHARACTER,
      name: '',
    };
    expect(routeCharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('milestoneDialogue has entries for all milestones including return path', () => {
    const slugs = Object.keys(PEMBA_CHARACTER.milestoneDialogue);
    expect(slugs).toHaveLength(20);
    for (const milestone of EXPECTED_MILESTONES) {
      expect(slugs).toContain(milestone);
    }
  });

  it('each milestone dialogue has at least one line', () => {
    for (const [slug, lines] of Object.entries(PEMBA_CHARACTER.milestoneDialogue)) {
      expect(lines.length).toBeGreaterThanOrEqual(1);
      for (const line of lines) {
        expect(line.length).toBeGreaterThan(0);
      }
    }
  });

  it('notifications array has all trigger types', () => {
    const triggers = PEMBA_CHARACTER.notifications.map((n) => n.trigger);
    for (const expected of EXPECTED_TRIGGERS) {
      expect(triggers).toContain(expected);
    }
  });

  it('keepWalkingLines is a non-empty array of non-empty strings', () => {
    expect(PEMBA_CHARACTER.keepWalkingLines.length).toBeGreaterThan(0);
    for (const line of PEMBA_CHARACTER.keepWalkingLines) {
      expect(line.length).toBeGreaterThan(0);
    }
  });

  it('restLines is a non-empty array of non-empty strings', () => {
    expect(PEMBA_CHARACTER.restLines.length).toBeGreaterThan(0);
    for (const line of PEMBA_CHARACTER.restLines) {
      expect(line.length).toBeGreaterThan(0);
    }
  });

  it('rejects invalid notification trigger', () => {
    const invalid = {
      ...PEMBA_CHARACTER,
      notifications: [{ trigger: 'invalid_trigger', copy: 'test' }],
    };
    expect(routeCharacterSchema.safeParse(invalid).success).toBe(false);
  });

});
