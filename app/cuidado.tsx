import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Cartao, TelaFixa, Texto, Titulo } from '@/components/base';
import { Recursos } from '@/components/Recursos';
import { t } from '@/i18n';

/**
 * Tela de cuidado. Regras que nao se quebram (secao 9.1 do plano de projeto):
 *
 *   - nao faz triagem de risco suicida -- oferece rota para ajuda, so isso
 *   - nenhum alarme visual: nada de vermelho, nada de icone de perigo
 *   - nao bloqueia o app e nao forca acao nenhuma
 *   - nenhuma mencao a metodo de autolesao, em nenhuma forma
 *
 * Qualquer alteracao de texto aqui exige revisao clinica. Ver CONTRIBUTING.md.
 */
export default function Cuidado() {
  const router = useRouter();

  return (
    <TelaFixa>
      <View className="flex-1 justify-center gap-4">
        <Titulo className="text-3xl">{t('cuidado.titulo')}</Titulo>
        <Cartao className="bg-calma-clara">
          <Texto className="text-lg text-tinta">{t('cuidado.texto')}</Texto>
        </Cartao>
        <Recursos apenasUrgentes />
        <Texto className="text-center">{t('cuidado.lembrete')}</Texto>
      </View>
      <Botao titulo={t('cuidado.fechar')} variante="secundario" onPress={() => router.back()} />
    </TelaFixa>
  );
}
