const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, country, currency, language } = req.body;

    // Validation
    if (!email || !password || !name || !country) {
      return res.status(400).json({ error: 'Email, password, name et country sont requis' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      email,
      password: hashedPassword,
      name,
      country,
      currency: currency || 'EUR',
      language: language || 'Français'
    });
    
    await user.save();

    // Create default account
    const account = new Account({
      userId: user._id,
      name: 'Compte Principal',
      balance: 0,
      currency: user.currency,
      isDefault: true
    });
    await account.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        country: user.country,
        currency: user.currency,
        language: user.language,
        isNewUser: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        currency: user.currency,
        language: user.language,
        country: user.country
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        country: req.user.country,
        currency: req.user.currency,
        language: req.user.language,
        profilePhoto: req.user.profilePhoto
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Dans une implémentation JWT simple, le token est invalidé côté client
    // Pour une invalidation côté serveur, on pourrait ajouter le token à une blacklist
    // ou utiliser un système de refresh tokens
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
