import type { Plan, PlanCategory, Trigger } from './types';

/**
 * Coping plans in the "When X, I will Y" form (implementation intentions).
 * Written in a calm moment, never during a crisis.
 *
 * Substitution comes first because it was the category real users picked most
 * in the Gambling Habit Hacker trial (DOI 10.1186/s13722-025-00573-y).
 *
 * The wording of each one lives in src/i18n/pt-BR.ts -- only structure here.
 */
export type PlanTemplate = {
  id: string;
  category: PlanCategory;
  triggers: Trigger[];
};

export const LIBRARY: PlanTemplate[] = [
  { id: 'cold_shower', category: 'substitution', triggers: ['boredom', 'nothing'] },
  {
    id: 'walk_10min',
    category: 'substitution',
    triggers: ['boredom', 'conflict_stress', 'nothing'],
  },
  { id: 'wash_dishes', category: 'substitution', triggers: ['boredom', 'nothing'] },
  { id: 'game_on_radio', category: 'substitution', triggers: ['game_on'] },
  {
    id: 'text_someone',
    category: 'social',
    triggers: ['nothing', 'boredom', 'conflict_stress'],
  },
  { id: 'call_at_night', category: 'social', triggers: ['boredom', 'nothing'] },
  { id: 'pushups', category: 'physical', triggers: ['conflict_stress', 'nothing'] },
  { id: 'breathing_478', category: 'physical', triggers: ['conflict_stress', 'nothing'] },
  { id: 'recall_last_time', category: 'cognitive', triggers: ['money_tight', 'nothing'] },
  {
    id: 'wait_15min',
    category: 'cognitive',
    triggers: ['nothing', 'ads', 'friends_betting'],
  },
  { id: 'block_sender', category: 'environmental', triggers: ['ads'] },
  { id: 'set_aside_bills', category: 'environmental', triggers: ['money_tight'] },
];

export const MINIMUM_PLANS = 2;

/**
 * Effectiveness with Laplace smoothing: a plan never shown scores 0.5, so it
 * does not lose outright to one that worked 1 out of 1. With little data --
 * always the case early on -- the raw ratio is noise.
 */
export function effectiveness(p: Pick<Plan, 'timesShown' | 'timesWorked'>): number {
  return (p.timesWorked + 1) / (p.timesShown + 2);
}

const best = (plans: Plan[]): Plan | null =>
  plans.length === 0
    ? null
    : [...plans].sort(
        (a, b) => effectiveness(b) - effectiveness(a) || a.timesShown - b.timesShown
      )[0];

/**
 * Shows the plan the person wrote for that trigger. With no plan for it, shows
 * their most effective one so far (section 6.4).
 *
 * An empty `triggers` happens when the intervention comes from SOS, outside the
 * EMA cycle: there is no answer, so no declared trigger.
 */
export function pickPlan(plans: Plan[], triggers: Trigger[] = []): Plan | null {
  const relevant: Trigger[] = triggers.filter((t) => t !== 'nothing');
  const matched = plans.filter((p) => p.triggers.some((t) => relevant.includes(t)));
  return best(matched) ?? best(plans);
}
