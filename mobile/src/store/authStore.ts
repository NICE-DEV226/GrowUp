import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n, Language } from '../i18n';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  token: string | null;
  currency: string;
  language: string;
  theme: 'Sombre' | 'Clair' | 'Automatique';
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'Sombre' | 'Clair' | 'Automatique') => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  token: null,
  currency: 'EUR',
  language: 'Français',
  theme: 'Sombre',
  isInitialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setToken: (token) => set({ token }),
  setCurrency: (currency) => {
    set({ currency });
    // Sauvegarder en arrière-plan
    AsyncStorage.setItem('currency', currency).catch(console.error);
  },
  setLanguage: (language) => {
    console.log('🔄 authStore: Setting language to:', language);
    set({ language });
    // Synchroniser avec le store i18n pour changement instantané
    const i18nLanguage = language as Language;
    console.log('🔄 authStore: Syncing with i18n store:', i18nLanguage);
    useI18n.getState().setLanguage(i18nLanguage);
    // Sauvegarder en arrière-plan
    AsyncStorage.setItem('language', language).catch(console.error);
  },
  setTheme: (theme) => {
    set({ theme });
    // Sauvegarder en arrière-plan
    AsyncStorage.setItem('theme', theme).catch(console.error);
  },
  logout: () => set({ user: null, token: null }),
  initialize: async () => {
    try {
      // Charger les préférences depuis AsyncStorage
      const [savedCurrency, savedLanguage, savedTheme, userStr] = await Promise.all([
        AsyncStorage.getItem('currency'),
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('theme'),
        AsyncStorage.getItem('user'),
      ]);

      // Si un utilisateur existe, charger ses préférences
      if (userStr) {
        const userData = JSON.parse(userStr);
        
        // Priorité: préférences sauvegardées > préférences utilisateur > défaut
        const currency = savedCurrency || userData.currency || 'EUR';
        const language = savedLanguage || userData.language || 'Français';
        const theme = (savedTheme as 'Sombre' | 'Clair' | 'Automatique') || 'Sombre';

        // Synchroniser la langue avec le store i18n
        useI18n.getState().setLanguage(language as Language);
        
        set({
          currency,
          language,
          theme,
          isInitialized: true,
        });
      } else {
        // Pas d'utilisateur, utiliser les préférences sauvegardées ou défaut
        const defaultLanguage = savedLanguage || 'Français';
        useI18n.getState().setLanguage(defaultLanguage as Language);
        
        set({
          currency: savedCurrency || 'EUR',
          language: defaultLanguage,
          theme: (savedTheme as 'Sombre' | 'Clair' | 'Automatique') || 'Sombre',
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error('Erreur initialisation store:', error);
      set({ isInitialized: true });
    }
  },
}));
