import { create } from 'zustand';
import { LIBRARY, MINIMUM_PLANS } from '@/domain/plans';
import { DEFAULT_TIMES, type TimeOfDay, type TriggerReason } from '@/domain/ema';
import type { EmaAnswer, Goal, InterventionOutcome, Plan } from '@/domain/types';
import { cancelFollowUp, scheduleEmas, scheduleFollowUp } from '@/lib/notifications';
import { ensureSession } from '@/lib/session';
import { flush, enqueue, KEYS, newId, read, write } from '@/lib/storage';
import ptBR from '@/i18n/pt-BR';

export type Profile = {
  id: string;
  goal: Goal;
  times: TimeOfDay[];
  onboardingDone: boolean;
  baselinePgsi: number | null;
  pgsiAt: string | null;
};

export type SavedEma = EmaAnswer & { id: string; answeredAt: string };

export type SavedIntervention = {
  id: string;
  emaId: string | null;
  planId: string | null;
  reason: TriggerReason | 'sos';
  createdAt: string;
  outcome: InterventionOutcome | null;
};

type State = {
  loading: boolean;
  profile: Profile | null;
  plans: Plan[];
  emas: SavedEma[];
  interventions: SavedIntervention[];

  start: () => Promise<void>;
  setGoal: (goal: Goal) => Promise<void>;
  setTimes: (times: TimeOfDay[]) => Promise<void>;
  finishOnboarding: () => Promise<void>;
  recordPgsi: (score: number) => Promise<void>;

  adoptTemplate: (templateId: string) => Promise<void>;
  createPlan: (p: Omit<Plan, 'id' | 'timesShown' | 'timesWorked'>) => Promise<Plan>;
  editPlan: (id: string, fields: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  tallyPlan: (id: string, worked: boolean) => Promise<void>;

  saveEma: (answer: EmaAnswer) => Promise<SavedEma>;
  createIntervention: (
    reason: TriggerReason | 'sos',
    emaId: string | null,
    planId: string | null
  ) => Promise<SavedIntervention>;
  answerFollowUp: (id: string, outcome: InterventionOutcome) => Promise<void>;
};

const DEFAULT_PROFILE = (id: string): Profile => ({
  id,
  goal: 'quit',
  times: [...DEFAULT_TIMES],
  onboardingDone: false,
  baselinePgsi: null,
  pgsiAt: null,
});

export const useJunto = create<State>((set, get) => ({
  loading: true,
  profile: null,
  plans: [],
  emas: [],
  interventions: [],

  start: async () => {
    const [localProfile, plans, emas, interventions] = await Promise.all([
      read<Profile>(KEYS.profile),
      read<Plan[]>(KEYS.plans),
      read<SavedEma[]>(KEYS.emas),
      read<SavedIntervention[]>(KEYS.interventions),
    ]);

    // The screen opens with whatever is on the device; the session comes after
    // and may fail with no network. Offline-first: nothing here waits on a server.
    set({
      profile: localProfile,
      plans: plans ?? [],
      emas: emas ?? [],
      interventions: interventions ?? [],
      loading: false,
    });

    try {
      const id = await ensureSession();
      const profile = localProfile ?? DEFAULT_PROFILE(id);
      if (profile.id !== id) profile.id = id;
      set({ profile });
      await write(KEYS.profile, profile);
      await flush();
    } catch {
      // no network on first launch: carry on locally, sync on the next open
    }
  },

  setGoal: async (goal) => {
    const profile = { ...requireProfile(get), goal };
    set({ profile });
    await write(KEYS.profile, profile);
    await enqueue('users', { id: profile.id, goal });
  },

  setTimes: async (times) => {
    const profile = { ...requireProfile(get), times };
    set({ profile });
    await write(KEYS.profile, profile);
    await enqueue('users', {
      id: profile.id,
      ema_times: times.map((t) => `${pad(t.hour)}:${pad(t.minute)}`),
    });
    await scheduleEmas(times);
  },

  finishOnboarding: async () => {
    const profile = { ...requireProfile(get), onboardingDone: true };
    set({ profile });
    await write(KEYS.profile, profile);
    await scheduleEmas(profile.times);
  },

  recordPgsi: async (score) => {
    const now = new Date().toISOString();
    const profile = { ...requireProfile(get), baselinePgsi: score, pgsiAt: now };
    set({ profile });
    await write(KEYS.profile, profile);
    await enqueue('users', { id: profile.id, baseline_pgsi: score, pgsi_at: now });
  },

  adoptTemplate: async (templateId) => {
    const template = LIBRARY.find((t) => t.id === templateId);
    if (!template) throw new Error(`unknown template: ${templateId}`);
    const text = ptBR.plans.library[templateId as keyof typeof ptBR.plans.library];
    await get().createPlan({
      condition: text.condition,
      action: text.action,
      category: template.category,
      triggers: template.triggers,
    });
  },

  createPlan: async (p) => {
    const plan: Plan = { ...p, id: newId(), timesShown: 0, timesWorked: 0 };
    const plans = [...get().plans, plan];
    set({ plans });
    await write(KEYS.plans, plans);
    await enqueue('coping_plans', planRow(plan, requireProfile(get).id));
    return plan;
  },

  editPlan: async (id, fields) => {
    const plans = get().plans.map((p) => (p.id === id ? { ...p, ...fields } : p));
    set({ plans });
    await write(KEYS.plans, plans);
    const changed = plans.find((p) => p.id === id);
    if (changed) await enqueue('coping_plans', planRow(changed, requireProfile(get).id));
  },

  deletePlan: async (id) => {
    const plans = get().plans.filter((p) => p.id !== id);
    set({ plans });
    await write(KEYS.plans, plans);
    await enqueue('coping_plans', {
      id,
      user_id: requireProfile(get).id,
      archived_at: new Date().toISOString(),
    });
  },

  tallyPlan: async (id, worked) => {
    const current = get().plans.find((p) => p.id === id);
    if (!current) return;
    await get().editPlan(id, {
      timesShown: current.timesShown + 1,
      timesWorked: current.timesWorked + (worked ? 1 : 0),
    });
  },

  saveEma: async (answer) => {
    const profile = requireProfile(get);
    const ema: SavedEma = { ...answer, id: newId(), answeredAt: new Date().toISOString() };
    const emas = [ema, ...get().emas];
    set({ emas });
    await write(KEYS.emas, emas);
    await enqueue('ema_entries', {
      id: ema.id,
      user_id: profile.id,
      scheduled_at: ema.answeredAt,
      answered_at: ema.answeredAt,
      craving: ema.craving,
      self_efficacy: ema.selfEfficacy,
      mood: ema.mood,
      triggers: ema.triggers,
      context: ema.context,
      gambled_since_last: ema.gambledSinceLast,
      amount_band: ema.amountBand,
    });
    return ema;
  },

  createIntervention: async (reason, emaId, planId) => {
    const profile = requireProfile(get);
    const intervention: SavedIntervention = {
      id: newId(),
      emaId,
      planId,
      reason,
      createdAt: new Date().toISOString(),
      outcome: null,
    };
    const interventions = [intervention, ...get().interventions];
    set({ interventions });
    await write(KEYS.interventions, interventions);
    await enqueue('interventions', {
      id: intervention.id,
      user_id: profile.id,
      ema_id: emaId,
      plan_id: planId,
      triggered_at: intervention.createdAt,
      trigger_reason: reason,
    });
    await scheduleFollowUp(intervention.id);
    return intervention;
  },

  answerFollowUp: async (id, outcome) => {
    const interventions = get().interventions.map((i) =>
      i.id === id ? { ...i, outcome } : i
    );
    set({ interventions });
    await write(KEYS.interventions, interventions);
    await cancelFollowUp(id);

    const intervention = interventions.find((i) => i.id === id);
    await enqueue('interventions', {
      id,
      user_id: requireProfile(get).id,
      followup_at: new Date().toISOString(),
      outcome,
    });

    // The plan ranking only learns when there is an answer: "no_answer" counts
    // neither for nor against the plan that was shown.
    if (intervention?.planId && outcome !== 'no_answer') {
      await get().tallyPlan(intervention.planId, outcome === 'resisted');
    }
  },
}));

const pad = (n: number) => String(n).padStart(2, '0');

const requireProfile = (get: () => State): Profile => {
  const { profile } = get();
  if (!profile) throw new Error('profile not loaded yet -- call start() first');
  return profile;
};

const planRow = (p: Plan, userId: string) => ({
  id: p.id,
  user_id: userId,
  trigger_condition: p.condition,
  action: p.action,
  category: p.category,
  triggers: p.triggers,
  times_shown: p.timesShown,
  times_worked: p.timesWorked,
});

export const plansMissing = (plans: Plan[]) => Math.max(0, MINIMUM_PLANS - plans.length);
