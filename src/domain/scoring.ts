/**
 * PGSI -- Problem Gambling Severity Index. 9 items, 0-3 scale, referring to the
 * last 12 months. A Brazilian cross-cultural adaptation was published in Revista
 * de Saude Publica in 2026 (DOI 10.11606/s1518-8787.2026060007368).
 *
 * It is NOT a diagnostic tool -- it was built for population research. The app
 * presents the result as "a snapshot of where you are", never as a diagnosis.
 * See src/i18n/pt-BR.ts.
 */

export const PGSI_ITEMS = [
  'bet_more_than_afford',
  'needed_larger_bets',
  'chased_losses',
  'borrowed_or_sold',
  'felt_problem',
  'health_problems',
  'was_criticized',
  'financial_problems',
  'felt_guilty',
] as const;

export type PgsiItem = (typeof PGSI_ITEMS)[number];

export const PGSI_OPTIONS = [0, 1, 2, 3] as const;
export const PGSI_MAX = PGSI_ITEMS.length * 3;

export type PgsiBand = 'none' | 'low' | 'moderate' | 'problem';

/**
 * Two sets of cutoffs exist in the literature. Ferris & Wynne's original is the
 * default here; the alternative appears in later studies.
 *
 * CLINICAL TODO: confirm with the reviewer which one to adopt before showing a
 * band to any real user. The difference moves people from "low" to "moderate".
 */
export type Cutoffs = 'ferris_wynne' | 'alternative';

const TABLE: Record<Cutoffs, { max: number; band: PgsiBand }[]> = {
  ferris_wynne: [
    { max: 0, band: 'none' },
    { max: 2, band: 'low' },
    { max: 7, band: 'moderate' },
    { max: PGSI_MAX, band: 'problem' },
  ],
  alternative: [
    { max: 0, band: 'none' },
    { max: 4, band: 'low' },
    { max: 7, band: 'moderate' },
    { max: PGSI_MAX, band: 'problem' },
  ],
};

export type PgsiAnswers = Record<PgsiItem, number>;

export function scorePgsi(answers: PgsiAnswers): number {
  return PGSI_ITEMS.reduce((total, item) => {
    const v = answers[item];
    if (!Number.isInteger(v) || v < 0 || v > 3) {
      throw new Error(`item "${item}" outside the 0-3 scale: ${v}`);
    }
    return total + v;
  }, 0);
}

export function pgsiBand(score: number, cutoffs: Cutoffs = 'ferris_wynne'): PgsiBand {
  if (!Number.isInteger(score) || score < 0 || score > PGSI_MAX) {
    throw new Error(`score outside 0-${PGSI_MAX}: ${score}`);
  }
  return TABLE[cutoffs].find((b) => score <= b.max)!.band;
}

/** The PGSI is retaken every 30 days to measure change. */
export const DAYS_BETWEEN_PGSI = 30;

export function canRetake(lastTakenAt: Date, now: Date = new Date()): boolean {
  const days = (now.getTime() - lastTakenAt.getTime()) / 86_400_000;
  return days >= DAYS_BETWEEN_PGSI;
}
