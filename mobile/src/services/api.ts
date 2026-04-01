import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';

// Configuration de l'URL API
// Priorité: Variable d'environnement > Valeur par défaut
const getApiUrl = (): string => {
  // 1. Essayer la variable d'environnement Expo
  const envUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  
  // 2. Valeur par défaut pour le développement
  // ⚠️ CHANGEZ cette IP selon votre configuration locale
  // - Émulateur Android: http://10.0.2.2:4000/api
  // - Simulateur iOS: http://localhost:4000/api
  // - Appareil physique: http://VOTRE_IP_LOCALE:4000/api
  return 'http://localhost:4000/api';
};

const API_URL = getApiUrl();

console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Fonction pour attendre un délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  async (config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs avec retry pour 429
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Gestion de l'erreur 429 (Too Many Requests)
    if (error.response?.status === 429) {
      console.warn('⚠️ Rate limit atteint (429)');
      
      // Retry automatique avec backoff exponentiel (max 2 tentatives)
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        if (originalRequest._retryCount <= 2) {
          const retryDelay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 5000);
          console.log(`🔄 Retry ${originalRequest._retryCount}/2 dans ${retryDelay}ms...`);
          
          await delay(retryDelay);
          return api(originalRequest);
        }
      }
      
      // Si toutes les tentatives échouent, retourner une erreur plus claire
      const customError = new Error('Trop de requêtes. Veuillez patienter quelques secondes.');
      (customError as any).isRateLimit = true;
      return Promise.reject(customError);
    }
    
    // Gestion de l'erreur 401 (Unauthorized)
    if (error.response?.status === 401) {
      console.error('🔒 Token invalide ou expiré (401)');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      try {
        router.replace('/(auth)/login');
      } catch (e) {
        console.log('Redirection vers login impossible:', e);
      }
    }
    
    // Log des autres erreurs
    if (error.response) {
      console.error('❌ Response error:', error.response.status, error.message);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('❌ No response received');
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
