import { NotificationService } from '../src/services/notification/NotificationService';
import { appStorage } from '../src/shared/storage/app-storage';

const NOTIFICATIONS = [
  { trigger: 'idle_1day' as const, copy: 'The trail misses your footsteps.' },
  { trigger: 'idle_3days' as const, copy: 'Three days without walking.' },
  { trigger: 'idle_7days' as const, copy: 'A week has passed.' },
];

beforeEach(() => {
  appStorage.clearAll();
});

describe('NotificationService', () => {
  it('isOptedOut returns false by default', () => {
    expect(NotificationService.isOptedOut()).toBe(false);
  });

  it('setOptOut toggles opt-out state', () => {
    NotificationService.setOptOut(true);
    expect(NotificationService.isOptedOut()).toBe(true);
    NotificationService.setOptOut(false);
    expect(NotificationService.isOptedOut()).toBe(false);
  });

  it('canSendToday returns true when not sent today', () => {
    expect(NotificationService.canSendToday()).toBe(true);
  });

  it('canSendToday returns false after markSentToday', () => {
    NotificationService.markSentToday();
    expect(NotificationService.canSendToday()).toBe(false);
  });

  it('canSendToday returns false when opted out', () => {
    NotificationService.setOptOut(true);
    expect(NotificationService.canSendToday()).toBe(false);
  });

  it('selectNotification returns idle_1day for 1 idle day', () => {
    const result = NotificationService.selectNotification(1, NOTIFICATIONS);
    expect(result?.trigger).toBe('idle_1day');
  });

  it('selectNotification returns idle_3days for 3 idle days', () => {
    const result = NotificationService.selectNotification(3, NOTIFICATIONS);
    expect(result?.trigger).toBe('idle_3days');
  });

  it('selectNotification returns idle_7days for 7+ idle days', () => {
    const result = NotificationService.selectNotification(7, NOTIFICATIONS);
    expect(result?.trigger).toBe('idle_7days');
  });

  it('selectNotification returns null for 0 idle days', () => {
    expect(NotificationService.selectNotification(0, NOTIFICATIONS)).toBeNull();
  });

  it('selectNotification returns null when already sent today', () => {
    NotificationService.markSentToday();
    expect(NotificationService.selectNotification(3, NOTIFICATIONS)).toBeNull();
  });
});
