import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DEFAULT_TIMES, withJitter, type TimeOfDay } from '@/domain/ema';
import { t } from '@/i18n';

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
  if (Platform.OS !== 'android') return;

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
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith('ema:'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/** "Did you manage?" 30 minutes after the intervention -- feeds the plan ranking. */
export async function scheduleFollowUp(interventionId: string) {
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
  await Notifications.cancelScheduledNotificationAsync(`followup:${interventionId}`);
}

/** "Answer later" snoozes for an hour, once only (section 6.2). */
export async function snoozeOneHour(scheduledFor: string) {
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
