import { Stack } from 'expo-router';

export default function LayoutOnboarding() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
