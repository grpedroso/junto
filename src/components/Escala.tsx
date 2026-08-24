import Slider from '@react-native-community/slider';
import { Text, View } from 'react-native';
import { ESCALA } from '@/domain/ema';

type Props = {
  valor: number;
  onChange: (v: number) => void;
  rotuloMin: string;
  rotuloMax: string;
  rotuloAcessivel?: string;
};

/**
 * Escala 0-10 das duas perguntas que disparam a intervencao. O numero fica
 * grande porque e a unica confirmacao visual de que o arraste pegou.
 */
export function Escala({ valor, onChange, rotuloMin, rotuloMax, rotuloAcessivel }: Props) {
  return (
    <View className="gap-2">
      <Text className="text-center text-6xl font-bold text-junto">{valor}</Text>
      <Slider
        accessibilityLabel={rotuloAcessivel}
        minimumValue={ESCALA.min}
        maximumValue={ESCALA.max}
        step={1}
        value={valor}
        onValueChange={onChange}
        minimumTrackTintColor="#1F6F5C"
        maximumTrackTintColor="#E2E8E5"
        thumbTintColor="#1F6F5C"
        style={{ height: 48 }}
      />
      <View className="flex-row justify-between">
        <Text className="text-sm text-tinta-suave">{rotuloMin}</Text>
        <Text className="text-sm text-tinta-suave">{rotuloMax}</Text>
      </View>
    </View>
  );
}
