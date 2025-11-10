const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['success', 'warning', 'info', 'error'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['Objectifs', 'Budget', 'Transactions', 'Rappels', 'Système'],
    default: 'Système'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  data: mongoose.Schema.Types.Mixed // Données additionnelles
}, { timestamps: true });

// Index composé pour les requêtes fréquentes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
