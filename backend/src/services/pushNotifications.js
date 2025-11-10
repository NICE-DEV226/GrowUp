const axios = require('axios');
const User = require('../models/User');
const Notification = require('../models/Notification');

// URL de l'API Expo Push
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Envoyer une notification push via Expo
 * @param {string} userId - ID de l'utilisateur
 * @param {object} notification - Données de la notification
 * @returns {Promise<object>} Résultat de l'envoi
 */
async function sendPushNotification(userId, notification) {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.pushToken) {
      console.log(`Pas de token push pour l'utilisateur ${userId}`);
      return { success: false, reason: 'No push token' };
    }

    // Compter les notifications non lues pour le badge
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    const message = {
      to: user.pushToken,
      title: `💰 ${notification.title}`,
      body: notification.body,
      data: {
        screen: 'notifications',
        notificationId: notification.id || null,
        type: notification.type || 'info',
        ...notification.data
      },
      sound: 'default',
      badge: unreadCount,
      priority: notification.type === 'important' ? 'high' : 'default',
      channelId: notification.type === 'important' ? 'growup-important' : 'growup-default'
    };

    const response = await axios.post(EXPO_PUSH_URL, message, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Push notification envoyée à ${user.email}:`, response.data);
    return { success: true, data: response.data };

  } catch (error) {
    console.error('❌ Erreur push notification:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Envoyer une notification push à plusieurs utilisateurs
 * @param {Array<string>} userIds - IDs des utilisateurs
 * @param {object} notification - Données de la notification
 * @returns {Promise<object>} Résultats des envois
 */
async function sendBulkPushNotifications(userIds, notification) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const userId of userIds) {
    const result = await sendPushNotification(userId, notification);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({ userId, reason: result.reason || result.error });
    }
  }

  return results;
}

/**
 * Créer une notification en base ET envoyer push
 * @param {string} userId - ID de l'utilisateur
 * @param {object} notificationData - Données de la notification
 * @returns {Promise<object>} Notification créée
 */
async function createAndSendNotification(userId, notificationData) {
  try {
    // 1. Créer la notification en base
    const notification = new Notification({
      userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      category: notificationData.category || 'Système',
      data: notificationData.data || {}
    });

    await notification.save();

    // 2. Envoyer la push notification
    await sendPushNotification(userId, {
      title: notification.title,
      body: notification.message,
      type: notification.type,
      id: notification._id,
      data: notification.data
    });

    return notification;

  } catch (error) {
    console.error('Erreur création notification:', error);
    throw error;
  }
}

/**
 * Templates de notifications prédéfinis
 */
const NotificationTemplates = {
  goalAchieved: (goalTitle) => ({
    title: 'Objectif atteint ! 🎉',
    message: `Félicitations ! Vous avez atteint "${goalTitle}"`,
    type: 'success',
    category: 'Objectifs'
  }),

  budgetExceeded: (category, amount, currency) => ({
    title: 'Budget dépassé ⚠️',
    message: `Attention ! Budget "${category}" dépassé de ${amount}${currency}`,
    type: 'warning',
    category: 'Budget'
  }),

  transactionAdded: (amount, category, currency) => ({
    title: 'Transaction enregistrée ✅',
    message: `${amount}${currency} ajouté dans "${category}"`,
    type: 'info',
    category: 'Transactions'
  }),

  savingsReminder: () => ({
    title: 'Rappel d\'épargne 💡',
    message: 'N\'oubliez pas d\'allouer de l\'argent à vos objectifs cette semaine',
    type: 'info',
    category: 'Rappels'
  }),

  syncComplete: (itemsCount) => ({
    title: 'Synchronisation terminée 🔄',
    message: `${itemsCount} élément(s) synchronisé(s) avec succès`,
    type: 'success',
    category: 'Système'
  }),

  lowBalance: (balance, currency) => ({
    title: 'Solde faible ⚠️',
    message: `Votre solde est de ${balance}${currency}. Pensez à recharger votre compte`,
    type: 'warning',
    category: 'Système'
  })
};

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  createAndSendNotification,
  NotificationTemplates
};
