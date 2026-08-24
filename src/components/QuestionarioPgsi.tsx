import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Botao, Cartao, Progresso, Rotulo, Tela, Texto, Titulo } from './base';
import {
  calcularPgsi,
  PGSI_ITENS,
  PGSI_OPCOES,
  type RespostasPgsi,
} from '@/domain/scoring';
import ptBR from '@/i18n/pt-BR';
import { t } from '@/i18n';

type Props = {
  onConcluir: (escore: number) => void;
  onPular?: () => void;
};

/**
 * Um item por tela. Nove perguntas numa lista rolavel viram parede de texto --
 * e a pessoa esta respondendo sobre o pior ano da vida dela.
 */
export function QuestionarioPgsi({ onConcluir, onPular }: Props) {
  const [i, setI] = useState(0);
  const [respostas, setRespostas] = useState<Partial<RespostasPgsi>>({});

  const item = PGSI_ITENS[i];

  const responder = (valor: number) => {
    const atualizadas = { ...respostas, [item]: valor };
    setRespostas(atualizadas);

    if (i < PGSI_ITENS.length - 1) {
      setI(i + 1);
      return;
    }
    onConcluir(calcularPgsi(atualizadas as RespostasPgsi));
  };

  return (
    <Tela>
      <Progresso passo={i} total={PGSI_ITENS.length} />

      <View className="gap-2 py-6">
        <Rotulo>{t('pgsi.referencia')}</Rotulo>
        <Titulo className="text-2xl">{ptBR.pgsi.itens[item]}</Titulo>
      </View>

      <View className="gap-2">
        {PGSI_OPCOES.map((valor) => (
          <Pressable
            key={valor}
            accessibilityRole="radio"
            accessibilityState={{ checked: respostas[item] === valor }}
            onPress={() => responder(valor)}
            className="min-h-14 justify-center rounded-2xl border border-borda bg-superficie px-4 active:opacity-70"
          >
            <Text className="text-base text-tinta">{ptBR.pgsi.opcoes[valor]}</Text>
          </Pressable>
        ))}
      </View>

      {i > 0 && (
        <Botao titulo={t('comum.voltar')} variante="discreto" onPress={() => setI(i - 1)} />
      )}
      {onPular && i === 0 && (
        <Botao titulo={t('comum.pular')} variante="discreto" onPress={onPular} />
      )}
    </Tela>
  );
}

export function ResultadoPgsi({
  escore,
  faixa,
  onFechar,
  rotuloBotao,
}: {
  escore: number;
  faixa: string;
  onFechar: () => void;
  rotuloBotao: string;
}) {
  return (
    <Tela>
      <View className="flex-1 justify-center gap-4 py-16">
        <Text className="text-center text-6xl font-bold text-junto">{escore}</Text>
        <Titulo className="text-center text-2xl">
          {t('pgsi.resultado', { faixa: t(`pgsi.faixa.${faixa}`) })}
        </Titulo>
        <Cartao>
          <Texto>{t('pgsi.resultado_nota')}</Texto>
        </Cartao>
      </View>
      <Botao titulo={rotuloBotao} onPress={onFechar} />
    </Tela>
  );
}
