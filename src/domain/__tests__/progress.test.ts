import {
  cravingByWeek,
  daysSinceLastBet,
  isoWeek,
  moneyNotSpent,
  totalCleanDays,
  type AnsweredEntry,
} from '../progress';
import type { AmountBand } from '../types';

const at = (
  iso: string,
  options: { craving?: number; gambled?: boolean; band?: AmountBand | null } = {}
): AnsweredEntry => ({
  answeredAt: new Date(iso),
  craving: options.craving ?? 3,
  gambledSinceLast: options.gambled ?? false,
  amountBand: options.band ?? null,
});

describe('daysSinceLastBet', () => {
  it('is null with no answers at all', () => {
    expect(daysSinceLastBet([])).toBeNull();
  });

  it('counts from the last declared bet', () => {
    const entries = [
      at('2026-08-01T12:00:00', { gambled: true }),
      at('2026-08-10T12:00:00'),
    ];
    expect(daysSinceLastBet(entries, new Date('2026-08-13T12:00:00'))).toBe(12);
  });

  it('counts from the beginning when there was never a bet', () => {
    const entries = [at('2026-08-01T12:00:00'), at('2026-08-05T12:00:00')];
    expect(daysSinceLastBet(entries, new Date('2026-08-08T12:00:00'))).toBe(7);
  });

  it('uses the most recent bet, not the first', () => {
    const entries = [
      at('2026-08-01T12:00:00', { gambled: true }),
      at('2026-08-09T12:00:00', { gambled: true }),
    ];
    expect(daysSinceLastBet(entries, new Date('2026-08-12T12:00:00'))).toBe(3);
  });
});

describe('totalCleanDays', () => {
  it('counts days, not answers', () => {
    const entries = [
      at('2026-08-01T11:00:00'),
      at('2026-08-01T17:00:00'),
      at('2026-08-01T21:00:00'),
    ];
    expect(totalCleanDays(entries)).toBe(1);
  });

  it('discards the whole day if any of its answers had a bet', () => {
    const entries = [
      at('2026-08-01T11:00:00'),
      at('2026-08-01T21:00:00', { gambled: true }),
      at('2026-08-02T11:00:00'),
    ];
    expect(totalCleanDays(entries)).toBe(1);
  });

  it('does not erase what came before a relapse', () => {
    const entries = [
      at('2026-08-01T11:00:00'),
      at('2026-08-02T11:00:00'),
      at('2026-08-03T11:00:00', { gambled: true }),
      at('2026-08-04T11:00:00'),
    ];
    expect(totalCleanDays(entries)).toBe(3);
    expect(daysSinceLastBet(entries, new Date('2026-08-04T11:00:00'))).toBe(1);
  });

  it('does not push the evening EMA into the next day', () => {
    const entries = [at('2026-08-01T21:30:00'), at('2026-08-01T23:50:00')];
    expect(totalCleanDays(entries)).toBe(1);
  });
});

describe('cravingByWeek', () => {
  it('groups by ISO week and averages', () => {
    const entries = [
      at('2026-08-17T11:00:00', { craving: 8 }),
      at('2026-08-18T11:00:00', { craving: 6 }),
      at('2026-08-25T11:00:00', { craving: 2 }),
    ];
    const curve = cravingByWeek(entries);
    expect(curve).toHaveLength(2);
    expect(curve[0].average).toBe(7);
    expect(curve[0].n).toBe(2);
    expect(curve[1].average).toBe(2);
  });

  it('comes out in chronological order even from shuffled input', () => {
    const entries = [at('2026-09-01T11:00:00'), at('2026-08-17T11:00:00')];
    const curve = cravingByWeek(entries);
    expect(curve[0].week < curve[1].week).toBe(true);
  });
});

describe('isoWeek', () => {
  it('numbers the week as year-Wnn', () => {
    expect(isoWeek(new Date('2026-08-23T12:00:00'))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('puts Monday and Sunday of the same week in the same bucket', () => {
    expect(isoWeek(new Date('2026-08-17T12:00:00'))).toBe(
      isoWeek(new Date('2026-08-23T12:00:00'))
    );
  });

  it('separates Sunday from the next day, already another week', () => {
    expect(isoWeek(new Date('2026-08-23T12:00:00'))).not.toBe(
      isoWeek(new Date('2026-08-24T12:00:00'))
    );
  });
});

describe('moneyNotSpent', () => {
  it('is zero with no history', () => {
    expect(moneyNotSpent([])).toBe(0);
  });

  it('is zero when no bet was ever declared in the baseline', () => {
    const entries = [at('2026-08-01T11:00:00'), at('2026-08-20T11:00:00')];
    expect(moneyNotSpent(entries, new Date('2026-08-29T11:00:00'))).toBe(0);
  });

  it('projects the baseline pace and subtracts what was spent after', () => {
    const entries = [at('2026-08-01T11:00:00', { gambled: true, band: 'from_200_500' })];
    // 200 over 14 days -> 400 expected over 28 days -> 200 saved
    expect(moneyNotSpent(entries, new Date('2026-08-29T11:00:00'))).toBe(200);
  });

  it('is zero when the person kept the same pace', () => {
    const entries = [
      at('2026-08-01T11:00:00', { gambled: true, band: 'from_200_500' }),
      at('2026-08-20T11:00:00', { gambled: true, band: 'from_200_500' }),
    ];
    expect(moneyNotSpent(entries, new Date('2026-08-29T11:00:00'))).toBe(0);
  });

  it('never goes negative, even if the person spent more', () => {
    const entries = [
      at('2026-08-01T11:00:00', { gambled: true, band: 'upto_50' }),
      at('2026-08-20T11:00:00', { gambled: true, band: 'over_500' }),
    ];
    expect(moneyNotSpent(entries, new Date('2026-08-29T11:00:00'))).toBe(0);
  });
});
