import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Body, Button, Card, FixedScreen, Heading, Question } from '@/components/base';
import { pickPlan } from '@/domain/plans';
import { useJunto } from '@/state/useJunto';
import { t } from '@/i18n';

export default function Intervention() {
  const router = useRouter();
  const { id, followup } = useLocalSearchParams<{ id: string; followup?: string }>();
  const plans = useJunto((s) => s.plans);
  const interventions = useJunto((s) => s.interventions);
  const answerFollowUp = useJunto((s) => s.answerFollowUp);

  const intervention = interventions.find((i) => i.id === id);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [answer, setAnswer] = useState<'resisted' | 'gambled' | null>(null);

  const plan = useMemo(() => {
    const recorded = plans.find((p) => p.id === intervention?.planId);
    if (recorded && !dismissed.includes(recorded.id)) return recorded;
    return pickPlan(plans.filter((p) => !dismissed.includes(p.id)));
  }, [plans, intervention?.planId, dismissed]);

  const isFollowUp = followup === '1';

  if (isFollowUp) {
    if (answer) {
      return (
        <FixedScreen>
          <View className="flex-1 justify-center gap-4">
            <Heading className="text-3xl">
              {t(
                answer === 'resisted'
                  ? 'intervention.followup_reply_yes'
                  : 'intervention.followup_reply_no'
              )}
            </Heading>
          </View>
          <Button label={t('common.done')} onPress={() => router.back()} />
        </FixedScreen>
      );
    }

    return (
      <FixedScreen>
        <View className="flex-1 justify-center gap-6">
          <Question>{t('intervention.followup_title')}</Question>
        </View>
        <View className="gap-3">
          <Button
            label={t('intervention.followup_yes')}
            onPress={async () => {
              setAnswer('resisted');
              await answerFollowUp(id, 'resisted');
            }}
          />
          <Button
            label={t('intervention.followup_no')}
            variant="secondary"
            onPress={async () => {
              setAnswer('gambled');
              await answerFollowUp(id, 'gambled');
            }}
          />
        </View>
      </FixedScreen>
    );
  }

  return (
    <FixedScreen>
      <View className="flex-1 justify-center gap-6">
        <Heading className="text-3xl">{t('intervention.title')}</Heading>

        {plan ? (
          <>
            <Body>{t('intervention.subtitle')}</Body>
            <Card className="gap-1 bg-junto-claro p-6">
              <Body className="text-xl text-tinta">
                {t('intervention.when', { condition: plan.condition })}
              </Body>
              <Body className="text-xl font-bold text-junto-escuro">
                {t('intervention.then', { action: plan.action })}
              </Body>
            </Card>
          </>
        ) : (
          <Card className="bg-junto-claro p-6">
            <Body className="text-xl text-tinta">{t('intervention.no_plan')}</Body>
          </Card>
        )}
      </View>

      <View className="gap-2">
        <Button label={t('intervention.do_it')} onPress={() => router.back()} />
        {plan && plans.length > dismissed.length + 1 && (
          <Button
            label={t('intervention.show_another')}
            variant="quiet"
            onPress={() => setDismissed((d) => [...d, plan.id])}
          />
        )}
      </View>
    </FixedScreen>
  );
}
