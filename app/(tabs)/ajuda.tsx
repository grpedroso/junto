import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Cartao, Tela, Texto, Titulo } from '@/components/base';
import { Recursos } from '@/components/Recursos';
import { t } from '@/i18n';

export default function Ajuda() {
  const router = useRouter();

  return (
    <Tela>
      <Titulo className="py-2">{t('ajuda.titulo')}</Titulo>

      <Botao titulo={t('ajuda.precisa_agora')} onPress={() => router.push('/cuidado')} />

      <Recursos />

      <View className="gap-2 pt-4">
        <Titulo className="text-lg">{t('ajuda.bloqueadores_titulo')}</Titulo>
        <Cartao>
          <Texto>{t('ajuda.bloqueadores_desc')}</Texto>
        </Cartao>
      </View>
    </Tela>
  );
}
