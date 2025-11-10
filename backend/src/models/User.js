const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password requis seulement si pas de Google OAuth
    }
  },
  googleId: String,
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  country: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'Français'
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  profilePhoto: String,
  pushToken: String,
  pushPlatform: {
    type: String,
    enum: ['ios', 'android']
  },
  lastSync: Date,
  preferences: {
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      goalReminders: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['Sombre', 'Clair', 'Automatique'],
      default: 'Sombre'
    }
  }
}, { timestamps: true });

// Index pour les recherches
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
