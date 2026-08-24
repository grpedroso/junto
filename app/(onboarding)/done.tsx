import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Heading, Screen } from '@/components/base';
import { useJunto } from '@/state/useJunto';
import { t } from '@/i18n';

export default function Done() {
  const router = useRouter();
  const finishOnboarding = useJunto((s) => s.finishOnboarding);

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4 py-16">
        <Heading className="text-4xl">{t('onboarding.done_title')}</Heading>
        <Body className="text-lg">{t('onboarding.done_text')}</Body>
      </View>
      <Button
        label={t('common.done')}
        onPress={async () => {
          await finishOnboarding();
          router.replace('/(tabs)');
        }}
      />
    </Screen>
  );
}
