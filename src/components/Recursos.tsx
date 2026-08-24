import { Linking, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Cartao, Rotulo } from './base';
import { t } from '@/i18n';

type Recurso = {
  chave: string;
  urgente: boolean;
  telefone?: string;
  url?: string;
};

/**
 * Fixos no codigo de proposito: esta tela precisa funcionar sem rede, e um
 * telefone que depende de fetch e um telefone que falha na hora errada.
 *
 * TODO: confirmar as URLs oficiais do CAPS e do Jogadores Anonimos antes de
 * publicar. Ate la sao buscas, que degradam melhor do que um link quebrado.
 */
const RECURSOS: Recurso[] = [
  { chave: 'cvv', urgente: true, telefone: '188', url: 'https://cvv.org.br' },
  { chave: 'samu', urgente: true, telefone: '192' },
  {
    chave: 'caps',
    urgente: true,
    url: 'https://www.google.com/maps/search/CAPS+AD+perto+de+mim',
  },
  { chave: 'autoexclusao', urgente: false, url: 'https://www.gov.br/autoexclusaoapostas' },
  {
    chave: 'ja',
    urgente: false,
    url: 'https://www.google.com/search?q=Jogadores+An%C3%B4nimos+Brasil',
  },
];

export function Recursos({ apenasUrgentes = false }: { apenasUrgentes?: boolean }) {
  const lista = apenasUrgentes ? RECURSOS.filter((r) => r.urgente) : RECURSOS;

  return (
    <View className="gap-3">
      {lista.map((r) => (
        <Cartao key={r.chave} className="flex-row items-center justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-lg font-semibold text-tinta">{t(`ajuda.${r.chave}_nome`)}</Text>
            <Rotulo>{t(`ajuda.${r.chave}_desc`)}</Rotulo>
          </View>

          {r.telefone && (
            <Acao
              icone="call-outline"
              rotulo={t('ajuda.ligar')}
              onPress={() => Linking.openURL(`tel:${r.telefone}`)}
            />
          )}
          {r.url && (
            <Acao
              icone="open-outline"
              rotulo={t('ajuda.abrir')}
              onPress={() => Linking.openURL(r.url!)}
            />
          )}
        </Cartao>
      ))}
    </View>
  );
}

const Acao = ({
  icone,
  rotulo,
  onPress,
}: {
  icone: 'call-outline' | 'open-outline';
  rotulo: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={rotulo}
    onPress={onPress}
    className="h-12 w-12 items-center justify-center rounded-full bg-junto-claro active:opacity-70"
  >
    <Ionicons name={icone} size={20} color="#175647" />
  </Pressable>
);
