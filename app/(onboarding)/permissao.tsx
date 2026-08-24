import { useState } from 'react';
import { Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as IntentLauncher from 'expo-intent-launcher';
import { Botao, Cartao, Tela, Texto, Titulo } from '@/components/base';
import { pedirPermissao } from '@/lib/notifications';
import { t } from '@/i18n';

/**
 * Dois pedidos, nesta ordem, e os dois puláveis. Um app que trava aqui perde a
 * pessoa antes de ela ver a primeira tela -- e dropout e o maior risco do
 * projeto. O que exatamente pedir depende do resultado da Fase 0; ver
 * NOTIFICATIONS.md.
 */
export default function Permissao() {
  const router = useRouter();
  const [fase, setFase] = useState<'notificacao' | 'bateria'>('notificacao');

  const seguir = () => router.push('/(onboarding)/fim');

  if (fase === 'notificacao') {
    return (
      <Tela>
        <View className="flex-1 justify-center gap-4 py-16">
          <Titulo className="text-3xl">{t('onboarding.permissao_titulo')}</Titulo>
          <Cartao>
            <Texto>{t('onboarding.permissao_texto')}</Texto>
          </Cartao>
        </View>
        <Botao
          titulo={t('onboarding.permissao_botao')}
          onPress={async () => {
            await pedirPermissao();
            setFase(Platform.OS === 'android' ? 'bateria' : 'notificacao');
            if (Platform.OS !== 'android') seguir();
          }}
        />
        <Botao titulo={t('comum.agora_nao')} variante="discreto" onPress={seguir} />
      </Tela>
    );
  }

  return (
    <Tela>
      <View className="flex-1 justify-center gap-4 py-16">
        <Titulo className="text-3xl">{t('onboarding.bateria_titulo')}</Titulo>
        <Cartao>
          <Texto>{t('onboarding.bateria_texto')}</Texto>
        </Cartao>
      </View>
      <Botao
        titulo={t('onboarding.bateria_botao')}
        onPress={async () => {
          await IntentLauncher.startActivityAsync(
            'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
          );
          seguir();
        }}
      />
      <Botao titulo={t('comum.agora_nao')} variante="discreto" onPress={seguir} />
    </Tela>
  );
}
