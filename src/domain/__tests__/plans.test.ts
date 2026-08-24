import { effectiveness, LIBRARY, pickPlan } from '../plans';
import type { Plan } from '../types';

const plan = (p: Partial<Plan> & { id: string }): Plan => ({
  condition: 'the urge hits',
  action: 'do something',
  category: 'substitution',
  triggers: [],
  timesShown: 0,
  timesWorked: 0,
  ...p,
});

describe('library', () => {
  it('has no repeated id', () => {
    const ids = LIBRARY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('leads with substitution, the category most picked in the studies', () => {
    expect(LIBRARY[0].category).toBe('substitution');
  });

  it('covers every trigger the user can select', () => {
    const covered = new Set(LIBRARY.flatMap((t) => t.triggers));
    for (const trigger of [
      'money_tight',
      'ads',
      'friends_betting',
      'game_on',
      'boredom',
      'conflict_stress',
      'nothing',
    ]) {
      expect(covered.has(trigger as never)).toBe(true);
    }
  });
});

describe('effectiveness', () => {
  it('gives half a point to one never used', () => {
    expect(effectiveness({ timesShown: 0, timesWorked: 0 })).toBe(0.5);
  });

  it('does not let 1 of 1 beat 8 of 10', () => {
    const rookie = effectiveness({ timesShown: 1, timesWorked: 1 });
    const veteran = effectiveness({ timesShown: 10, timesWorked: 8 });
    expect(veteran).toBeGreaterThan(rookie);
  });
});

describe('pickPlan', () => {
  it('returns null when the person has no plan at all', () => {
    expect(pickPlan([], ['boredom'])).toBeNull();
  });

  it('prefers the plan written for that trigger', () => {
    const plans = [
      plan({ id: 'generic', timesShown: 20, timesWorked: 20 }),
      plan({ id: 'for_trigger', triggers: ['ads'] }),
    ];
    expect(pickPlan(plans, ['ads'])?.id).toBe('for_trigger');
  });

  it('among those for the trigger, picks the one that worked most', () => {
    const plans = [
      plan({ id: 'weak', triggers: ['boredom'], timesShown: 10, timesWorked: 1 }),
      plan({ id: 'strong', triggers: ['boredom'], timesShown: 10, timesWorked: 9 }),
    ];
    expect(pickPlan(plans, ['boredom'])?.id).toBe('strong');
  });

  it('falls back to the most effective when no plan covers the trigger', () => {
    const plans = [
      plan({ id: 'a', triggers: ['ads'], timesShown: 10, timesWorked: 2 }),
      plan({ id: 'b', triggers: ['ads'], timesShown: 10, timesWorked: 9 }),
    ];
    expect(pickPlan(plans, ['game_on'])?.id).toBe('b');
  });

  it('ignores "nothing" as a trigger -- it is not a real one', () => {
    const plans = [
      plan({ id: 'with_nothing', triggers: ['nothing'], timesShown: 10, timesWorked: 0 }),
      plan({ id: 'better', triggers: ['ads'], timesShown: 10, timesWorked: 10 }),
    ];
    expect(pickPlan(plans, ['nothing'])?.id).toBe('better');
  });

  it('works with no trigger at all, which is the SOS case', () => {
    const plans = [
      plan({ id: 'a', timesShown: 4, timesWorked: 0 }),
      plan({ id: 'b', timesShown: 4, timesWorked: 4 }),
    ];
    expect(pickPlan(plans)?.id).toBe('b');
  });

  it('breaks ties by least shown, so a new one gets its turn', () => {
    const plans = [
      plan({ id: 'well_worn', timesShown: 8, timesWorked: 4 }),
      plan({ id: 'new_one', timesShown: 0, timesWorked: 0 }),
    ];
    expect(pickPlan(plans)?.id).toBe('new_one');
  });
});
