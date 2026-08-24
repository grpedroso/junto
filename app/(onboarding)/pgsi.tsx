import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Card, Heading, Screen } from '@/components/base';
import { PgsiQuestionnaire, PgsiResult } from '@/components/PgsiQuestionnaire';
import { pgsiBand } from '@/domain/scoring';
import { useJunto } from '@/state/useJunto';
import { t } from '@/i18n';

export default function OnboardingPgsi() {
  const router = useRouter();
  const recordPgsi = useJunto((s) => s.recordPgsi);
  const [phase, setPhase] = useState<'intro' | 'questions' | 'result'>('intro');
  const [score, setScore] = useState(0);

  const next = () => router.push('/(onboarding)/permissions');

  if (phase === 'intro') {
    return (
      <Screen>
        <View className="flex-1 justify-center gap-4 py-16">
          <Heading className="text-3xl">{t('pgsi.title')}</Heading>
          <Card>
            <Body>{t('pgsi.intro')}</Body>
          </Card>
        </View>
        <Button label={t('common.continue')} onPress={() => setPhase('questions')} />
        <Button label={t('common.skip')} variant="quiet" onPress={next} />
      </Screen>
    );
  }

  if (phase === 'questions') {
    return (
      <PgsiQuestionnaire
        onSkip={next}
        onFinish={async (value) => {
          setScore(value);
          await recordPgsi(value);
          setPhase('result');
        }}
      />
    );
  }

  return (
    <PgsiResult
      score={score}
      band={pgsiBand(score)}
      onClose={next}
      buttonLabel={t('common.continue')}
    />
  );
}
