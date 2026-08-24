import { Linking, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card, Label } from './base';
import { t } from '@/i18n';

type Resource = {
  key: string;
  urgent: boolean;
  phone?: string;
  url?: string;
};

/**
 * Hardcoded on purpose: this screen has to work with no network, and a phone
 * number that depends on a fetch is a phone number that fails at the worst
 * possible moment.
 *
 * TODO: confirm the official CAPS and Gamblers Anonymous URLs before going
 * public. Until then they are searches, which degrade better than a dead link.
 */
const RESOURCES: Resource[] = [
  { key: 'cvv', urgent: true, phone: '188', url: 'https://cvv.org.br' },
  { key: 'samu', urgent: true, phone: '192' },
  {
    key: 'caps',
    urgent: true,
    url: 'https://www.google.com/maps/search/CAPS+AD+perto+de+mim',
  },
  { key: 'selfexclusion', urgent: false, url: 'https://www.gov.br/autoexclusaoapostas' },
  {
    key: 'ga',
    urgent: false,
    url: 'https://www.google.com/search?q=Jogadores+An%C3%B4nimos+Brasil',
  },
];

export function Resources({ urgentOnly = false }: { urgentOnly?: boolean }) {
  const list = urgentOnly ? RESOURCES.filter((r) => r.urgent) : RESOURCES;

  return (
    <View className="gap-3">
      {list.map((r) => (
        <Card key={r.key} className="flex-row items-center justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-lg font-semibold text-ink">{t(`help.${r.key}_name`)}</Text>
            <Label>{t(`help.${r.key}_desc`)}</Label>
          </View>

          {r.phone && (
            <Action
              icon="call-outline"
              label={t('help.call')}
              onPress={() => Linking.openURL(`tel:${r.phone}`)}
            />
          )}
          {r.url && (
            <Action
              icon="open-outline"
              label={t('help.open')}
              onPress={() => Linking.openURL(r.url!)}
            />
          )}
        </Card>
      ))}
    </View>
  );
}

const Action = ({
  icon,
  label,
  onPress,
}: {
  icon: 'call-outline' | 'open-outline';
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    className="h-12 w-12 items-center justify-center rounded-full bg-junto-light active:opacity-70"
  >
    <Ionicons name={icon} size={20} color="#175647" />
  </Pressable>
);
