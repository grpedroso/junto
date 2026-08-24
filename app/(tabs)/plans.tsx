import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Body, Button, Card, Chips, Heading, Label, Screen } from '@/components/base';
import { LIBRARY } from '@/domain/plans';
import type { Plan, PlanCategory } from '@/domain/types';
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

export default function Plans() {
  const plans = useJunto((s) => s.plans);
  const createPlan = useJunto((s) => s.createPlan);
  const editPlan = useJunto((s) => s.editPlan);
  const deletePlan = useJunto((s) => s.deletePlan);
  const adoptTemplate = useJunto((s) => s.adoptTemplate);
  const [editing, setEditing] = useState<Plan | 'new' | null>(null);

  const adopted = new Set(plans.map((p) => `${p.condition}|${p.action}`));
  const suggestions = LIBRARY.filter((template) => {
    const text = ptBR.plans.library[template.id as keyof typeof ptBR.plans.library];
    return !adopted.has(`${text.condition}|${text.action}`);
  });

  if (editing) {
    return (
      <Editor
        plan={editing === 'new' ? null : editing}
        onCancel={() => setEditing(null)}
        onSave={async (fields) => {
          if (editing === 'new') await createPlan({ ...fields, triggers: [] });
          else await editPlan(editing.id, fields);
          setEditing(null);
        }}
      />
    );
  }

  return (
    <Screen>
      <Heading className="py-2">{t('plans.title')}</Heading>

      {plans.length === 0 && <Body>{t('plans.empty')}</Body>}

      {plans.map((p) => (
        <Card key={p.id} className="gap-3">
          <Text className="text-base text-ink">
            Quando <Text className="font-semibold">{p.condition}</Text>, eu vou{' '}
            <Text className="font-semibold">{p.action}</Text>.
          </Text>
          <View className="flex-row items-center justify-between">
            <Label>
              {p.timesShown === 0
                ? t('plans.never_used')
                : t('plans.worked_n_times', { n: p.timesWorked, total: p.timesShown })}
            </Label>
            <View className="flex-row gap-4">
              <TextLink label={t('plans.edit')} onPress={() => setEditing(p)} />
              <TextLink
                label={t('plans.delete')}
                onPress={() =>
                  Alert.alert(t('plans.delete_confirm'), undefined, [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('plans.delete'), onPress: () => void deletePlan(p.id) },
                  ])
                }
              />
            </View>
          </View>
        </Card>
      ))}

      <Button label={t('plans.new')} onPress={() => setEditing('new')} />

      {suggestions.length > 0 && (
        <View className="gap-2 pt-4">
          <Heading className="text-lg">{t('plans.suggestions')}</Heading>
          {suggestions.map((template) => {
            const text = ptBR.plans.library[template.id as keyof typeof ptBR.plans.library];
            return (
              <Pressable
                key={template.id}
                accessibilityRole="button"
                onPress={() => void adoptTemplate(template.id)}
                className="rounded-2xl border border-line bg-surface p-4 active:opacity-70"
              >
                <Text className="text-base text-ink">
                  Quando {text.condition}, eu vou {text.action}.
                </Text>
                <Label className="pt-1 text-junto">{t('plans.adopt')}</Label>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const TextLink = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-60">
    <Text className="text-sm font-semibold text-junto">{label}</Text>
  </Pressable>
);

type EditableFields = { condition: string; action: string; category: PlanCategory };

function Editor({
  plan,
  onSave,
  onCancel,
}: {
  plan: Plan | null;
  onSave: (fields: EditableFields) => void;
  onCancel: () => void;
}) {
  const [condition, setCondition] = useState(plan?.condition ?? '');
  const [action, setAction] = useState(plan?.action ?? '');
  const [category, setCategory] = useState<PlanCategory>(plan?.category ?? 'substitution');

  const valid = condition.trim().length > 0 && action.trim().length > 0;

  return (
    <Screen>
      <Heading className="py-2">{plan ? t('plans.edit') : t('plans.new')}</Heading>

      <View className="gap-2">
        <Label>{t('plans.condition_label')}</Label>
        <TextInput
          value={condition}
          onChangeText={setCondition}
          placeholder={t('plans.condition_hint')}
          placeholderTextColor="#8FA39D"
          multiline
          className="min-h-14 rounded-2xl border border-line bg-surface px-4 py-3 text-base text-ink"
        />
      </View>

      <View className="gap-2">
        <Label>{t('plans.action_label')}</Label>
        <TextInput
          value={action}
          onChangeText={setAction}
          placeholder={t('plans.action_hint')}
          placeholderTextColor="#8FA39D"
          multiline
          className="min-h-14 rounded-2xl border border-line bg-surface px-4 py-3 text-base text-ink"
        />
      </View>

      <Chips
        items={CATEGORIES.map((c) => ({ value: c, label: t(`plans.category.${c}`) }))}
        selected={[category]}
        onToggle={(v) => setCategory(v as PlanCategory)}
      />

      <Button
        label={t('common.save')}
        disabled={!valid}
        onPress={() => onSave({ condition: condition.trim(), action: action.trim(), category })}
      />
      <Button label={t('common.cancel')} variant="quiet" onPress={onCancel} />
    </Screen>
  );
}
