import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import i18n from '../i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTranslation = () => {
  const { t: i18nT } = useI18nTranslation();
  const { language, setLanguage } = useAuthStore();
  
  // Wrapper pour accepter n'importe quelle clé string
  const t = (key: string): string => {
    return i18nT(key);
  };
  
  const changeLanguage = async (newLanguage: string) => {
    const langCode = newLanguage === 'Français' ? 'fr' : 
                     newLanguage === 'English' ? 'en' : 
                     newLanguage === 'Español' ? 'es' : 'fr';
    
    // Changer la langue dans i18next (async)
    await i18n.changeLanguage(langCode);
    
    // Sauvegarder dans le store Zustand
    setLanguage(newLanguage);
    
    // Sauvegarder dans AsyncStorage
    await AsyncStorage.setItem('language', newLanguage);
  };
  
  return { t, language, changeLanguage };
};
