import { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Body, Button, Card, Heading, Label, Screen } from '@/components/base';
import { needsCareScreen } from '@/domain/ema';
import { daysSinceLastBet, totalCleanDays } from '@/domain/progress';
import { useJunto } from '@/state/useJunto';
import { KEYS, read, write } from '@/lib/storage';
import { t } from '@/i18n';

export default function Today() {
  const router = useRouter();
  const profile = useJunto((s) => s.profile);
  const emas = useJunto((s) => s.emas);

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

  const days = daysSinceLastBet(entries);
  const total = totalCleanDays(entries);
  const care = needsCareScreen(emas);
  const latestEma = emas[0]?.id;

  // Offer, never impose: the care screen neither blocks nor forces anything. And
  // it shows once per new answer -- repeating it every open would read as nagging.
  useEffect(() => {
    if (!care || !latestEma) return;
    void (async () => {
      const seen = await read<string>(KEYS.careSeen);
      if (seen === latestEma) return;
      await write(KEYS.careSeen, latestEma);
      router.push('/care');
    })();
  }, [care, latestEma, router]);

  return (
    <Screen>
      <View className="flex-row items-center justify-between py-2">
        <Heading>{t('onboarding.welcome_title')}</Heading>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.title')}
          onPress={() => router.push('/settings')}
          className="h-11 w-11 items-center justify-center active:opacity-60"
        >
          <Ionicons name="settings-outline" size={22} color="#5C6E68" />
        </Pressable>
      </View>

      <Card className="items-center gap-1 py-8">
        <Text className="text-6xl font-bold text-junto">{days ?? 0}</Text>
        <Label>
          {days === 1
            ? t('progress.days_without_betting_one')
            : t('progress.days_without_betting')}
        </Label>
        {total > 0 && (
          <Text className="pt-2 text-center text-sm text-ink-soft">
            {t('progress.running_total', { n: total })}
          </Text>
        )}
      </Card>

      <Button label={t('ema.notification_title')} onPress={() => router.push('/ema')} />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/sos')}
        className="min-h-16 items-center justify-center rounded-2xl border-2 border-junto bg-surface active:opacity-70"
      >
        <Text className="text-xl font-bold text-junto">{t('sos.button')}</Text>
        <Text className="text-sm text-ink-soft">{t('sos.title')}</Text>
      </Pressable>

      {profile?.baselinePgsi === null && (
        <Card>
          <Body>{t('pgsi.intro')}</Body>
          <Button
            className="mt-3"
            variant="secondary"
            label={t('pgsi.title')}
            onPress={() => router.push('/(onboarding)/pgsi')}
          />
        </Card>
      )}
    </Screen>
  );
}
