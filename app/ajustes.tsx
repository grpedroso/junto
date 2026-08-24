import { useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Botao, Cartao, Rotulo, Tela, Titulo } from '@/components/base';
import { useJunto } from '@/estado/useJunto';
import { apagarMeusDados } from '@/lib/sessao';
import { cancelarEmas } from '@/lib/notifications';
import { t } from '@/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Ajustes() {
  const router = useRouter();
  const perfil = useJunto((e) => e.perfil);
  const [apagando, setApagando] = useState(false);

  const apagar = () =>
    Alert.alert(t('ajustes.apagar_dados'), t('ajustes.apagar_confirma'), [
      { text: t('comum.cancelar'), style: 'cancel' },
      {
        text: t('ajustes.apagar_dados'),
        style: 'destructive',
        onPress: async () => {
          setApagando(true);
          try {
            await cancelarEmas();
            await apagarMeusDados();
            Alert.alert(t('ajustes.apagar_feito'));
            router.replace('/(onboarding)');
          } catch (e) {
            Alert.alert(t('erros.generico'), String(e));
          } finally {
            setApagando(false);
          }
        },
      },
    ]);

  return (
    <Tela>
      <View className="flex-row items-center gap-2 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('comum.voltar')}
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center active:opacity-60"
        >
          <Ionicons name="chevron-back" size={24} color="#16211E" />
        </Pressable>
        <Titulo>{t('ajustes.titulo')}</Titulo>
      </View>

      <Cartao className="gap-1">
        <Rotulo>{t('ajustes.horarios')}</Rotulo>
        <Text className="text-lg text-tinta">
          {perfil?.horarios.map((h) => `${pad(h.hora)}:${pad(h.minuto)}`).join('  ·  ')}
        </Text>
      </Cartao>

      <Botao
        variante="secundario"
        titulo={t('ajustes.privacidade')}
        onPress={() => Linking.openURL('https://github.com/grpedroso/junto/blob/main/PRIVACY.md')}
      />

      <Botao
        variante="discreto"
        titulo={t('ajustes.apagar_dados')}
        desabilitado={apagando}
        onPress={apagar}
      />
    </Tela>
  );
}
