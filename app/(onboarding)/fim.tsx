import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Tela, Texto, Titulo } from '@/components/base';
import { useJunto } from '@/estado/useJunto';
import { t } from '@/i18n';

export default function Fim() {
  const router = useRouter();
  const concluirOnboarding = useJunto((e) => e.concluirOnboarding);

  return (
    <Tela>
      <View className="flex-1 justify-center gap-4 py-16">
        <Titulo className="text-4xl">{t('onboarding.fim_titulo')}</Titulo>
        <Texto className="text-lg">{t('onboarding.fim_texto')}</Texto>
      </View>
      <Botao
        titulo={t('comum.pronto')}
        onPress={async () => {
          await concluirOnboarding();
          router.replace('/(tabs)');
        }}
      />
    </Tela>
  );
}
