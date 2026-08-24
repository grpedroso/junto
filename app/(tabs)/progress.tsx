import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Card, Heading, Label, Screen } from '@/components/base';
import { CravingCurve } from '@/components/CravingCurve';
import { effectiveness } from '@/domain/plans';
import { canRetake } from '@/domain/scoring';
import {
  cravingByWeek,
  daysSinceLastBet,
  moneyNotSpent,
  totalCleanDays,
} from '@/domain/progress';
import { useJunto } from '@/state/useJunto';
import { t } from '@/i18n';

export default function Progress() {
  const router = useRouter();
  const emas = useJunto((s) => s.emas);
  const plans = useJunto((s) => s.plans);
  const profile = useJunto((s) => s.profile);

  const entries = useMemo(
    () =>
      emas.map((e) => ({
        answeredAt: new Date(e.answeredAt),
        craving: e.craving,
        gambledSinceLast: e.gambledSinceLast,
        amountBand: e.amountBand,
      })),
    [emas]
  );

  const days = daysSinceLastBet(entries) ?? 0;
  const total = totalCleanDays(entries);
  const curve = cravingByWeek(entries);
  const saved = moneyNotSpent(entries);

  const bestPlans = [...plans]
    .filter((p) => p.timesShown > 0)
    .sort((a, b) => effectiveness(b) - effectiveness(a))
    .slice(0, 3);

  const retake = profile?.pgsiAt != null && canRetake(new Date(profile.pgsiAt));

  return (
    <Screen>
      <Heading className="py-2">{t('progress.title')}</Heading>

      <Card className="items-center gap-1 py-6">
        <Text className="text-5xl font-bold text-junto">{days}</Text>
        <Label>
          {days === 1
            ? t('progress.days_without_betting_one')
            : t('progress.days_without_betting')}
        </Label>
        {total > 0 && (
          <Text className="pt-1 text-center text-sm text-ink-soft">
            {t('progress.running_total', { n: total })}
          </Text>
        )}
      </Card>

      <View className="gap-2">
        <Heading className="text-lg">{t('progress.craving_title')}</Heading>
        <Card>
          {curve.length === 0 ? (
            <Body>{t('progress.craving_empty')}</Body>
          ) : (
            <CravingCurve points={curve} />
          )}
        </Card>
      </View>

      {saved > 0 && (
        <View className="gap-2">
          <Heading className="text-lg">{t('progress.money_title')}</Heading>
          <Card className="gap-1">
            <Text className="text-3xl font-bold text-junto">
              {t('progress.money_value', { value: saved.toLocaleString('pt-BR') })}
            </Text>
            <Label>{t('progress.money_note')}</Label>
          </Card>
        </View>
      )}

      {bestPlans.length > 0 && (
        <View className="gap-2">
          <Heading className="text-lg">{t('progress.plans_title')}</Heading>
          {bestPlans.map((p) => (
            <Card key={p.id} className="gap-1">
              <Text className="text-base text-ink">
                Quando {p.condition}, eu vou {p.action}.
              </Text>
              <Label>
                {t('plans.worked_n_times', { n: p.timesWorked, total: p.timesShown })}
              </Label>
            </Card>
          ))}
        </View>
      )}

      {retake && (
        <Card className="gap-3 bg-calm-light">
          <Body className="text-ink">{t('pgsi.retake')}</Body>
          <Button
            variant="secondary"
            label={t('pgsi.title')}
            onPress={() => router.push('/(onboarding)/pgsi')}
          />
        </Card>
      )}
    </Screen>
  );
}
