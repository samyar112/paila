import { appStorage } from '../../shared/storage/app-storage';
import { STORAGE_KEYS } from '../../shared/storage/storage-keys';
import { getLocalDateString } from '../../utils/dates';

export type NotificationTrigger = 'idle_1day' | 'idle_3days' | 'idle_7days' | 'streak_milestone' | 'morning_nudge';

export interface ScheduledNotification {
  trigger: NotificationTrigger;
  copy: string;
  scheduledFor: string;
}

export class NotificationService {
  static isOptedOut(): boolean {
    return appStorage.getBoolean(STORAGE_KEYS.NOTIFICATION_OPT_OUT) === true;
  }

  static setOptOut(optOut: boolean): void {
    appStorage.set(STORAGE_KEYS.NOTIFICATION_OPT_OUT, optOut);
  }

  static canSendToday(): boolean {
    if (this.isOptedOut()) return false;
    const lastSent = appStorage.getString(STORAGE_KEYS.NOTIFICATION_LAST_SENT);
    const today = getLocalDateString();
    return lastSent !== today;
  }

  static markSentToday(): void {
    appStorage.set(STORAGE_KEYS.NOTIFICATION_LAST_SENT, getLocalDateString());
  }

  static selectNotification(
    idleDays: number,
    notifications: Array<{ trigger: NotificationTrigger; copy: string }>,
  ): ScheduledNotification | null {
    if (!this.canSendToday()) return null;

    let trigger: NotificationTrigger;
    if (idleDays >= 7) {
      trigger = 'idle_7days';
    } else if (idleDays >= 3) {
      trigger = 'idle_3days';
    } else if (idleDays >= 1) {
      trigger = 'idle_1day';
    } else {
      return null;
    }

    const match = notifications.find((n) => n.trigger === trigger);
    if (!match) return null;

    return {
      trigger: match.trigger,
      copy: match.copy,
      scheduledFor: getLocalDateString(),
    };
  }

  static async scheduleLocalNotification(
    _title: string,
    _body: string,
  ): Promise<void> {
    // TODO: Wire expo-notifications when installed
    // await Notifications.scheduleNotificationAsync({
    //   content: { title, body },
    //   trigger: { seconds: 1 },
    // });
    this.markSentToday();
  }
}
