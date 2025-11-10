import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from './api';
import { Alert } from 'react-native';

interface PendingSync {
  transactions: any[];
  goals: any[];
  updates: any[];
}

// Sauvegarder une transaction offline
export async function saveOfflineTransaction(transaction: any) {
  try {
    const pending = await AsyncStorage.getItem('pendingSync');
    const data: PendingSync = pending ? JSON.parse(pending) : { transactions: [], goals: [], updates: [] };
    
    data.transactions.push({
      ...transaction,
      _tempId: `temp_${Date.now()}`,
      _offline: true,
      _createdAt: new Date().toISOString()
    });
    
    await AsyncStorage.setItem('pendingSync', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde offline:', error);
    return false;
  }
}

// Sauvegarder un objectif offline
export async function saveOfflineGoal(goal: any) {
  try {
    const pending = await AsyncStorage.getItem('pendingSync');
    const data: PendingSync = pending ? JSON.parse(pending) : { transactions: [], goals: [], updates: [] };
    
    data.goals.push({
      ...goal,
      _tempId: `temp_${Date.now()}`,
      _offline: true,
      _createdAt: new Date().toISOString()
    });
    
    await AsyncStorage.setItem('pendingSync', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde offline:', error);
    return false;
  }
}

// Synchroniser avec le backend
export async function syncWithBackend() {
  try {
    const isConnected = await isOnline();
    if (!isConnected) {
      console.log('Pas de connexion, sync annulée');
      return { success: false, reason: 'offline' };
    }

    const pending = await AsyncStorage.getItem('pendingSync');
    if (!pending) {
      console.log('Rien à synchroniser');
      return { success: true, synced: 0 };
    }
    
    const data: PendingSync = JSON.parse(pending);
    const lastSync = await AsyncStorage.getItem('lastSync') || new Date(0).toISOString();
    
    // Envoyer au backend
    const response = await api.post('/sync', {
      lastSync,
      pendingData: data
    });
    
    // Mettre à jour les IDs temporaires avec les IDs réels
    if (response.data.success) {
      // Vider les données en attente
      await AsyncStorage.setItem('pendingSync', JSON.stringify({ 
        transactions: [], 
        goals: [], 
        updates: [] 
      }));
      
      // Mettre à jour le timestamp
      await AsyncStorage.setItem('lastSync', new Date().toISOString());
      
      return {
        success: true,
        synced: response.data.synced,
        serverData: response.data.serverData
      };
    }
    
    return { success: false, reason: 'server_error' };
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    return { success: false, reason: 'error', error };
  }
}

// Vérifier si en ligne
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}

// Configurer l'écoute de la connexion
export function setupNetworkListener(onConnectionChange: (isConnected: boolean) => void) {
  return NetInfo.addEventListener(state => {
    const isConnected = state.isConnected === true && state.isInternetReachable === true;
    onConnectionChange(isConnected);
    
    // Auto-sync quand connexion rétablie
    if (isConnected) {
      syncWithBackend().then(result => {
        if (result.success && result.synced) {
          const total = 
            (result.synced.transactions || 0) + 
            (result.synced.goals || 0) + 
            (result.synced.updates || 0);
          
          if (total > 0) {
            Alert.alert(
              '✅ Synchronisation réussie',
              `${total} élément(s) synchronisé(s) avec le serveur`
            );
          }
        }
      });
    }
  });
}

// Obtenir le nombre d'éléments en attente de sync
export async function getPendingSyncCount(): Promise<number> {
  try {
    const pending = await AsyncStorage.getItem('pendingSync');
    if (!pending) return 0;
    
    const data: PendingSync = JSON.parse(pending);
    return data.transactions.length + data.goals.length + data.updates.length;
  } catch (error) {
    return 0;
  }
}

// Obtenir le statut de synchronisation
export async function getSyncStatus() {
  const lastSync = await AsyncStorage.getItem('lastSync');
  const pendingCount = await getPendingSyncCount();
  const isConnected = await isOnline();
  
  return {
    lastSync: lastSync ? new Date(lastSync) : null,
    pendingCount,
    isOnline: isConnected,
    needsSync: pendingCount > 0
  };
}
