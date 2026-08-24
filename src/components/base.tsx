import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ChildrenOnly = { children: ReactNode; className?: string };

export function Screen({ children, className = '' }: ChildrenOnly) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerClassName={`px-5 pt-4 pb-10 gap-4 ${className}`}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/** No scroll: for the EMA and the intervention, where scrolling is friction. */
export function FixedScreen({ children, className = '' }: ChildrenOnly) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={['top', 'bottom']}>
      <View className={`flex-1 px-5 pt-4 pb-6 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}

export const Heading = ({ children, className = '' }: ChildrenOnly) => (
  <Text className={`text-2xl font-bold text-tinta ${className}`}>{children}</Text>
);

export const Question = ({ children, className = '' }: ChildrenOnly) => (
  <Text className={`text-pergunta font-semibold text-tinta ${className}`}>{children}</Text>
);

export const Body = ({ children, className = '' }: ChildrenOnly) => (
  <Text className={`text-base leading-6 text-tinta-suave ${className}`}>{children}</Text>
);

export const Label = ({ children, className = '' }: ChildrenOnly) => (
  <Text className={`text-sm text-tinta-suave ${className}`}>{children}</Text>
);

export const Card = ({ children, className = '' }: ChildrenOnly) => (
  <View className={`rounded-2xl border border-borda bg-superficie p-4 ${className}`}>
    {children}
  </View>
);

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
  disabled?: boolean;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  className = '',
}: ButtonProps) {
  const background = {
    primary: 'bg-junto',
    secondary: 'bg-junto-claro',
    quiet: 'bg-transparent',
  }[variant];

  const color = {
    primary: 'text-white',
    secondary: 'text-junto-escuro',
    quiet: 'text-tinta-suave',
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-14 items-center justify-center rounded-2xl px-5 ${background} ${
        disabled ? 'opacity-40' : 'active:opacity-70'
      } ${className}`}
    >
      <Text className={`text-base font-semibold ${color}`}>{label}</Text>
    </Pressable>
  );
}

type ChipItem = { value: string; label: string };

type ChipsProps = {
  items: ChipItem[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
};

/** Multiple choice by tapping. Zero typing -- the EMA has to fit in 20 seconds. */
export function Chips({ items, selected, onToggle, className = '' }: ChipsProps) {
  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const on = selected.includes(item.value);
        return (
          <Pressable
            key={item.value}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            onPress={() => onToggle(item.value)}
            className={`min-h-12 justify-center rounded-full border px-4 ${
              on ? 'border-junto bg-junto-claro' : 'border-borda bg-superficie'
            }`}
          >
            <Text className={on ? 'font-semibold text-junto-escuro' : 'text-tinta'}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Steps({ step, total }: { step: number; total: number }) {
  return (
    <View className="h-1 flex-row gap-1">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-junto' : 'bg-borda'}`}
        />
      ))}
    </View>
  );
}
