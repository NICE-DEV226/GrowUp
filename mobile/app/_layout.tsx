import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';
import { useI18n } from '../src/i18n';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const initializeI18n = useI18n((state) => state.initialize);

  useEffect(() => {
    // Initialiser les stores au démarrage de l'app
    const init = async () => {
      await initializeI18n(); // Initialiser i18n en premier
      await initialize();     // Puis authStore qui synchronisera avec i18n
    };
    init();
  }, []);

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
