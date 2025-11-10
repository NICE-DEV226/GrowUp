const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index pour les requêtes
accountSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('Account', accountSchema);
