import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Cartao, Tela, Texto, Titulo } from '@/components/base';
import { QuestionarioPgsi, ResultadoPgsi } from '@/components/QuestionarioPgsi';
import { faixaPgsi } from '@/domain/scoring';
import { useJunto } from '@/estado/useJunto';
import { t } from '@/i18n';

export default function PgsiOnboarding() {
  const router = useRouter();
  const registrarPgsi = useJunto((e) => e.registrarPgsi);
  const [fase, setFase] = useState<'intro' | 'perguntas' | 'resultado'>('intro');
  const [escore, setEscore] = useState(0);

  const seguir = () => router.push('/(onboarding)/permissao');

  if (fase === 'intro') {
    return (
      <Tela>
        <View className="flex-1 justify-center gap-4 py-16">
          <Titulo className="text-3xl">{t('pgsi.titulo')}</Titulo>
          <Cartao>
            <Texto>{t('pgsi.intro')}</Texto>
          </Cartao>
        </View>
        <Botao titulo={t('comum.continuar')} onPress={() => setFase('perguntas')} />
        <Botao titulo={t('comum.pular')} variante="discreto" onPress={seguir} />
      </Tela>
    );
  }

  if (fase === 'perguntas') {
    return (
      <QuestionarioPgsi
        onPular={seguir}
        onConcluir={async (valor) => {
          setEscore(valor);
          await registrarPgsi(valor);
          setFase('resultado');
        }}
      />
    );
  }

  return (
    <ResultadoPgsi
      escore={escore}
      faixa={faixaPgsi(escore)}
      onFechar={seguir}
      rotuloBotao={t('comum.continuar')}
    />
  );
}
