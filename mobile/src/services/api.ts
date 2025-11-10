import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401 (token expiré/invalide)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré, nettoyer et rediriger vers login
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Rediriger vers login
      try {
        router.replace('/(auth)/login');
      } catch (e) {
        console.log('Redirection vers login impossible:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
