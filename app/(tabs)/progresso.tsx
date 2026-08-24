import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Cartao, Rotulo, Tela, Texto, Titulo } from '@/components/base';
import { CurvaCraving } from '@/components/CurvaCraving';
import { eficacia } from '@/domain/plans';
import { podeReaplicar } from '@/domain/scoring';
import {
  cravingPorSemana,
  diasDesdeUltimaAposta,
  dinheiroNaoGasto,
  totalDeDiasSemAposta,
} from '@/domain/progresso';
import { useJunto } from '@/estado/useJunto';
import { t } from '@/i18n';

export default function Progresso() {
  const router = useRouter();
  const emas = useJunto((e) => e.emas);
  const planos = useJunto((e) => e.planos);
  const perfil = useJunto((e) => e.perfil);

  const entradas = useMemo(
    () =>
      emas.map((e) => ({
        respondidaEm: new Date(e.respondidaEm),
        craving: e.craving,
        apostouDesdeUltima: e.apostouDesdeUltima,
        faixaValor: e.faixaValor,
      })),
    [emas]
  );

  const dias = diasDesdeUltimaAposta(entradas) ?? 0;
  const total = totalDeDiasSemAposta(entradas);
  const curva = cravingPorSemana(entradas);
  const economizado = dinheiroNaoGasto(entradas);

  const melhores = [...planos]
    .filter((p) => p.vezesMostrado > 0)
    .sort((a, b) => eficacia(b) - eficacia(a))
    .slice(0, 3);

  const reaplicar =
    perfil?.pgsiEm != null && podeReaplicar(new Date(perfil.pgsiEm));

  return (
    <Tela>
      <Titulo className="py-2">{t('progresso.titulo')}</Titulo>

      <Cartao className="items-center gap-1 py-6">
        <Text className="text-5xl font-bold text-junto">{dias}</Text>
        <Rotulo>
          {dias === 1 ? t('progresso.dias_sem_apostar_um') : t('progresso.dias_sem_apostar')}
        </Rotulo>
        {total > 0 && (
          <Text className="pt-1 text-center text-sm text-tinta-suave">
            {t('progresso.total_acumulado', { n: total })}
          </Text>
        )}
      </Cartao>

      <View className="gap-2">
        <Titulo className="text-lg">{t('progresso.craving_titulo')}</Titulo>
        <Cartao>
          {curva.length === 0 ? (
            <Texto>{t('progresso.craving_vazio')}</Texto>
          ) : (
            <CurvaCraving pontos={curva} />
          )}
        </Cartao>
      </View>

      {economizado > 0 && (
        <View className="gap-2">
          <Titulo className="text-lg">{t('progresso.dinheiro_titulo')}</Titulo>
          <Cartao className="gap-1">
            <Text className="text-3xl font-bold text-junto">
              {t('progresso.dinheiro_valor', { valor: economizado.toLocaleString('pt-BR') })}
            </Text>
            <Rotulo>{t('progresso.dinheiro_nota')}</Rotulo>
          </Cartao>
        </View>
      )}

      {melhores.length > 0 && (
        <View className="gap-2">
          <Titulo className="text-lg">{t('progresso.planos_titulo')}</Titulo>
          {melhores.map((p) => (
            <Cartao key={p.id} className="gap-1">
              <Text className="text-base text-tinta">
                Quando {p.condicao}, eu vou {p.acao}.
              </Text>
              <Rotulo>
                {t('planos.funcionou_n_vezes', { n: p.vezesFuncionou, total: p.vezesMostrado })}
              </Rotulo>
            </Cartao>
          ))}
        </View>
      )}

      {reaplicar && (
        <Cartao className="gap-3 bg-calma-clara">
          <Texto className="text-tinta">{t('pgsi.reaplicar')}</Texto>
          <Botao
            variante="secundario"
            titulo={t('pgsi.titulo')}
            onPress={() => router.push('/(onboarding)/pgsi')}
          />
        </Cartao>
      )}
    </Tela>
  );
}
