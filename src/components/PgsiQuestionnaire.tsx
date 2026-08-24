import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Card, Heading, Label, Screen, Steps } from './base';
import { PGSI_ITEMS, PGSI_OPTIONS, scorePgsi, type PgsiAnswers } from '@/domain/scoring';
import ptBR from '@/i18n/pt-BR';
import { t } from '@/i18n';

type Props = {
  onFinish: (score: number) => void;
  onSkip?: () => void;
};

/**
 * One item per screen. Nine questions in a scrollable list become a wall of
 * text -- and the person is answering about the worst year of their life.
 */
export function PgsiQuestionnaire({ onFinish, onSkip }: Props) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Partial<PgsiAnswers>>({});

  const item = PGSI_ITEMS[i];

  const answer = (value: number) => {
    const updated = { ...answers, [item]: value };
    setAnswers(updated);

    if (i < PGSI_ITEMS.length - 1) {
      setI(i + 1);
      return;
    }
    onFinish(scorePgsi(updated as PgsiAnswers));
  };

  return (
    <Screen>
      <Steps step={i} total={PGSI_ITEMS.length} />

      <View className="gap-2 py-6">
        <Label>{t('pgsi.reference')}</Label>
        <Heading className="text-2xl">{ptBR.pgsi.items[item]}</Heading>
      </View>

      <View className="gap-2">
        {PGSI_OPTIONS.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: answers[item] === value }}
            onPress={() => answer(value)}
            className="min-h-14 justify-center rounded-2xl border border-line bg-surface px-4 active:opacity-70"
          >
            <Text className="text-base text-ink">{ptBR.pgsi.options[value]}</Text>
          </Pressable>
        ))}
      </View>

      {i > 0 && <Button label={t('common.back')} variant="quiet" onPress={() => setI(i - 1)} />}
      {onSkip && i === 0 && (
        <Button label={t('common.skip')} variant="quiet" onPress={onSkip} />
      )}
    </Screen>
  );
}

export function PgsiResult({
  score,
  band,
  onClose,
  buttonLabel,
}: {
  score: number;
  band: string;
  onClose: () => void;
  buttonLabel: string;
}) {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-4 py-16">
        <Text className="text-center text-6xl font-bold text-junto">{score}</Text>
        <Heading className="text-center text-2xl">
          {t('pgsi.result', { band: t(`pgsi.band.${band}`) })}
        </Heading>
        <Card>
          <Body>{t('pgsi.result_note')}</Body>
        </Card>
      </View>
      <Button label={buttonLabel} onPress={onClose} />
    </Screen>
  );
}
