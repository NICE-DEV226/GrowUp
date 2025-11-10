import { useAuthStore } from '../store/authStore';
import { getTheme } from '../theme/theme';

export const useTheme = () => {
  const { theme: themePreference } = useAuthStore();
  const theme = getTheme(themePreference);
  
  return {
    theme,
    colors: theme.colors,
    isDark: themePreference === 'Sombre' || (themePreference === 'Automatique' && theme === getTheme('Sombre')),
  };
};
