import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Heading, Screen } from '@/components/base';
import { LIBRARY, MINIMUM_PLANS } from '@/domain/plans';
import type { PlanCategory } from '@/domain/types';
import { useJunto } from '@/state/useJunto';
import ptBR from '@/i18n/pt-BR';
import { t } from '@/i18n';

const CATEGORIES: PlanCategory[] = [
  'substitution',
  'social',
  'physical',
  'cognitive',
  'environmental',
];

export default function ChoosePlans() {
  const router = useRouter();
  const adoptTemplate = useJunto((s) => s.adoptTemplate);
  const [chosen, setChosen] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setChosen((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );

  const next = async () => {
    setSaving(true);
    for (const id of chosen) await adoptTemplate(id);
    router.push('/(onboarding)/pgsi');
  };

  const missing = MINIMUM_PLANS - chosen.length;

  return (
    <Screen>
      <View className="gap-2 py-6">
        <Heading className="text-3xl">{t('onboarding.plans_title')}</Heading>
        <Body>{t('onboarding.plans_text')}</Body>
      </View>

      {CATEGORIES.map((category) => (
        <View key={category} className="gap-2">
          <Text className="text-sm font-semibold uppercase text-tinta-suave">
            {t(`plans.category.${category}`)}
          </Text>
          {LIBRARY.filter((template) => template.category === category).map((template) => {
            const text = ptBR.plans.library[template.id as keyof typeof ptBR.plans.library];
            const on = chosen.includes(template.id);
            return (
              <Pressable
                key={template.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => toggle(template.id)}
                className={`rounded-2xl border p-4 active:opacity-70 ${
                  on ? 'border-junto bg-junto-claro' : 'border-borda bg-superficie'
                }`}
              >
                <Text className="text-base text-tinta">
                  Quando <Text className="font-semibold">{text.condition}</Text>, eu vou{' '}
                  <Text className="font-semibold">{text.action}</Text>.
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <View className="gap-2 pt-4">
        {missing > 0 && <Body>{t('onboarding.plans_missing')}</Body>}
        <Button
          label={t('common.continue')}
          onPress={next}
          disabled={missing > 0 || saving}
        />
      </View>
    </Screen>
  );
}
