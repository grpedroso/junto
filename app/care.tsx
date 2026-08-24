import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Card, FixedScreen, Heading } from '@/components/base';
import { Resources } from '@/components/Resources';
import { t } from '@/i18n';

/**
 * The care screen. Rules that do not bend (section 9.1 of the project plan):
 *
 *   - no suicide-risk screening -- it offers a route to help, nothing more
 *   - no visual alarm: no red, no danger icon
 *   - it does not block the app and forces no action
 *   - no mention of self-harm methods, in any form
 *
 * Any text change here requires clinical review. See CONTRIBUTING.md.
 */
export default function Care() {
  const router = useRouter();

  return (
    <FixedScreen>
      <View className="flex-1 justify-center gap-4">
        <Heading className="text-3xl">{t('care.title')}</Heading>
        <Card className="bg-calma-clara">
          <Body className="text-lg text-tinta">{t('care.text')}</Body>
        </Card>
        <Resources urgentOnly />
        <Body className="text-center">{t('care.reminder')}</Body>
      </View>
      <Button label={t('care.close')} variant="secondary" onPress={() => router.back()} />
    </FixedScreen>
  );
}
