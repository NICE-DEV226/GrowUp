import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // iOS: Afficher la bannière
    shouldShowList: true, // iOS: Afficher dans la liste de notifications
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Configuration du canal Android (pour se démarquer)
export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('growup-default', {
      name: 'GrowUp Notifications',
      description: 'Notifications de votre application GrowUp',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#733fea',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Canal pour les notifications importantes (objectifs atteints, etc.)
    await Notifications.setNotificationChannelAsync('growup-important', {
      name: 'GrowUp - Important',
      description: 'Notifications importantes (objectifs, budgets)',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#10B981',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }
}

// Demander les permissions
export async function registerForPushNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission de notification refusée');
      return null;
    }

    // Obtenir le token Expo Push
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Enregistrer le token sur le backend
    await api.post('/notifications/register-token', {
      token,
      platform: Platform.OS,
    });

    // Sauvegarder localement
    await AsyncStorage.setItem('pushToken', token);

    return token;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des notifications:', error);
    return null;
  }
}

// Envoyer une notification locale (pour test ou offline)
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any,
  type: 'default' | 'important' = 'default'
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `💰 ${title}`, // Emoji pour identifier l'app
      body,
      data: { 
        ...data, 
        screen: 'notifications', // Redirection vers la page notifications
        app: 'growup' 
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: '#733fea',
      badge: 1,
    },
    trigger: null, // Immédiat
  });
}

// Gérer le clic sur une notification
export function setupNotificationListener(navigation: any) {
  // Notification reçue quand l'app est ouverte
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification reçue:', notification);
  });

  // Notification cliquée
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    // Rediriger vers la page notifications
    if (data.screen === 'notifications') {
      navigation.navigate('/(tabs)/dashboard'); // Ou créer une route notifications
    }
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

// Obtenir le nombre de notifications non lues (badge)
export async function getNotificationBadgeCount(): Promise<number> {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  } catch (error) {
    return 0;
  }
}

// Mettre à jour le badge de l'app
export async function updateAppBadge(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

// Effacer toutes les notifications
export async function clearAllNotifications() {
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.setBadgeCountAsync(0);
}

// Types de notifications personnalisées
export const NotificationTemplates = {
  goalAchieved: (goalName: string) => ({
    title: 'Objectif atteint ! 🎉',
    body: `Félicitations ! Vous avez atteint "${goalName}"`,
    type: 'important' as const,
  }),
  
  budgetExceeded: (category: string, amount: number) => ({
    title: 'Budget dépassé ⚠️',
    body: `Attention ! Budget "${category}" dépassé de ${amount}€`,
    type: 'default' as const,
  }),
  
  transactionAdded: (amount: number, category: string) => ({
    title: 'Transaction enregistrée ✅',
    body: `${amount}€ ajouté dans "${category}"`,
    type: 'default' as const,
  }),
  
  savingsReminder: () => ({
    title: 'Rappel d\'épargne 💡',
    body: 'N\'oubliez pas d\'allouer de l\'argent à vos objectifs cette semaine',
    type: 'default' as const,
  }),
  
  syncComplete: (itemsCount: number) => ({
    title: 'Synchronisation terminée 🔄',
    body: `${itemsCount} élément(s) synchronisé(s) avec succès`,
    type: 'default' as const,
  }),
};
