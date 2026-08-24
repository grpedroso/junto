import type { AmountBand } from './types';

export type AnsweredEntry = {
  answeredAt: Date;
  craving: number;
  gambledSinceLast: boolean;
  amountBand: AmountBand | null;
};

const DAY = 86_400_000;

// Date in the device's timezone, not UTC: in Brazil a 9pm EMA would land on the
// next day if counted in UTC, and "days without betting" would come out wrong.
const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Floor of each band, not the midpoint. Undercounting on purpose: "money you
 * kept" is a promise the app makes, and it is better to deliver more than
 * promised. `over_500` has no ceiling, so it counts as 500.
 */
const BAND_FLOOR: Record<AmountBand, number> = {
  upto_50: 25,
  from_50_200: 50,
  from_200_500: 200,
  over_500: 500,
};

/**
 * Days since the last declared bet. It restarts when one happens -- that is
 * what the person wants to see -- but whoever writes the copy around it must
 * not treat that as failure. See the language rules in CONTRIBUTING.md.
 */
export function daysSinceLastBet(
  entries: AnsweredEntry[],
  now: Date = new Date()
): number | null {
  const withBet = entries
    .filter((e) => e.gambledSinceLast)
    .sort((a, b) => b.answeredAt.getTime() - a.answeredAt.getTime());
  const start = withBet[0]?.answeredAt ?? earliestDate(entries);
  if (!start) return null;
  return Math.floor((now.getTime() - start.getTime()) / DAY);
}

/**
 * Running total of clean days since the very beginning. It exists precisely
 * because the counter above restarts: a relapse is a fresh start, not an
 * erasure of what came before.
 */
export function totalCleanDays(entries: AnsweredEntry[]): number {
  const byDay = new Map<string, boolean>();
  for (const e of entries) {
    const key = localDate(e.answeredAt);
    byDay.set(key, (byDay.get(key) ?? false) || e.gambledSinceLast);
  }
  return [...byDay.values()].filter((gambled) => !gambled).length;
}

export type WeeklyPoint = { week: string; average: number; n: number };

/** Craving curve by ISO week. Showing that the urge drops is real data. */
export function cravingByWeek(entries: AnsweredEntry[]): WeeklyPoint[] {
  const groups = new Map<string, number[]>();
  for (const e of entries) {
    const key = isoWeek(e.answeredAt);
    groups.set(key, [...(groups.get(key) ?? []), e.craving]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, values]) => ({
      week,
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
      n: values.length,
    }));
}

export const BASELINE_DAYS = 14;

/**
 * How much the person did not spend: the pace of the first two weeks projected
 * across the whole period, minus what they declared spending after that. Never
 * negative -- a negative number here would read as a reproach.
 */
export function moneyNotSpent(entries: AnsweredEntry[], now: Date = new Date()): number {
  const start = earliestDate(entries);
  if (!start) return 0;

  const baselineEnd = new Date(start.getTime() + BASELINE_DAYS * DAY);
  const inBaseline = entries.filter((e) => e.answeredAt < baselineEnd);
  const spentInBaseline = declaredTotal(inBaseline);
  if (spentInBaseline === 0) return 0;

  const elapsedDays = Math.max((now.getTime() - start.getTime()) / DAY, BASELINE_DAYS);
  const expected = (spentInBaseline / BASELINE_DAYS) * elapsedDays;
  const spentAfter = declaredTotal(entries.filter((e) => e.answeredAt >= baselineEnd));

  return Math.max(0, Math.round(expected - spentInBaseline - spentAfter));
}

const declaredTotal = (entries: AnsweredEntry[]) =>
  entries.reduce((sum, e) => sum + (e.amountBand ? BAND_FLOOR[e.amountBand] : 0), 0);

const earliestDate = (entries: AnsweredEntry[]): Date | null =>
  entries.length === 0
    ? null
    : new Date(Math.min(...entries.map((e) => e.answeredAt.getTime())));

/** ISO year-week, formatted as 2026-W34. */
export function isoWeek(d: Date): string {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const weekday = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - weekday);
  const firstDay = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - firstDay.getTime()) / DAY + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
