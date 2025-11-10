import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'Sombre' | 'Clair' | 'Automatique') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  token: null,
  currency: 'EUR',
  language: 'Français',
  theme: 'Sombre',
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setToken: (token) => set({ token }),
  setCurrency: (currency) => {
    set({ currency });
    // Persister dans AsyncStorage
    AsyncStorage.setItem('currency', currency).catch(console.error);
  },
  setLanguage: (language) => {
    set({ language });
    // Persister dans AsyncStorage
    AsyncStorage.setItem('language', language).catch(console.error);
  },
  setTheme: (theme) => {
    set({ theme });
    // Persister dans AsyncStorage
    AsyncStorage.setItem('theme', theme).catch(console.error);
  },
  logout: () => set({ user: null, token: null })
}));
