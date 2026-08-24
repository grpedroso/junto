import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Chips, Heading, Screen } from '@/components/base';
import { useJunto } from '@/state/useJunto';
import type { Goal } from '@/domain/types';
import { t } from '@/i18n';

export default function ChooseGoal() {
  const router = useRouter();
  const setGoal = useJunto((s) => s.setGoal);
  const [goal, setLocalGoal] = useState<Goal>('quit');

  const next = async () => {
    await setGoal(goal);
    router.push('/(onboarding)/times');
  };

  return (
    <Screen>
      <View className="flex-1 justify-center gap-6 py-16">
        <Heading className="text-3xl">{t('onboarding.goal_title')}</Heading>
        <Chips
          items={[
            { value: 'quit', label: t('onboarding.goal_quit') },
            { value: 'reduce', label: t('onboarding.goal_reduce') },
          ]}
          selected={[goal]}
          onToggle={(v) => setLocalGoal(v as Goal)}
        />
      </View>
      <Button label={t('common.continue')} onPress={next} />
    </Screen>
  );
}
