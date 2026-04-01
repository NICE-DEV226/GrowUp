const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
    default: 'monthly'
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  nextDate: {
    type: Date,
    required: true
  },
  note: String,
  icon: String,
  color: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastExecuted: Date
}, { timestamps: true });

// Index pour les requêtes
recurringTransactionSchema.index({ userId: 1, isActive: 1 });
recurringTransactionSchema.index({ nextDate: 1, isActive: 1 });

// Méthode pour calculer la prochaine date
recurringTransactionSchema.methods.calculateNextDate = function() {
  const current = this.nextDate || this.startDate;
  const next = new Date(current);
  
  switch (this.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
};

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
