import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { t } from '@/i18n';

const ICONS = {
  index: 'today-outline',
  plans: 'list-outline',
  progress: 'trending-up-outline',
  help: 'heart-outline',
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1F6F5C',
        tabBarInactiveTintColor: '#5C6E68',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8E5' },
      }}
    >
      {(['index', 'plans', 'progress', 'help'] as const).map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t(`tabs.${name === 'index' ? 'today' : name}`),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={ICONS[name]} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
