import Slider from '@react-native-community/slider';
import { Text, View } from 'react-native';
import { SCALE } from '@/domain/ema';

type Props = {
  value: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
  accessibilityLabel?: string;
};

/**
 * The 0-10 scale for the two questions that fire the intervention. The number
 * is large because it is the only visual confirmation that the drag registered.
 */
export function Scale({ value, onChange, minLabel, maxLabel, accessibilityLabel }: Props) {
  return (
    <View className="gap-2">
      <Text className="text-center text-6xl font-bold text-junto">{value}</Text>
      <Slider
        accessibilityLabel={accessibilityLabel}
        minimumValue={SCALE.min}
        maximumValue={SCALE.max}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#1F6F5C"
        maximumTrackTintColor="#E2E8E5"
        thumbTintColor="#1F6F5C"
        style={{ height: 48 }}
      />
      <View className="flex-row justify-between">
        <Text className="text-sm text-ink-soft">{minLabel}</Text>
        <Text className="text-sm text-ink-soft">{maxLabel}</Text>
      </View>
    </View>
  );
}
