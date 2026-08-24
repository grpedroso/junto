import { useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button, Card, Heading, Label, Screen } from '@/components/base';
import { useJunto } from '@/state/useJunto';
import { deleteMyData } from '@/lib/session';
import { cancelEmas } from '@/lib/notifications';
import { t } from '@/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Settings() {
  const router = useRouter();
  const profile = useJunto((s) => s.profile);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = () =>
    Alert.alert(t('settings.delete_data'), t('settings.delete_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.delete_data'),
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await cancelEmas();
            await deleteMyData();
            Alert.alert(t('settings.delete_done'));
            router.replace('/(onboarding)');
          } catch (e) {
            Alert.alert(t('errors.generic'), String(e));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);

  return (
    <Screen>
      <View className="flex-row items-center gap-2 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center active:opacity-60"
        >
          <Ionicons name="chevron-back" size={24} color="#16211E" />
        </Pressable>
        <Heading>{t('settings.title')}</Heading>
      </View>

      <Card className="gap-1">
        <Label>{t('settings.times')}</Label>
        <Text className="text-lg text-ink">
          {profile?.times.map((time) => `${pad(time.hour)}:${pad(time.minute)}`).join('  ·  ')}
        </Text>
      </Card>

      <Button
        variant="secondary"
        label={t('settings.privacy')}
        onPress={() => Linking.openURL('https://github.com/grpedroso/junto/blob/main/PRIVACY.md')}
      />

      <Button
        variant="quiet"
        label={t('settings.delete_data')}
        disabled={deleting}
        onPress={confirmDelete}
      />
    </Screen>
  );
}
