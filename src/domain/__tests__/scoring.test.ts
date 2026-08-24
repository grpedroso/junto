import {
  canRetake,
  DAYS_BETWEEN_PGSI,
  PGSI_ITEMS,
  PGSI_MAX,
  pgsiBand,
  scorePgsi,
  type PgsiAnswers,
} from '../scoring';

const all = (v: number): PgsiAnswers =>
  Object.fromEntries(PGSI_ITEMS.map((i) => [i, v])) as PgsiAnswers;

describe('scorePgsi', () => {
  it('has 9 items and a ceiling of 27', () => {
    expect(PGSI_ITEMS).toHaveLength(9);
    expect(PGSI_MAX).toBe(27);
  });

  it('scores zero when everything is never', () => {
    expect(scorePgsi(all(0))).toBe(0);
  });

  it('scores the maximum when everything is almost always', () => {
    expect(scorePgsi(all(3))).toBe(27);
  });

  it('adds item by item', () => {
    const answers = { ...all(0), bet_more_than_afford: 3, felt_guilty: 2 };
    expect(scorePgsi(answers)).toBe(5);
  });

  it('rejects an item outside the 0-3 scale', () => {
    expect(() => scorePgsi({ ...all(0), felt_guilty: 4 })).toThrow(/felt_guilty/);
    expect(() => scorePgsi({ ...all(0), was_criticized: -1 })).toThrow(/scale/);
  });
});

describe('pgsiBand', () => {
  it('uses the Ferris & Wynne cutoffs by default', () => {
    expect(pgsiBand(0)).toBe('none');
    expect(pgsiBand(1)).toBe('low');
    expect(pgsiBand(2)).toBe('low');
    expect(pgsiBand(3)).toBe('moderate');
    expect(pgsiBand(7)).toBe('moderate');
    expect(pgsiBand(8)).toBe('problem');
    expect(pgsiBand(27)).toBe('problem');
  });

  it('moves the boundary when the alternative cutoffs are adopted', () => {
    expect(pgsiBand(3, 'alternative')).toBe('low');
    expect(pgsiBand(4, 'alternative')).toBe('low');
    expect(pgsiBand(5, 'alternative')).toBe('moderate');
    expect(pgsiBand(8, 'alternative')).toBe('problem');
  });

  it('rejects an impossible score', () => {
    expect(() => pgsiBand(28)).toThrow();
    expect(() => pgsiBand(-1)).toThrow();
  });
});

describe('canRetake', () => {
  const base = new Date('2026-08-23T12:00:00Z');

  it('does not retake before 30 days', () => {
    const at29 = new Date(base.getTime() + 29 * 86_400_000);
    expect(canRetake(base, at29)).toBe(false);
  });

  it('retakes exactly on the thirtieth day', () => {
    const at30 = new Date(base.getTime() + DAYS_BETWEEN_PGSI * 86_400_000);
    expect(canRetake(base, at30)).toBe(true);
  });
});
