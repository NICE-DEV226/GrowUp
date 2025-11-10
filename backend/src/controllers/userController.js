const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Récupérer le profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        country: user.country,
        currency: user.currency,
        language: user.language,
        profilePhoto: user.profilePhoto,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, country, currency, language } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (name) user.name = name;
    if (country) user.country = country;
    if (currency) user.currency = currency;
    if (language) user.language = language;

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        country: user.country,
        currency: user.currency,
        language: user.language,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload photo de profil
exports.uploadPhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const { uploadProfilePhoto, deleteProfilePhoto, isCloudinaryConfigured } = require('../services/storage');
    
    // Vérifier que Cloudinary est configuré
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ 
        error: 'Service de stockage non configuré',
        message: 'Veuillez configurer CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans .env'
      });
    }

    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Supprimer l'ancienne photo si elle existe
    if (user.profilePhoto) {
      await deleteProfilePhoto(user.profilePhoto);
    }

    // Upload la nouvelle photo
    const photoUrl = await uploadProfilePhoto(req.file.buffer, userId);

    // Mettre à jour l'utilisateur
    user.profilePhoto = photoUrl;
    await user.save();

    res.json({
      photoUrl,
      user: {
        id: user._id,
        profilePhoto: photoUrl
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer la photo de profil
exports.deletePhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deleteProfilePhoto } = require('../services/storage');

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Supprimer la photo du storage
    if (user.profilePhoto) {
      await deleteProfilePhoto(user.profilePhoto);
    }

    user.profilePhoto = null;
    await user.save();

    res.json({
      message: 'Photo supprimée avec succès',
      user: {
        id: user._id,
        profilePhoto: null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les préférences
exports.getPreferences = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      currency: user.currency,
      language: user.language,
      theme: user.preferences?.theme || 'Sombre',
      notifications: user.preferences?.notifications || {
        push: true,
        email: true,
        budgetAlerts: true,
        goalReminders: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour les préférences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currency, language, theme, notifications } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (currency) user.currency = currency;
    if (language) user.language = language;
    
    if (!user.preferences) {
      user.preferences = {};
    }

    if (theme) user.preferences.theme = theme;
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }

    await user.save();

    res.json({
      preferences: {
        currency: user.currency,
        language: user.language,
        theme: user.preferences.theme,
        notifications: user.preferences.notifications
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
