const Notification = require('../models/Notification');
const User = require('../models/User');

// Récupérer toutes les notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, unreadOnly = 'false', category } = req.query;

    const query = { userId };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    if (category) {
      query.category = category;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Compter les non lues
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Compter les notifications non lues
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      message: 'Toutes les notifications ont été marquées comme lues',
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    await Notification.deleteOne({ _id: id });

    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer toutes les notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ userId });

    res.json({
      message: 'Toutes les notifications ont été supprimées',
      count: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enregistrer le token FCM
exports.registerToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requis' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.pushToken = token;
    user.pushPlatform = platform;
    await user.save();

    res.json({ message: 'Token enregistré avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
