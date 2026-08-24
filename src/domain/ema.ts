import type { EmaAnswer, Mood } from './types';

/**
 * The MVP trigger rule. Fixed and auditable on purpose: it can be explained to
 * the person, so the app can say why it acted.
 *
 * Momentary craving and self-efficacy are the only two predictors the
 * literature confirms operate in real time (Dowling et al. 2023). Mood, trigger
 * and context feed the dataset but decide NOTHING here.
 *
 * Changing these numbers requires clinical review -- see CONTRIBUTING.md.
 */
export const THRESHOLD = {
  highCraving: 7,
  lowSelfEfficacy: 3,
  mediumCraving: 5,
  mediumSelfEfficacy: 5,
} as const;

export const SCALE = { min: 0, max: 10 } as const;

export type TriggerReason = 'high_craving' | 'low_self_efficacy' | 'combined';

export type TriggerDecision =
  | { fires: true; reason: TriggerReason }
  | { fires: false; reason: null };

const inScale = (n: number) => Number.isInteger(n) && n >= SCALE.min && n <= SCALE.max;

/**
 * craving >= 7 OR selfEfficacy <= 3 OR (craving >= 5 AND selfEfficacy <= 5)
 *
 * Test order decides which reason gets recorded when more than one condition
 * holds at once: most specific first.
 */
export function evaluateTrigger(
  answer: Pick<EmaAnswer, 'craving' | 'selfEfficacy'>
): TriggerDecision {
  if (!inScale(answer.craving) || !inScale(answer.selfEfficacy)) {
    throw new Error(
      `answer outside the ${SCALE.min}-${SCALE.max} scale: ` +
        `craving=${answer.craving}, selfEfficacy=${answer.selfEfficacy}`
    );
  }

  if (answer.craving >= THRESHOLD.highCraving) {
    return { fires: true, reason: 'high_craving' };
  }
  if (answer.selfEfficacy <= THRESHOLD.lowSelfEfficacy) {
    return { fires: true, reason: 'low_self_efficacy' };
  }
  if (
    answer.craving >= THRESHOLD.mediumCraving &&
    answer.selfEfficacy <= THRESHOLD.mediumSelfEfficacy
  ) {
    return { fires: true, reason: 'combined' };
  }
  return { fires: false, reason: null };
}

export const DEFAULT_TIMES = [
  { hour: 11, minute: 0 },
  { hour: 17, minute: 0 },
  { hour: 21, minute: 0 },
] as const;

/** The jitter exists so answering never becomes automatic -- reflection, not reflex. */
export const JITTER_MINUTES = 30;

export type TimeOfDay = { hour: number; minute: number };

/**
 * Draws an integer offset in [-JITTER, +JITTER] minutes.
 * `random` is injectable so tests stay deterministic.
 */
export function withJitter(
  time: TimeOfDay,
  jitter = JITTER_MINUTES,
  random: () => number = Math.random
): TimeOfDay {
  const offset = Math.round((random() * 2 - 1) * jitter);
  const total = (time.hour * 60 + time.minute + offset + 1440) % 1440;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

const NEGATIVE_MOOD: Mood[] = ['sad', 'irritated'];

/** How many heavy EMAs in a row before offering the care screen. */
export const EMAS_FOR_CARE_SCREEN = 3;

/**
 * The care screen from section 9.1: persistent negative mood alongside high
 * craving. Reads newest to oldest and requires an unbroken run.
 *
 * The app does NOT screen for suicide risk -- this only decides whether it is
 * worth offering a route to help, with no alarm and no diagnosis.
 *
 * CLINICAL TODO: the exact threshold (3 EMAs, craving >= 7) needs review.
 */
export function needsCareScreen(
  latest: Pick<EmaAnswer, 'craving' | 'mood'>[],
  howMany = EMAS_FOR_CARE_SCREEN
): boolean {
  if (latest.length < howMany) return false;
  return latest
    .slice(0, howMany)
    .every((a) => NEGATIVE_MOOD.includes(a.mood) && a.craving >= THRESHOLD.highCraving);
}
