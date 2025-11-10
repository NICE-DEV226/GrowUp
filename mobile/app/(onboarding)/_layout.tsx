import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="slide1" options={{ headerShown: false }} />
      <Stack.Screen name="slide2" options={{ headerShown: false }} />
      <Stack.Screen name="slide3" options={{ headerShown: false }} />
    </Stack>
  );
}
