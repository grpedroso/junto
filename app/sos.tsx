import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, FixedScreen, Heading } from '@/components/base';
import { pickPlan } from '@/domain/plans';
import { useJunto } from '@/state/useJunto';
import { t } from '@/i18n';

/**
 * Outside the EMA cycle, always reachable, and works with no network: the plans
 * are on the device and the help screen's phone numbers are in the code.
 */
export default function Sos() {
  const router = useRouter();
  const plans = useJunto((s) => s.plans);
  const createIntervention = useJunto((s) => s.createIntervention);
  const [breathing, setBreathing] = useState(false);

  const openPlan = async () => {
    const plan = pickPlan(plans);
    const intervention = await createIntervention('sos', null, plan?.id ?? null);
    router.replace({ pathname: '/intervention/[id]', params: { id: intervention.id } });
  };

  if (breathing) return <Breathing onLeave={() => setBreathing(false)} />;

  return (
    <FixedScreen>
      <View className="flex-1 justify-center gap-3">
        <Heading className="text-4xl">{t('sos.title')}</Heading>
        <Text className="text-lg text-ink-soft">{t('sos.subtitle')}</Text>
      </View>

      <View className="gap-3">
        <Button label={t('sos.my_plans')} onPress={openPlan} />
        <Button
          label={t('sos.breathing')}
          variant="secondary"
          onPress={() => setBreathing(true)}
        />
        <Button
          label={t('sos.talk_to_someone')}
          variant="secondary"
          onPress={() => router.replace('/(tabs)/help')}
        />
        <Button label={t('common.back')} variant="quiet" onPress={() => router.back()} />
      </View>
    </FixedScreen>
  );
}

const CYCLE = [
  { key: 'sos.breathing_in', seconds: 4, scale: 1.6 },
  { key: 'sos.breathing_hold', seconds: 7, scale: 1.6 },
  { key: 'sos.breathing_out', seconds: 8, scale: 1 },
] as const;

function Breathing({ onLeave }: { onLeave: () => void }) {
  const [phase, setPhase] = useState(0);
  const [remaining, setRemaining] = useState<number>(CYCLE[0].seconds);
  const scale = useRef(new Animated.Value(1)).current;
  const current = CYCLE[phase];

  useEffect(() => {
    Animated.timing(scale, {
      toValue: current.scale,
      duration: current.seconds * 1000,
      useNativeDriver: true,
    }).start();

    setRemaining(current.seconds);
    const tick = setInterval(() => setRemaining((r) => r - 1), 1000);
    const next = setTimeout(() => setPhase((p) => (p + 1) % CYCLE.length), current.seconds * 1000);

    return () => {
      clearInterval(tick);
      clearTimeout(next);
    };
  }, [phase, current, scale]);

  return (
    <FixedScreen>
      <View className="flex-1 items-center justify-center gap-10">
        <Animated.View
          style={{ transform: [{ scale }] }}
          className="h-40 w-40 rounded-full bg-junto-light"
        />
        <View className="items-center gap-1">
          <Text className="text-2xl font-semibold text-ink">{t(current.key)}</Text>
          <Text className="text-5xl font-bold text-junto">{Math.max(remaining, 0)}</Text>
        </View>
      </View>
      <Button label={t('common.done')} onPress={onLeave} />
    </FixedScreen>
  );
}
