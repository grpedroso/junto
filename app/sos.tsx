import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, TelaFixa, Titulo } from '@/components/base';
import { escolherPlano } from '@/domain/plans';
import { useJunto } from '@/estado/useJunto';
import { t } from '@/i18n';

/**
 * Fora do ciclo das EMAs, sempre alcancavel, e funciona sem rede: os planos
 * estao no aparelho e os telefones da tela de ajuda sao fixos no codigo.
 */
export default function Sos() {
  const router = useRouter();
  const planos = useJunto((e) => e.planos);
  const criarIntervencao = useJunto((e) => e.criarIntervencao);
  const [respirando, setRespirando] = useState(false);

  const abrirPlano = async () => {
    const plano = escolherPlano(planos);
    const intervencao = await criarIntervencao('sos', null, plano?.id ?? null);
    router.replace({ pathname: '/intervencao/[id]', params: { id: intervencao.id } });
  };

  if (respirando) return <Respiracao onSair={() => setRespirando(false)} />;

  return (
    <TelaFixa>
      <View className="flex-1 justify-center gap-3">
        <Titulo className="text-4xl">{t('sos.titulo')}</Titulo>
        <Text className="text-lg text-tinta-suave">{t('sos.subtitulo')}</Text>
      </View>

      <View className="gap-3">
        <Botao titulo={t('sos.meus_planos')} onPress={abrirPlano} />
        <Botao
          titulo={t('sos.respiracao')}
          variante="secundario"
          onPress={() => setRespirando(true)}
        />
        <Botao
          titulo={t('sos.falar_com_alguem')}
          variante="secundario"
          onPress={() => router.replace('/(tabs)/ajuda')}
        />
        <Botao titulo={t('comum.voltar')} variante="discreto" onPress={() => router.back()} />
      </View>
    </TelaFixa>
  );
}

const CICLO = [
  { chave: 'sos.respiracao_inspira', segundos: 4, escala: 1.6 },
  { chave: 'sos.respiracao_segura', segundos: 7, escala: 1.6 },
  { chave: 'sos.respiracao_solta', segundos: 8, escala: 1 },
] as const;

function Respiracao({ onSair }: { onSair: () => void }) {
  const [fase, setFase] = useState(0);
  const [resta, setResta] = useState<number>(CICLO[0].segundos);
  const escala = useRef(new Animated.Value(1)).current;
  const atual = CICLO[fase];

  useEffect(() => {
    Animated.timing(escala, {
      toValue: atual.escala,
      duration: atual.segundos * 1000,
      useNativeDriver: true,
    }).start();

    setResta(atual.segundos);
    const tique = setInterval(() => setResta((r) => r - 1), 1000);
    const troca = setTimeout(() => setFase((f) => (f + 1) % CICLO.length), atual.segundos * 1000);

    return () => {
      clearInterval(tique);
      clearTimeout(troca);
    };
  }, [fase, atual, escala]);

  return (
    <TelaFixa>
      <View className="flex-1 items-center justify-center gap-10">
        <Animated.View
          style={{ transform: [{ scale: escala }] }}
          className="h-40 w-40 rounded-full bg-junto-claro"
        />
        <View className="items-center gap-1">
          <Text className="text-2xl font-semibold text-tinta">{t(atual.chave)}</Text>
          <Text className="text-5xl font-bold text-junto">{Math.max(resta, 0)}</Text>
        </View>
      </View>
      <Botao titulo={t('comum.pronto')} onPress={onSair} />
    </TelaFixa>
  );
}
