import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Tela, Texto, Titulo } from '@/components/base';
import { BIBLIOTECA, MINIMO_DE_PLANOS } from '@/domain/plans';
import type { CategoriaPlano } from '@/domain/tipos';
import { useJunto } from '@/estado/useJunto';
import ptBR from '@/i18n/pt-BR';
import { t } from '@/i18n';

const CATEGORIAS: CategoriaPlano[] = [
  'substituicao',
  'social',
  'fisico',
  'cognitivo',
  'ambiental',
];

export default function EscolherPlanos() {
  const router = useRouter();
  const adotarModelo = useJunto((e) => e.adotarModelo);
  const [escolhidos, setEscolhidos] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  const alternar = (id: string) =>
    setEscolhidos((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );

  const seguir = async () => {
    setSalvando(true);
    for (const id of escolhidos) await adotarModelo(id);
    router.push('/(onboarding)/pgsi');
  };

  const faltam = MINIMO_DE_PLANOS - escolhidos.length;

  return (
    <Tela>
      <View className="gap-2 py-6">
        <Titulo className="text-3xl">{t('onboarding.planos_titulo')}</Titulo>
        <Texto>{t('onboarding.planos_texto')}</Texto>
      </View>

      {CATEGORIAS.map((categoria) => (
        <View key={categoria} className="gap-2">
          <Text className="text-sm font-semibold uppercase text-tinta-suave">
            {t(`planos.categoria.${categoria}`)}
          </Text>
          {BIBLIOTECA.filter((m) => m.categoria === categoria).map((modelo) => {
            const texto = ptBR.planos.biblioteca[modelo.id as keyof typeof ptBR.planos.biblioteca];
            const ativo = escolhidos.includes(modelo.id);
            return (
              <Pressable
                key={modelo.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ativo }}
                onPress={() => alternar(modelo.id)}
                className={`rounded-2xl border p-4 active:opacity-70 ${
                  ativo ? 'border-junto bg-junto-claro' : 'border-borda bg-superficie'
                }`}
              >
                <Text className="text-base text-tinta">
                  Quando <Text className="font-semibold">{texto.condicao}</Text>, eu vou{' '}
                  <Text className="font-semibold">{texto.acao}</Text>.
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <View className="gap-2 pt-4">
        {faltam > 0 && <Texto>{t('onboarding.planos_faltando')}</Texto>}
        <Botao
          titulo={t('comum.continuar')}
          onPress={seguir}
          desabilitado={faltam > 0 || salvando}
        />
      </View>
    </Tela>
  );
}
