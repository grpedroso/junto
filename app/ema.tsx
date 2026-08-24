import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Chips, FixedScreen, Question, Steps } from '@/components/base';
import { Scale } from '@/components/Scale';
import { evaluateTrigger } from '@/domain/ema';
import { pickPlan } from '@/domain/plans';
import type { AmountBand, Context, EmaAnswer, Mood, Trigger } from '@/domain/types';
import { useJunto } from '@/state/useJunto';
import { snoozeOneHour } from '@/lib/notifications';
import { KEYS, read, write } from '@/lib/storage';
import { t } from '@/i18n';

const MOODS: Mood[] = ['calm', 'anxious', 'sad', 'irritated', 'upbeat', 'bored'];
const TRIGGERS: Trigger[] = [
  'money_tight',
  'ads',
  'friends_betting',
  'game_on',
  'boredom',
  'conflict_stress',
  'nothing',
];
const CONTEXTS: Context[] = ['home', 'work', 'out', 'alone', 'with_others'];
const BANDS: AmountBand[] = ['upto_50', 'from_50_200', 'from_200_500', 'over_500'];

const chips = <T extends string>(values: T[], prefix: string) =>
  values.map((v) => ({ value: v, label: t(`${prefix}.${v}`) }));

/**
 * Six questions, one per screen, all by tapping. The target is twenty seconds:
 * every extra question speeds up dropout, and engagement is the project's
 * biggest risk.
 */
export default function Ema() {
  const router = useRouter();
  const { scheduledFor } = useLocalSearchParams<{ scheduledFor?: string }>();
  const saveEma = useJunto((s) => s.saveEma);
  const createIntervention = useJunto((s) => s.createIntervention);
  const plans = useJunto((s) => s.plans);

  const [step, setStep] = useState(0);
  const [craving, setCraving] = useState(0);
  const [selfEfficacy, setSelfEfficacy] = useState(5);
  const [mood, setMood] = useState<Mood | null>(null);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [context, setContext] = useState<Context[]>([]);
  const [gambled, setGambled] = useState<boolean | null>(null);
  const [band, setBand] = useState<AmountBand | null>(null);
  const [saving, setSaving] = useState(false);

  const total = gambled ? 7 : 6;

  const finish = async () => {
    if (saving || !mood || gambled === null) return;
    setSaving(true);

    const answer: EmaAnswer = {
      craving,
      selfEfficacy,
      mood,
      triggers,
      context,
      gambledSinceLast: gambled,
      // Going back and changing "Apostei" to "Nao apostei" would otherwise
      // leave a band behind, and the database rejects a band without a bet.
      amountBand: gambled ? band : null,
    };

    const ema = await saveEma(answer);
    const decision = evaluateTrigger(answer);

    if (!decision.fires) {
      router.back();
      return;
    }

    const plan = pickPlan(plans, triggers);
    const intervention = await createIntervention(decision.reason, ema.id, plan?.id ?? null);
    router.replace({ pathname: '/intervention/[id]', params: { id: intervention.id } });
  };

  const snooze = async () => {
    // Once only: snoozing without a limit becomes never answering.
    const alreadySnoozed = await read<string>(KEYS.snoozed);
    const key = scheduledFor || new Date().toISOString().slice(0, 13);
    if (alreadySnoozed !== key) {
      await write(KEYS.snoozed, key);
      await snoozeOneHour(key);
    }
    router.back();
  };

  const toggle = <T extends string>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  /**
   * Every step advances the same way: pick, then confirm. Selecting used to jump
   * on some steps and submit outright on others, which made a mistap
   * unrecoverable exactly on the answers that decide whether an intervention
   * fires.
   *
   * The last step is not a fixed number: answering "nao apostei" ends the EMA at
   * step 5, answering "apostei" adds the band question.
   */
  const isLast = step === 5 ? gambled === false : step === 6;

  // Only the single-choice steps can be empty. Triggers and context are allowed
  // to be, and the scales always carry a value.
  const answered =
    step === 2 ? mood !== null : step === 5 ? gambled !== null : step === 6 ? band !== null : true;

  return (
    <FixedScreen>
      <Steps step={step} total={total} />

      <View className="flex-1 justify-center gap-8">
        {step === 0 && (
          <>
            <Question>{t('ema.questions.craving')}</Question>
            <Scale
              value={craving}
              onChange={setCraving}
              minLabel={t('ema.scale.craving_min')}
              maxLabel={t('ema.scale.craving_max')}
              accessibilityLabel={t('ema.questions.craving')}
            />
          </>
        )}

        {step === 1 && (
          <>
            <Question>{t('ema.questions.self_efficacy')}</Question>
            <Scale
              value={selfEfficacy}
              onChange={setSelfEfficacy}
              minLabel={t('ema.scale.se_min')}
              maxLabel={t('ema.scale.se_max')}
              accessibilityLabel={t('ema.questions.self_efficacy')}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Question>{t('ema.questions.mood')}</Question>
            <Chips
              items={chips(MOODS, 'mood')}
              selected={mood ? [mood] : []}
              onToggle={(v) => setMood(v as Mood)}
            />
          </>
        )}

        {step === 3 && (
          <>
            <Question>{t('ema.questions.triggers')}</Question>
            <Chips
              items={chips(TRIGGERS, 'trigger')}
              selected={triggers}
              onToggle={(v) => setTriggers((current) => toggle(current, v as Trigger))}
            />
          </>
        )}

        {step === 4 && (
          <>
            <Question>{t('ema.questions.context')}</Question>
            <Chips
              items={chips(CONTEXTS, 'context')}
              selected={context}
              onToggle={(v) => setContext((current) => toggle(current, v as Context))}
            />
          </>
        )}

        {step === 5 && (
          <>
            <Question>{t('ema.questions.gambled')}</Question>
            <Chips
              items={[
                { value: 'no', label: t('ema.no') },
                { value: 'yes', label: t('ema.yes') },
              ]}
              selected={gambled === null ? [] : [gambled ? 'yes' : 'no']}
              onToggle={(v) => setGambled(v === 'yes')}
            />
          </>
        )}

        {step === 6 && (
          <>
            <Question>{t('ema.questions.band')}</Question>
            <Chips
              items={chips(BANDS, 'amount_band')}
              selected={band ? [band] : []}
              onToggle={(v) => setBand(v as AmountBand)}
            />
          </>
        )}
      </View>

      <View className="gap-2">
        <Button
          label={isLast ? t('ema.finish') : t('common.continue')}
          disabled={!answered || saving}
          onPress={() => (isLast ? void finish() : setStep(step + 1))}
        />
        {step === 0 && <Button label={t('ema.later')} variant="quiet" onPress={snooze} />}
        {step > 0 && (
          <Button label={t('common.back')} variant="quiet" onPress={() => setStep(step - 1)} />
        )}
      </View>
    </FixedScreen>
  );
}
