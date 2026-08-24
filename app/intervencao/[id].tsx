import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Botao, Cartao, Pergunta, TelaFixa, Texto, Titulo } from '@/components/base';
import { escolherPlano } from '@/domain/plans';
import { useJunto } from '@/estado/useJunto';
import { t } from '@/i18n';

export default function Intervencao() {
  const router = useRouter();
  const { id, followup } = useLocalSearchParams<{ id: string; followup?: string }>();
  const planos = useJunto((e) => e.planos);
  const intervencoes = useJunto((e) => e.intervencoes);
  const responderFollowUp = useJunto((e) => e.responderFollowUp);

  const intervencao = intervencoes.find((i) => i.id === id);
  const [descartados, setDescartados] = useState<string[]>([]);
  const [resposta, setResposta] = useState<'resistiu' | 'apostou' | null>(null);

  const plano = useMemo(() => {
    const doRegistro = planos.find((p) => p.id === intervencao?.planoId);
    if (doRegistro && !descartados.includes(doRegistro.id)) return doRegistro;
    return escolherPlano(planos.filter((p) => !descartados.includes(p.id)));
  }, [planos, intervencao?.planoId, descartados]);

  const ehFollowUp = followup === '1';

  if (ehFollowUp) {
    if (resposta) {
      return (
        <TelaFixa>
          <View className="flex-1 justify-center gap-4">
            <Titulo className="text-3xl">
              {t(
                resposta === 'resistiu'
                  ? 'intervencao.followup_resposta_sim'
                  : 'intervencao.followup_resposta_nao'
              )}
            </Titulo>
          </View>
          <Botao titulo={t('comum.pronto')} onPress={() => router.back()} />
        </TelaFixa>
      );
    }

    return (
      <TelaFixa>
        <View className="flex-1 justify-center gap-6">
          <Pergunta>{t('intervencao.followup_titulo')}</Pergunta>
        </View>
        <View className="gap-3">
          <Botao
            titulo={t('intervencao.followup_sim')}
            onPress={async () => {
              setResposta('resistiu');
              await responderFollowUp(id, 'resistiu');
            }}
          />
          <Botao
            titulo={t('intervencao.followup_nao')}
            variante="secundario"
            onPress={async () => {
              setResposta('apostou');
              await responderFollowUp(id, 'apostou');
            }}
          />
        </View>
      </TelaFixa>
    );
  }

  return (
    <TelaFixa>
      <View className="flex-1 justify-center gap-6">
        <Titulo className="text-3xl">{t('intervencao.titulo')}</Titulo>

        {plano ? (
          <>
            <Texto>{t('intervencao.subtitulo')}</Texto>
            <Cartao className="gap-1 bg-junto-claro p-6">
              <Texto className="text-xl text-tinta">
                {t('intervencao.quando', { condicao: plano.condicao })}
              </Texto>
              <Texto className="text-xl font-bold text-junto-escuro">
                {t('intervencao.entao', { acao: plano.acao })}
              </Texto>
            </Cartao>
          </>
        ) : (
          <Cartao className="bg-junto-claro p-6">
            <Texto className="text-xl text-tinta">{t('intervencao.sem_plano')}</Texto>
          </Cartao>
        )}
      </View>

      <View className="gap-2">
        <Botao titulo={t('intervencao.botao_fazer')} onPress={() => router.back()} />
        {plano && planos.length > descartados.length + 1 && (
          <Botao
            titulo={t('intervencao.botao_outro')}
            variante="discreto"
            onPress={() => setDescartados((d) => [...d, plano.id])}
          />
        )}
      </View>
    </TelaFixa>
  );
}
