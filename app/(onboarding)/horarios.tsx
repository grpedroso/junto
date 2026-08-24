import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Botao, Cartao, Tela, Texto, Titulo } from '@/components/base';
import { HORARIOS_PADRAO, type Horario } from '@/domain/ema';
import { useJunto } from '@/estado/useJunto';
import { t } from '@/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

export default function EscolherHorarios() {
  const router = useRouter();
  const definirHorarios = useJunto((e) => e.definirHorarios);
  const [horarios, setHorarios] = useState<Horario[]>([...HORARIOS_PADRAO]);

  const mover = (i: number, delta: number) =>
    setHorarios((atual) =>
      atual.map((h, j) => (j === i ? { ...h, hora: (h.hora + delta + 24) % 24 } : h))
    );

  const seguir = async () => {
    await definirHorarios(horarios);
    router.push('/(onboarding)/planos');
  };

  return (
    <Tela>
      <View className="gap-2 py-8">
        <Titulo className="text-3xl">{t('onboarding.horarios_titulo')}</Titulo>
        <Texto>{t('onboarding.horarios_texto')}</Texto>
      </View>

      <View className="flex-1 gap-3">
        {horarios.map((h, i) => (
          <Cartao key={i} className="flex-row items-center justify-between">
            <Ajuste rotulo="−" onPress={() => mover(i, -1)} />
            <Text className="text-3xl font-bold text-tinta">
              {pad(h.hora)}:{pad(h.minuto)}
            </Text>
            <Ajuste rotulo="+" onPress={() => mover(i, 1)} />
          </Cartao>
        ))}
      </View>

      <Botao titulo={t('comum.continuar')} onPress={seguir} />
    </Tela>
  );
}

const Ajuste = ({ rotulo, onPress }: { rotulo: string; onPress: () => void }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className="h-12 w-12 items-center justify-center rounded-full bg-junto-claro active:opacity-70"
  >
    <Text className="text-2xl font-bold text-junto-escuro">{rotulo}</Text>
  </Pressable>
);
