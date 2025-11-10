const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  note: String,
  tags: [String],
  icon: String,
  color: String,
  _tempId: String, // Pour la synchronisation offline
  _offline: {
    type: Boolean,
    default: false
  },
  syncedAt: Date
}, { timestamps: true });

// Index composés pour les requêtes fréquentes
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
