import '../global.css';

import { useEffect, useRef } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useJunto } from '@/estado/useJunto';
import { descarregar } from '@/lib/storage';
import { prepararCanais } from '@/lib/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function LayoutRaiz() {
  const router = useRouter();
  const segmentos = useSegments();
  const carregando = useJunto((e) => e.carregando);
  const perfil = useJunto((e) => e.perfil);
  const iniciar = useJunto((e) => e.iniciar);
  const jaRedirecionou = useRef(false);

  useEffect(() => {
    void iniciar();
    void prepararCanais();
  }, [iniciar]);

  // Toda volta para o primeiro plano e uma chance de a fila offline esvaziar.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void descarregar();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      const dados = r.notification.request.content.data as Record<string, string>;
      if (dados?.tipo === 'ema') {
        router.push({ pathname: '/ema', params: { agendadaPara: dados.agendadaPara ?? '' } });
      } else if (dados?.tipo === 'followup' && dados.intervencaoId) {
        router.push({
          pathname: '/intervencao/[id]',
          params: { id: dados.intervencaoId, followup: '1' },
        });
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (carregando) return;
    const noOnboarding = segmentos[0] === '(onboarding)';
    const precisa = !perfil?.onboardingFeito;

    if (precisa && !noOnboarding) {
      router.replace('/(onboarding)');
    } else if (!precisa && noOnboarding && !jaRedirecionou.current) {
      jaRedirecionou.current = true;
      router.replace('/(tabs)');
    }
  }, [carregando, perfil?.onboardingFeito, segmentos, router]);

  if (carregando) {
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
        <Stack.Screen name="intervencao/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="sos" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cuidado" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ajustes" />
      </Stack>
    </SafeAreaProvider>
  );
}
