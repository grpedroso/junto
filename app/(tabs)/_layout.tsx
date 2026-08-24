import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { t } from '@/i18n';

const ICONES = {
  index: 'today-outline',
  planos: 'list-outline',
  progresso: 'trending-up-outline',
  ajuda: 'heart-outline',
} as const;

export default function LayoutAbas() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1F6F5C',
        tabBarInactiveTintColor: '#5C6E68',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8E5' },
      }}
    >
      {(['index', 'planos', 'progresso', 'ajuda'] as const).map((nome) => (
        <Tabs.Screen
          key={nome}
          name={nome}
          options={{
            title: t(`abas.${nome === 'index' ? 'hoje' : nome}`),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={ICONES[nome]} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
