import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Chips, Tela, Titulo } from '@/components/base';
import { useJunto } from '@/estado/useJunto';
import type { Meta } from '@/domain/tipos';
import { t } from '@/i18n';

export default function EscolherMeta() {
  const router = useRouter();
  const definirMeta = useJunto((e) => e.definirMeta);
  const [meta, setMeta] = useState<Meta>('parar');

  const seguir = async () => {
    await definirMeta(meta);
    router.push('/(onboarding)/horarios');
  };

  return (
    <Tela>
      <View className="flex-1 justify-center gap-6 py-16">
        <Titulo className="text-3xl">{t('onboarding.meta_titulo')}</Titulo>
        <Chips
          itens={[
            { valor: 'parar', rotulo: t('onboarding.meta_parar') },
            { valor: 'reduzir', rotulo: t('onboarding.meta_reduzir') },
          ]}
          selecionados={[meta]}
          onToggle={(v) => setMeta(v as Meta)}
        />
      </View>
      <Botao titulo={t('comum.continuar')} onPress={seguir} />
    </Tela>
  );
}
