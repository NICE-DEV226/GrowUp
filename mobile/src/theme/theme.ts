import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Appearance } from 'react-native';

// Thème sombre personnalisé
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#733fea',
    secondary: '#98e0f8',
    background: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceVariant: '#333333',
    text: '#fdfdfd',
    textSecondary: 'rgba(253, 253, 253, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#F44336',
    success: '#10B981',
    warning: '#FFC107',
    info: '#98e0f8',
    card: '#2a2a2a',
    cardBorder: 'rgba(255, 255, 255, 0.05)',
    gradient1: '#733fea',
    gradient2: '#98e0f8',
  },
};

// Thème clair personnalisé (doux et harmonieux)
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6b35d6',
    secondary: '#7ec9e8',
    background: '#f8f9fa',
    surface: '#ffffff',
    surfaceVariant: '#f1f3f5',
    text: '#2d3436',
    textSecondary: 'rgba(45, 52, 54, 0.65)',
    border: 'rgba(0, 0, 0, 0.08)',
    error: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#3498db',
    card: '#ffffff',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    gradient1: '#6b35d6',
    gradient2: '#7ec9e8',
  },
};

// Fonction pour obtenir le thème en fonction de la préférence
export const getTheme = (themePreference: 'Sombre' | 'Clair' | 'Automatique') => {
  if (themePreference === 'Automatique') {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === 'dark' ? darkTheme : lightTheme;
  }
  return themePreference === 'Sombre' ? darkTheme : lightTheme;
};

// Types pour TypeScript
export type AppTheme = typeof darkTheme;
