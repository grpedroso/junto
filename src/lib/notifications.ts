import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as NotificationsModule from 'expo-notifications';
import { DEFAULT_TIMES, withJitter, type TimeOfDay } from '@/domain/ema';
import { t } from '@/i18n';

/**
 * Expo Go on Android cannot even *import* expo-notifications: since SDK 53 the
 * package re-exports `DevicePushTokenAutoRegistration.fx`, which registers a
 * push token listener at import time, and that listener throws inside Expo Go.
 * A static import here takes the whole app down before the first screen.
 *
 * So the module is required lazily, only outside Expo Go, and every function
 * below turns into a no-op when it is absent. Nothing is lost: scheduling in
 * Expo Go is meaningless anyway, because the alarms would belong to Expo Go's
 * process and die with it -- which is the whole reason Phase 0 needs a real
 * build. See NOTIFICATIONS.md.
 *
 * Same shape as `hasCloud` in src/lib/supabase.ts: the app degrades instead of
 * refusing to open.
 */
export const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const Notifications: typeof NotificationsModule | null = inExpoGo
  ? null
  : require('expo-notifications');

/** Banner, list and sound while the app is in the foreground. */
export function setupForegroundHandler() {
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type NotificationTap = Record<string, string>;

/**
 * Tapping a notification is the main way into the EMA and the follow-up.
 * Returns a remover, so the caller keeps its effect symmetric even in Expo Go,
 * where there is nothing to remove.
 */
export function onNotificationTap(handle: (data: NotificationTap) => void): () => void {
  if (!Notifications) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    handle(response.notification.request.content.data as NotificationTap);
  });
  return () => sub.remove();
}

export const EMA_CHANNEL = 'ema';
export const FOLLOWUP_CHANNEL = 'followup';

/**
 * How many days of EMAs stay scheduled at a time.
 *
 * The +-30min jitter requires a concrete date -- Android's daily trigger is a
 * fixed hour, with no variation. The price is that scheduling runs out if the
 * app is never opened again. 21 days means ignoring 63 notifications in a row
 * before the app goes silent; answering any one of them renews the whole
 * window.
 *
 * Check against the Phase 0 result before changing -- see NOTIFICATIONS.md.
 */
export const SCHEDULED_DAYS = 21;

const FOLLOWUP_MINUTES = 30;

export async function prepareChannels() {
  if (!Notifications || Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(EMA_CHANNEL, {
    name: 'Avaliações',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync(FOLLOWUP_CHANNEL, {
    name: 'Follow-up',
    importance: Notifications.AndroidImportance.DEFAULT,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
  });
}

export async function requestPermission(): Promise<boolean> {
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Reschedules the whole window. Cancelling first avoids duplicates when the app
 * is opened several times in the same day.
 */
export async function scheduleEmas(
  times: readonly TimeOfDay[] = DEFAULT_TIMES,
  days = SCHEDULED_DAYS,
  now: Date = new Date()
): Promise<number> {
  if (!Notifications) return 0;
  await cancelEmas();
  await prepareChannels();

  let scheduled = 0;
  for (let d = 0; d < days; d++) {
    for (const base of times) {
      const { hour, minute } = withJitter(base);
      const when = new Date(now);
      when.setDate(when.getDate() + d);
      when.setHours(hour, minute, 0, 0);
      if (when <= now) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `ema:${when.toISOString()}`,
        content: {
          title: t('ema.notification_title'),
          body: t('ema.notification_body'),
          data: { kind: 'ema', scheduledFor: when.toISOString() },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: EMA_CHANNEL,
        },
      });
      scheduled++;
    }
  }
  return scheduled;
}

export async function cancelEmas() {
  if (!Notifications) return;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith('ema:'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/** "Did you manage?" 30 minutes after the intervention -- feeds the plan ranking. */
export async function scheduleFollowUp(interventionId: string) {
  if (!Notifications) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `followup:${interventionId}`,
    content: {
      title: t('intervention.followup_notification'),
      data: { kind: 'followup', interventionId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: FOLLOWUP_MINUTES * 60,
      channelId: FOLLOWUP_CHANNEL,
    },
  });
}

export async function cancelFollowUp(interventionId: string) {
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(`followup:${interventionId}`);
}

/** "Answer later" snoozes for an hour, once only (section 6.2). */
export async function snoozeOneHour(scheduledFor: string) {
  if (!Notifications) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `ema:snoozed:${scheduledFor}`,
    content: {
      title: t('ema.notification_title'),
      body: t('ema.notification_body'),
      data: { kind: 'ema', scheduledFor, snoozed: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3600,
      channelId: EMA_CHANNEL,
    },
  });
}
