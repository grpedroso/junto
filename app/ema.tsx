import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Botao, Chips, Pergunta, Progresso, TelaFixa } from '@/components/base';
import { Escala } from '@/components/Escala';
import { avaliarDisparo } from '@/domain/ema';
import { escolherPlano } from '@/domain/plans';
import type {
  Contexto,
  FaixaValor,
  Gatilho,
  Humor,
  RespostaEma,
} from '@/domain/tipos';
import { useJunto } from '@/estado/useJunto';
import { adiarUmaHora } from '@/lib/notifications';
import { CHAVES, gravar, ler } from '@/lib/storage';
import { t } from '@/i18n';

const HUMORES: Humor[] = ['tranquilo', 'ansioso', 'triste', 'irritado', 'animado', 'entediado'];
const GATILHOS: Gatilho[] = [
  'dinheiro_apertado',
  'propaganda',
  'amigos_apostando',
  'jogo_passando',
  'tedio',
  'briga_estresse',
  'nada',
];
const CONTEXTOS: Contexto[] = ['casa', 'trabalho', 'rua', 'sozinho', 'acompanhado'];
const FAIXAS: FaixaValor[] = ['ate_50', '50_200', '200_500', 'mais_500'];

const chips = <T extends string>(valores: T[], prefixo: string) =>
  valores.map((v) => ({ valor: v, rotulo: t(`${prefixo}.${v}`) }));

/**
 * Seis perguntas, uma por tela, tudo em toque. A meta e vinte segundos: cada
 * pergunta a mais acelera o abandono, e engajamento e o maior risco do projeto.
 */
export default function Ema() {
  const router = useRouter();
  const { agendadaPara } = useLocalSearchParams<{ agendadaPara?: string }>();
  const salvarEma = useJunto((e) => e.salvarEma);
  const criarIntervencao = useJunto((e) => e.criarIntervencao);
  const planos = useJunto((e) => e.planos);

  const [passo, setPasso] = useState(0);
  const [craving, setCraving] = useState(0);
  const [autoeficacia, setAutoeficacia] = useState(5);
  const [humor, setHumor] = useState<Humor | null>(null);
  const [gatilhos, setGatilhos] = useState<Gatilho[]>([]);
  const [contexto, setContexto] = useState<Contexto[]>([]);
  const [apostou, setApostou] = useState<boolean | null>(null);
  const [salvando, setSalvando] = useState(false);

  const total = apostou ? 7 : 6;

  // `apostouAgora` vem por parametro em vez de sair do estado: quem chama
  // acabou de chamar setApostou, e o valor novo so existe no proximo render.
  const concluir = async (faixa: FaixaValor | null, apostouAgora: boolean) => {
    if (salvando || !humor) return;
    setSalvando(true);

    const resposta: RespostaEma = {
      craving,
      autoeficacia,
      humor,
      gatilhos,
      contexto,
      apostouDesdeUltima: apostouAgora,
      faixaValor: faixa,
    };

    const ema = await salvarEma(resposta);
    const disparo = avaliarDisparo(resposta);

    if (!disparo.dispara) {
      router.back();
      return;
    }

    const plano = escolherPlano(planos, gatilhos);
    const intervencao = await criarIntervencao(disparo.motivo, ema.id, plano?.id ?? null);
    router.replace({ pathname: '/intervencao/[id]', params: { id: intervencao.id } });
  };

  const adiar = async () => {
    // Uma vez so: adiar sem limite vira nunca responder.
    const jaAdiou = await ler<string>(CHAVES.adiada);
    const chave = agendadaPara || new Date().toISOString().slice(0, 13);
    if (jaAdiou !== chave) {
      await gravar(CHAVES.adiada, chave);
      await adiarUmaHora(chave);
    }
    router.back();
  };

  const alternar = <T extends string>(lista: T[], v: T) =>
    lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v];

  return (
    <TelaFixa>
      <Progresso passo={passo} total={total} />

      <View className="flex-1 justify-center gap-8">
        {passo === 0 && (
          <>
            <Pergunta>{t('ema.perguntas.craving')}</Pergunta>
            <Escala
              valor={craving}
              onChange={setCraving}
              rotuloMin={t('ema.escala.craving_min')}
              rotuloMax={t('ema.escala.craving_max')}
              rotuloAcessivel={t('ema.perguntas.craving')}
            />
          </>
        )}

        {passo === 1 && (
          <>
            <Pergunta>{t('ema.perguntas.autoeficacia')}</Pergunta>
            <Escala
              valor={autoeficacia}
              onChange={setAutoeficacia}
              rotuloMin={t('ema.escala.ae_min')}
              rotuloMax={t('ema.escala.ae_max')}
              rotuloAcessivel={t('ema.perguntas.autoeficacia')}
            />
          </>
        )}

        {passo === 2 && (
          <>
            <Pergunta>{t('ema.perguntas.humor')}</Pergunta>
            <Chips
              itens={chips(HUMORES, 'humor')}
              selecionados={humor ? [humor] : []}
              onToggle={(v) => {
                setHumor(v as Humor);
                setPasso(3);
              }}
            />
          </>
        )}

        {passo === 3 && (
          <>
            <Pergunta>{t('ema.perguntas.gatilhos')}</Pergunta>
            <Chips
              itens={chips(GATILHOS, 'gatilho')}
              selecionados={gatilhos}
              onToggle={(v) => setGatilhos((g) => alternar(g, v as Gatilho))}
            />
          </>
        )}

        {passo === 4 && (
          <>
            <Pergunta>{t('ema.perguntas.contexto')}</Pergunta>
            <Chips
              itens={chips(CONTEXTOS, 'contexto')}
              selecionados={contexto}
              onToggle={(v) => setContexto((c) => alternar(c, v as Contexto))}
            />
          </>
        )}

        {passo === 5 && (
          <>
            <Pergunta>{t('ema.perguntas.apostou')}</Pergunta>
            <View className="gap-3">
              <Botao
                titulo={t('ema.nao')}
                variante="secundario"
                onPress={() => {
                  setApostou(false);
                  void concluir(null, false);
                }}
              />
              <Botao
                titulo={t('ema.sim')}
                variante="secundario"
                onPress={() => {
                  setApostou(true);
                  setPasso(6);
                }}
              />
            </View>
          </>
        )}

        {passo === 6 && (
          <>
            <Pergunta>{t('ema.perguntas.faixa')}</Pergunta>
            <Chips
              itens={chips(FAIXAS, 'faixa_valor')}
              selecionados={[]}
              onToggle={(v) => void concluir(v as FaixaValor, true)}
            />
          </>
        )}
      </View>

      <View className="gap-2">
        {passo <= 1 && (
          <Botao titulo={t('comum.continuar')} onPress={() => setPasso(passo + 1)} />
        )}
        {(passo === 3 || passo === 4) && (
          <Botao titulo={t('comum.continuar')} onPress={() => setPasso(passo + 1)} />
        )}
        {passo === 0 && (
          <Botao titulo={t('ema.depois')} variante="discreto" onPress={adiar} />
        )}
        {passo > 0 && passo < 6 && (
          <Botao titulo={t('comum.voltar')} variante="discreto" onPress={() => setPasso(passo - 1)} />
        )}
      </View>
    </TelaFixa>
  );
}
