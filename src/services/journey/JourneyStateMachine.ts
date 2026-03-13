import type { JourneyState } from '../../shared/schemas';

export type JourneyStateEvent =
  | 'CHECKPOINT_REACHED'
  | 'PAYWALL_REACHED'
  | 'MIDNIGHT'
  | 'BASE_CAMP_REACHED'
  | 'USER_CHOSE_REST'
  | 'USER_CHOSE_KEEP_WALKING'
  | 'NEW_DAY_OPENED'
  | 'PURCHASE_CONFIRMED';

export class InvalidStateTransitionError extends Error {
  constructor(
    public readonly currentState: JourneyState,
    public readonly event: JourneyStateEvent,
  ) {
    super(
      `Invalid state transition: cannot apply ${event} in state ${currentState}`,
    );
    this.name = 'InvalidStateTransitionError';
  }
}

const TRANSITIONS: Record<
  JourneyState,
  Partial<Record<JourneyStateEvent, JourneyState>>
> = {
  WALKING: {
    CHECKPOINT_REACHED: 'PAUSED_AT_CHECKPOINT',
    PAYWALL_REACHED: 'PAYWALL_FROZEN',
    MIDNIGHT: 'RESTING',
    BASE_CAMP_REACHED: 'COMPLETED',
  },
  PAUSED_AT_CHECKPOINT: {
    USER_CHOSE_REST: 'RESTING',
    USER_CHOSE_KEEP_WALKING: 'WALKING',
  },
  RESTING: {
    NEW_DAY_OPENED: 'WALKING',
  },
  PAYWALL_FROZEN: {
    PURCHASE_CONFIRMED: 'WALKING',
  },
  COMPLETED: {},
};

export class JourneyStateMachine {
  static transition(
    current: JourneyState,
    event: JourneyStateEvent,
  ): JourneyState {
    const next = TRANSITIONS[current]?.[event];
    if (!next) {
      throw new InvalidStateTransitionError(current, event);
    }
    return next;
  }

  static canTransition(
    current: JourneyState,
    event: JourneyStateEvent,
  ): boolean {
    return TRANSITIONS[current]?.[event] !== undefined;
  }
}
