import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ 
        headerShown: false, 
        animation: 'fade',
        animationDuration: 300,
      }}>
        <Stack.Screen 
          name="splash" 
          options={{ 
            animation: 'fade',
            animationDuration: 500,
          }} 
        />
        <Stack.Screen 
          name="(onboarding)" 
          options={{ 
            animation: 'slide_from_right',
            animationDuration: 400,
          }} 
        />
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            animation: 'slide_from_bottom',
            animationDuration: 350,
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            animation: 'fade',
            animationDuration: 400,
          }} 
        />
        <Stack.Screen name="index" />
      </Stack>
    </PaperProvider>
  );
}
