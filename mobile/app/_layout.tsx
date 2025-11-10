import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../src/store/authStore';
import { getTheme } from '../src/theme/theme';

export default function RootLayout() {
  const { theme: themePreference, setTheme } = useAuthStore();
  const [currentTheme, setCurrentTheme] = useState(getTheme(themePreference));

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as 'Sombre' | 'Clair' | 'Automatique');
        }
      } catch (error) {
        console.error('Erreur chargement thème:', error);
      }
    };
    loadTheme();
  }, []);

  // Mettre à jour le thème quand la préférence change
  useEffect(() => {
    setCurrentTheme(getTheme(themePreference));
  }, [themePreference]);

  // Écouter les changements du thème système si mode automatique
  useEffect(() => {
    if (themePreference === 'Automatique') {
      const subscription = Appearance.addChangeListener(() => {
        setCurrentTheme(getTheme('Automatique'));
      });
      return () => subscription.remove();
    }
  }, [themePreference]);

  return (
    <PaperProvider theme={currentTheme}>
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
