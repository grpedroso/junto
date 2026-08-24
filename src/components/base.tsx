import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilhosSo = { children: ReactNode; className?: string };

export function Tela({ children, className = '' }: FilhosSo) {
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

/** Sem scroll: para a EMA e a intervencao, onde rolagem vira atrito. */
export function TelaFixa({ children, className = '' }: FilhosSo) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={['top', 'bottom']}>
      <View className={`flex-1 px-5 pt-4 pb-6 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}

export const Titulo = ({ children, className = '' }: FilhosSo) => (
  <Text className={`text-2xl font-bold text-tinta ${className}`}>{children}</Text>
);

export const Pergunta = ({ children, className = '' }: FilhosSo) => (
  <Text className={`text-pergunta font-semibold text-tinta ${className}`}>{children}</Text>
);

export const Texto = ({ children, className = '' }: FilhosSo) => (
  <Text className={`text-base leading-6 text-tinta-suave ${className}`}>{children}</Text>
);

export const Rotulo = ({ children, className = '' }: FilhosSo) => (
  <Text className={`text-sm text-tinta-suave ${className}`}>{children}</Text>
);

export const Cartao = ({ children, className = '' }: FilhosSo) => (
  <View className={`rounded-2xl border border-borda bg-superficie p-4 ${className}`}>
    {children}
  </View>
);

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'discreto';
  desabilitado?: boolean;
  className?: string;
};

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  desabilitado = false,
  className = '',
}: BotaoProps) {
  const fundo = {
    primario: 'bg-junto',
    secundario: 'bg-junto-claro',
    discreto: 'bg-transparent',
  }[variante];

  const cor = {
    primario: 'text-white',
    secundario: 'text-junto-escuro',
    discreto: 'text-tinta-suave',
  }[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={onPress}
      className={`min-h-14 items-center justify-center rounded-2xl px-5 ${fundo} ${
        desabilitado ? 'opacity-40' : 'active:opacity-70'
      } ${className}`}
    >
      <Text className={`text-base font-semibold ${cor}`}>{titulo}</Text>
    </Pressable>
  );
}

type ItemChip = { valor: string; rotulo: string };

type ChipsProps = {
  itens: ItemChip[];
  selecionados: string[];
  onToggle: (valor: string) => void;
  className?: string;
};

/** Multipla escolha em toque. Zero digitacao -- a EMA precisa caber em 20s. */
export function Chips({ itens, selecionados, onToggle, className = '' }: ChipsProps) {
  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {itens.map((item) => {
        const ativo = selecionados.includes(item.valor);
        return (
          <Pressable
            key={item.valor}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: ativo }}
            onPress={() => onToggle(item.valor)}
            className={`min-h-12 justify-center rounded-full border px-4 ${
              ativo ? 'border-junto bg-junto-claro' : 'border-borda bg-superficie'
            }`}
          >
            <Text className={ativo ? 'font-semibold text-junto-escuro' : 'text-tinta'}>
              {item.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Progresso({ passo, total }: { passo: number; total: number }) {
  return (
    <View className="h-1 flex-row gap-1">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={`h-1 flex-1 rounded-full ${i <= passo ? 'bg-junto' : 'bg-borda'}`}
        />
      ))}
    </View>
  );
}
