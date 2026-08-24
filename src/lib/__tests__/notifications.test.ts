import { scheduleEmas, SCHEDULED_DAYS } from '../notifications';
import { DEFAULT_TIMES, JITTER_MINUTES } from '@/domain/ema';

const scheduled: { identifier: string; date: Date }[] = [];

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval', DAILY: 'daily' },
  AndroidImportance: { HIGH: 4, DEFAULT: 3, MAX: 5 },
  AndroidNotificationVisibility: { PRIVATE: 0, PUBLIC: 1 },
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(
    async (req: { identifier: string; trigger: { date: Date } }) => {
      scheduled.push({ identifier: req.identifier, date: req.trigger.date });
      return req.identifier;
    }
  ),
}));

beforeEach(() => {
  scheduled.length = 0;
});

const midnight = new Date('2026-08-23T00:05:00');

describe('scheduleEmas', () => {
  it('schedules three a day across the whole window', async () => {
    const n = await scheduleEmas(DEFAULT_TIMES, SCHEDULED_DAYS, midnight);
    expect(n).toBe(SCHEDULED_DAYS * DEFAULT_TIMES.length);
    expect(scheduled).toHaveLength(n);
  });

  it('tags them with its own prefix, so only EMAs get cancelled', async () => {
    await scheduleEmas(DEFAULT_TIMES, 2, midnight);
    expect(scheduled.every((s) => s.identifier.startsWith('ema:'))).toBe(true);
  });

  it('does not schedule in the past', async () => {
    const lateNight = new Date('2026-08-23T22:00:00');
    await scheduleEmas(DEFAULT_TIMES, 1, lateNight);
    // 11am, 5pm and 9pm are gone (jitter reaches 9:30pm at most)
    expect(scheduled).toHaveLength(0);
  });

  it('skips only the times already past on the first day', async () => {
    const noon = new Date('2026-08-23T12:00:00');
    const n = await scheduleEmas(DEFAULT_TIMES, 2, noon);
    expect(n).toBe(5); // day 1 loses 11am; day 2 is complete
    expect(scheduled.every((s) => s.date > noon)).toBe(true);
  });

  it('respects the jitter window around each base time', async () => {
    await scheduleEmas(DEFAULT_TIMES, 5, midnight);
    for (const { date } of scheduled) {
      const minutes = date.getHours() * 60 + date.getMinutes();
      const close = DEFAULT_TIMES.some(
        (time) => Math.abs(minutes - (time.hour * 60 + time.minute)) <= JITTER_MINUTES
      );
      expect(close).toBe(true);
    }
  });

  it('advances one date per day, with no repeated identifier', async () => {
    await scheduleEmas(DEFAULT_TIMES, 7, midnight);
    const ids = scheduled.map((s) => s.identifier);
    expect(new Set(ids).size).toBe(ids.length);

    const days = new Set(scheduled.map((s) => s.date.toDateString()));
    expect(days.size).toBe(7);
  });

  it('crosses the end of the month without tripping', async () => {
    const monthEnd = new Date('2026-08-30T00:05:00');
    await scheduleEmas(DEFAULT_TIMES, 5, monthEnd);
    const months = new Set(scheduled.map((s) => s.date.getMonth()));
    expect(months.size).toBe(2);
  });
});
