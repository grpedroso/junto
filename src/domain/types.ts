export type Mood = 'calm' | 'anxious' | 'sad' | 'irritated' | 'upbeat' | 'bored';

export type Trigger =
  | 'money_tight'
  | 'ads'
  | 'friends_betting'
  | 'game_on'
  | 'boredom'
  | 'conflict_stress'
  | 'nothing';

export type Context = 'home' | 'work' | 'out' | 'alone' | 'with_others';

export type AmountBand = 'upto_50' | 'from_50_200' | 'from_200_500' | 'over_500';

export type PlanCategory =
  | 'substitution'
  | 'social'
  | 'physical'
  | 'cognitive'
  | 'environmental';

export type Goal = 'quit' | 'reduce';

export type InterventionOutcome = 'resisted' | 'gambled' | 'no_answer';

export type EmaAnswer = {
  craving: number;
  selfEfficacy: number;
  mood: Mood;
  triggers: Trigger[];
  context: Context[];
  gambledSinceLast: boolean;
  amountBand: AmountBand | null;
};

export type Plan = {
  id: string;
  condition: string;
  action: string;
  category: PlanCategory;
  triggers: Trigger[];
  timesShown: number;
  timesWorked: number;
};
