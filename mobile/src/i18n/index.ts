import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fr from './fr';
import en from './en';

export type Language = 'Français' | 'English';

export type TranslationKeys = typeof fr;

const translations: Record<Language, TranslationKeys> = {
  'Français': fr,
  'English': en,
};

interface I18nState {
  language: Language;
  t: TranslationKeys;
  isInitialized: boolean;
  setLanguage: (language: Language) => void;
  initialize: () => Promise<void>;
}

export const useI18n = create<I18nState>((set, get) => ({
  language: 'Français',
  t: translations['Français'],
  isInitialized: false,
  setLanguage: (language: Language) => {
    console.log('🌍 i18n: Changing language to:', language);
    set({ 
      language, 
      t: translations[language] 
    });
    // Sauvegarder dans AsyncStorage
    AsyncStorage.setItem('language', language).catch(console.error);
  },
  initialize: async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'Français' || savedLanguage === 'English')) {
        console.log('🌍 i18n: Initializing with saved language:', savedLanguage);
        set({ 
          language: savedLanguage as Language,
          t: translations[savedLanguage as Language],
          isInitialized: true
        });
      } else {
        console.log('🌍 i18n: No saved language, using default: Français');
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error('🌍 i18n: Error initializing:', error);
      set({ isInitialized: true });
    }
  },
}));

// Helper function to get nested translation
export const getTranslation = (obj: any, path: string): string => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return the path if translation not found
    }
  }
  
  return typeof result === 'string' ? result : path;
};
