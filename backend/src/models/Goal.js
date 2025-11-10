const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: Date,
  priority: {
    type: Number,
    default: 0
  },
  isAchieved: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'target'
  },
  color: {
    type: String,
    default: '#733fea'
  },
  category: {
    type: String,
    default: 'Épargne'
  },
  _tempId: String, // Pour la synchronisation offline
  _offline: {
    type: Boolean,
    default: false
  },
  syncedAt: Date
}, { timestamps: true });

// Index pour les requêtes
goalSchema.index({ userId: 1, isAchieved: 1 });

// Méthode pour vérifier si l'objectif est atteint
goalSchema.methods.checkAchieved = function() {
  this.isAchieved = this.currentAmount >= this.targetAmount;
  return this.isAchieved;
};

module.exports = mongoose.model('Goal', goalSchema);
