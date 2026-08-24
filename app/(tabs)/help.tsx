import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Card, Heading, Screen } from '@/components/base';
import { Resources } from '@/components/Resources';
import { t } from '@/i18n';

export default function Help() {
  const router = useRouter();

  return (
    <Screen>
      <Heading className="py-2">{t('help.title')}</Heading>

      <Button label={t('help.need_now')} onPress={() => router.push('/care')} />

      <Resources />

      <View className="gap-2 pt-4">
        <Heading className="text-lg">{t('help.blockers_title')}</Heading>
        <Card>
          <Body>{t('help.blockers_desc')}</Body>
        </Card>
      </View>
    </Screen>
  );
}
