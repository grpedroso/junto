import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Heading, Screen, Steps } from '@/components/base';
import { t } from '@/i18n';

const SLIDES = [
  { title: 'onboarding.welcome_title', text: 'onboarding.welcome_text' },
  { title: 'onboarding.what_it_is_title', text: 'onboarding.what_it_is_text' },
  { title: 'onboarding.privacy_title', text: 'onboarding.privacy_text' },
];

export default function Intro() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const current = SLIDES[step];

  const advance = () =>
    step === SLIDES.length - 1 ? router.push('/(onboarding)/goal') : setStep(step + 1);

  return (
    <Screen>
      <Steps step={step} total={SLIDES.length} />
      <View className="flex-1 justify-center gap-4 py-16">
        <Heading className="text-4xl">{t(current.title)}</Heading>
        <Body className="text-lg">{t(current.text)}</Body>
      </View>
      <Button label={t('common.continue')} onPress={advance} />
    </Screen>
  );
}
