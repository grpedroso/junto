import '../global.css';

import { useEffect } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useJunto } from '@/state/useJunto';
import { flush } from '@/lib/storage';
import { prepareChannels } from '@/lib/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const loading = useJunto((s) => s.loading);
  const profile = useJunto((s) => s.profile);
  const start = useJunto((s) => s.start);

  useEffect(() => {
    void start();
    void prepareChannels();
  }, [start]);

  // Every return to the foreground is a chance for the offline queue to drain.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void flush();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;
      if (data?.kind === 'ema') {
        router.push({ pathname: '/ema', params: { scheduledFor: data.scheduledFor ?? '' } });
      } else if (data?.kind === 'followup' && data.interventionId) {
        router.push({
          pathname: '/intervention/[id]',
          params: { id: data.interventionId, followup: '1' },
        });
      }
    });
    return () => sub.remove();
  }, [router]);

  // Only the way in is automatic. The way back out is done by the end of the
  // onboarding, because those screens get reused later -- the 30-day PGSI comes
  // in through `/(onboarding)/pgsi` with onboarding already finished.
  useEffect(() => {
    if (loading) return;
    if (!profile?.onboardingDone && segments[0] !== '(onboarding)') {
      router.replace('/(onboarding)');
    }
  }, [loading, profile?.onboardingDone, segments, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-fundo">
        <ActivityIndicator color="#1F6F5C" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F9F8' } }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ema" options={{ presentation: 'modal' }} />
        <Stack.Screen name="intervention/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="sos" options={{ presentation: 'modal' }} />
        <Stack.Screen name="care" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" />
      </Stack>
    </SafeAreaProvider>
  );
}
