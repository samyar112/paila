import type { JourneyState } from '../src/shared/schemas';
import {
  JourneyStateMachine,
  InvalidStateTransitionError,
} from '../src/services/journey/JourneyStateMachine';
import type { JourneyStateEvent } from '../src/services/journey/JourneyStateMachine';

// ─────────────────────────────────────────────
// All states and events for exhaustive checks
// ─────────────────────────────────────────────

const ALL_STATES: JourneyState[] = [
  'WALKING',
  'PAUSED_AT_CHECKPOINT',
  'RESTING',
  'PAYWALL_FROZEN',
  'COMPLETED',
];

const ALL_EVENTS: JourneyStateEvent[] = [
  'CHECKPOINT_REACHED',
  'PAYWALL_REACHED',
  'MIDNIGHT',
  'BASE_CAMP_REACHED',
  'USER_CHOSE_REST',
  'USER_CHOSE_KEEP_WALKING',
  'NEW_DAY_OPENED',
  'PURCHASE_CONFIRMED',
];

// ─────────────────────────────────────────────
// Valid transitions
// ─────────────────────────────────────────────

describe('JourneyStateMachine', () => {
  describe('transition() — valid transitions', () => {
    const validCases: [JourneyState, JourneyStateEvent, JourneyState][] = [
      ['WALKING', 'CHECKPOINT_REACHED', 'PAUSED_AT_CHECKPOINT'],
      ['WALKING', 'PAYWALL_REACHED', 'PAYWALL_FROZEN'],
      ['WALKING', 'MIDNIGHT', 'RESTING'],
      ['WALKING', 'BASE_CAMP_REACHED', 'COMPLETED'],
      ['PAUSED_AT_CHECKPOINT', 'USER_CHOSE_REST', 'RESTING'],
      ['PAUSED_AT_CHECKPOINT', 'USER_CHOSE_KEEP_WALKING', 'WALKING'],
      ['RESTING', 'NEW_DAY_OPENED', 'WALKING'],
      ['PAYWALL_FROZEN', 'PURCHASE_CONFIRMED', 'WALKING'],
    ];

    it.each(validCases)(
      '%s + %s → %s',
      (current, event, expected) => {
        // Arrange — inputs provided by table
        // Act
        const next = JourneyStateMachine.transition(current, event);
        // Assert
        expect(next).toBe(expected);
      },
    );

    it('covers all 8 valid transitions', () => {
      expect(validCases).toHaveLength(8);
    });
  });

  // ─────────────────────────────────────────────
  // Invalid transitions
  // ─────────────────────────────────────────────

  describe('transition() — invalid transitions throw InvalidStateTransitionError', () => {
    // COMPLETED accepts no events at all
    describe('COMPLETED rejects every event', () => {
      it.each(ALL_EVENTS)('COMPLETED + %s → throws', (event) => {
        expect(() =>
          JourneyStateMachine.transition('COMPLETED', event),
        ).toThrow(InvalidStateTransitionError);
      });
    });

    // Specific cross-state invalid transitions
    const invalidCases: [JourneyState, JourneyStateEvent][] = [
      // WALKING — only accepts CHECKPOINT_REACHED, PAYWALL_REACHED, MIDNIGHT, BASE_CAMP_REACHED
      ['WALKING', 'USER_CHOSE_REST'],
      ['WALKING', 'USER_CHOSE_KEEP_WALKING'],
      ['WALKING', 'NEW_DAY_OPENED'],
      ['WALKING', 'PURCHASE_CONFIRMED'],

      // PAUSED_AT_CHECKPOINT — only accepts USER_CHOSE_REST, USER_CHOSE_KEEP_WALKING
      ['PAUSED_AT_CHECKPOINT', 'CHECKPOINT_REACHED'],
      ['PAUSED_AT_CHECKPOINT', 'PAYWALL_REACHED'],
      ['PAUSED_AT_CHECKPOINT', 'MIDNIGHT'],
      ['PAUSED_AT_CHECKPOINT', 'BASE_CAMP_REACHED'],
      ['PAUSED_AT_CHECKPOINT', 'NEW_DAY_OPENED'],
      ['PAUSED_AT_CHECKPOINT', 'PURCHASE_CONFIRMED'],

      // RESTING — only accepts NEW_DAY_OPENED
      ['RESTING', 'CHECKPOINT_REACHED'],
      ['RESTING', 'PAYWALL_REACHED'],
      ['RESTING', 'MIDNIGHT'],
      ['RESTING', 'BASE_CAMP_REACHED'],
      ['RESTING', 'USER_CHOSE_REST'],
      ['RESTING', 'USER_CHOSE_KEEP_WALKING'],
      ['RESTING', 'PURCHASE_CONFIRMED'],

      // PAYWALL_FROZEN — only accepts PURCHASE_CONFIRMED
      ['PAYWALL_FROZEN', 'CHECKPOINT_REACHED'],
      ['PAYWALL_FROZEN', 'PAYWALL_REACHED'],
      ['PAYWALL_FROZEN', 'MIDNIGHT'],
      ['PAYWALL_FROZEN', 'BASE_CAMP_REACHED'],
      ['PAYWALL_FROZEN', 'USER_CHOSE_REST'],
      ['PAYWALL_FROZEN', 'USER_CHOSE_KEEP_WALKING'],
      ['PAYWALL_FROZEN', 'NEW_DAY_OPENED'],
    ];

    it.each(invalidCases)(
      '%s + %s → throws',
      (current, event) => {
        expect(() =>
          JourneyStateMachine.transition(current, event),
        ).toThrow(InvalidStateTransitionError);
      },
    );
  });

  // ─────────────────────────────────────────────
  // canTransition()
  // ─────────────────────────────────────────────

  describe('canTransition()', () => {
    describe('returns true for every valid transition', () => {
      const validPairs: [JourneyState, JourneyStateEvent][] = [
        ['WALKING', 'CHECKPOINT_REACHED'],
        ['WALKING', 'PAYWALL_REACHED'],
        ['WALKING', 'MIDNIGHT'],
        ['WALKING', 'BASE_CAMP_REACHED'],
        ['PAUSED_AT_CHECKPOINT', 'USER_CHOSE_REST'],
        ['PAUSED_AT_CHECKPOINT', 'USER_CHOSE_KEEP_WALKING'],
        ['RESTING', 'NEW_DAY_OPENED'],
        ['PAYWALL_FROZEN', 'PURCHASE_CONFIRMED'],
      ];

      it.each(validPairs)('%s + %s → true', (current, event) => {
        expect(JourneyStateMachine.canTransition(current, event)).toBe(true);
      });
    });

    describe('returns false for invalid transitions', () => {
      const invalidPairs: [JourneyState, JourneyStateEvent][] = [
        ['COMPLETED', 'CHECKPOINT_REACHED'],
        ['COMPLETED', 'NEW_DAY_OPENED'],
        ['WALKING', 'USER_CHOSE_REST'],
        ['RESTING', 'CHECKPOINT_REACHED'],
        ['PAUSED_AT_CHECKPOINT', 'MIDNIGHT'],
        ['PAYWALL_FROZEN', 'CHECKPOINT_REACHED'],
        ['PAYWALL_FROZEN', 'NEW_DAY_OPENED'],
      ];

      it.each(invalidPairs)('%s + %s → false', (current, event) => {
        expect(JourneyStateMachine.canTransition(current, event)).toBe(false);
      });
    });
  });

  // ─────────────────────────────────────────────
  // InvalidStateTransitionError shape
  // ─────────────────────────────────────────────

  describe('InvalidStateTransitionError', () => {
    it('exposes currentState and event properties', () => {
      // Arrange
      const state: JourneyState = 'COMPLETED';
      const event: JourneyStateEvent = 'CHECKPOINT_REACHED';

      // Act
      let caught: InvalidStateTransitionError | undefined;
      try {
        JourneyStateMachine.transition(state, event);
      } catch (err) {
        caught = err as InvalidStateTransitionError;
      }

      // Assert
      expect(caught).toBeInstanceOf(InvalidStateTransitionError);
      expect(caught!.currentState).toBe('COMPLETED');
      expect(caught!.event).toBe('CHECKPOINT_REACHED');
    });

    it('has a descriptive message', () => {
      // Arrange & Act
      const err = new InvalidStateTransitionError('RESTING', 'MIDNIGHT');

      // Assert
      expect(err.message).toContain('RESTING');
      expect(err.message).toContain('MIDNIGHT');
      expect(err.message).toMatch(/invalid state transition/i);
    });

    it('has name set to InvalidStateTransitionError', () => {
      const err = new InvalidStateTransitionError('WALKING', 'USER_CHOSE_REST');
      expect(err.name).toBe('InvalidStateTransitionError');
    });

    it('is an instance of Error', () => {
      const err = new InvalidStateTransitionError('WALKING', 'USER_CHOSE_REST');
      expect(err).toBeInstanceOf(Error);
    });
  });

  // ─────────────────────────────────────────────
  // Exhaustive coverage: every state × event pair
  // ─────────────────────────────────────────────

  describe('exhaustive: every state × event either transitions or throws', () => {
    for (const state of ALL_STATES) {
      for (const event of ALL_EVENTS) {
        it(`${state} + ${event}`, () => {
          const canDo = JourneyStateMachine.canTransition(state, event);
          if (canDo) {
            // Should return a valid state without throwing
            const next = JourneyStateMachine.transition(state, event);
            expect(ALL_STATES).toContain(next);
          } else {
            // Should throw InvalidStateTransitionError
            expect(() =>
              JourneyStateMachine.transition(state, event),
            ).toThrow(InvalidStateTransitionError);
          }
        });
      }
    }
  });
});
