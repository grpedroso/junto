import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Progresso, Tela, Texto, Titulo } from '@/components/base';
import { t } from '@/i18n';

const PASSOS = [
  { titulo: 'onboarding.boas_vindas_titulo', texto: 'onboarding.boas_vindas_texto' },
  { titulo: 'onboarding.o_que_e_titulo', texto: 'onboarding.o_que_e_texto' },
  { titulo: 'onboarding.o_que_nao_e_titulo', texto: 'onboarding.o_que_nao_e_texto' },
  { titulo: 'onboarding.privacidade_titulo', texto: 'onboarding.privacidade_texto' },
];

export default function Apresentacao() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const atual = PASSOS[passo];

  const avancar = () =>
    passo === PASSOS.length - 1 ? router.push('/(onboarding)/meta') : setPasso(passo + 1);

  return (
    <Tela>
      <Progresso passo={passo} total={PASSOS.length} />
      <View className="flex-1 justify-center gap-4 py-16">
        <Titulo className="text-4xl">{t(atual.titulo)}</Titulo>
        <Texto className="text-lg">{t(atual.texto)}</Texto>
      </View>
      <Botao titulo={t('comum.continuar')} onPress={avancar} />
    </Tela>
  );
}
