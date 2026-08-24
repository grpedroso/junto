import { useState } from 'react';
import { Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as IntentLauncher from 'expo-intent-launcher';
import { Body, Button, Card, Heading, Screen } from '@/components/base';
import { requestPermission } from '@/lib/notifications';
import { t } from '@/i18n';

/**
 * Two asks, in this order, and both skippable. An app that gets stuck here
 * loses the person before they see the first screen -- and dropout is the
 * project's biggest risk. Exactly what to ask depends on the Phase 0 result;
 * see NOTIFICATIONS.md.
 */
export default function Permissions() {
  const router = useRouter();
  const [phase, setPhase] = useState<'notification' | 'battery'>('notification');

  const next = () => router.push('/(onboarding)/done');

  if (phase === 'notification') {
    return (
      <Screen>
        <View className="flex-1 justify-center gap-4 py-16">
          <Heading className="text-3xl">{t('onboarding.permission_title')}</Heading>
          <Card>
            <Body>{t('onboarding.permission_text')}</Body>
          </Card>
        </View>
        <Button
          label={t('onboarding.permission_button')}
          onPress={async () => {
            await requestPermission();
            setPhase(Platform.OS === 'android' ? 'battery' : 'notification');
            if (Platform.OS !== 'android') next();
          }}
        />
        <Button label={t('common.not_now')} variant="quiet" onPress={next} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4 py-16">
        <Heading className="text-3xl">{t('onboarding.battery_title')}</Heading>
        <Card>
          <Body>{t('onboarding.battery_text')}</Body>
        </Card>
      </View>
      <Button
        label={t('onboarding.battery_button')}
        onPress={async () => {
          await IntentLauncher.startActivityAsync(
            'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
          );
          next();
        }}
      />
      <Button label={t('common.not_now')} variant="quiet" onPress={next} />
    </Screen>
  );
}
