import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Card, Heading, Screen } from '@/components/base';
import { DEFAULT_TIMES, type TimeOfDay } from '@/domain/ema';
import { useJunto } from '@/state/useJunto';
import { t } from '@/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

export default function ChooseTimes() {
  const router = useRouter();
  const setTimes = useJunto((s) => s.setTimes);
  const [times, setLocalTimes] = useState<TimeOfDay[]>([...DEFAULT_TIMES]);

  const shift = (index: number, delta: number) =>
    setLocalTimes((current) =>
      current.map((time, i) =>
        i === index ? { ...time, hour: (time.hour + delta + 24) % 24 } : time
      )
    );

  const next = async () => {
    await setTimes(times);
    router.push('/(onboarding)/plans');
  };

  return (
    <Screen>
      <View className="gap-2 py-8">
        <Heading className="text-3xl">{t('onboarding.times_title')}</Heading>
        <Body>{t('onboarding.times_text')}</Body>
      </View>

      <View className="flex-1 justify-center gap-3">
        {times.map((time, i) => (
          <Card key={i} className="flex-row items-center justify-between">
            <Nudge label="−" onPress={() => shift(i, -1)} />
            <Text className="text-3xl font-bold text-ink">
              {pad(time.hour)}:{pad(time.minute)}
            </Text>
            <Nudge label="+" onPress={() => shift(i, 1)} />
          </Card>
        ))}
      </View>

      <Button label={t('common.continue')} onPress={next} />
    </Screen>
  );
}

const Nudge = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className="h-12 w-12 items-center justify-center rounded-full bg-junto-light active:opacity-70"
  >
    <Text className="text-2xl font-bold text-junto-dark">{label}</Text>
  </Pressable>
);
