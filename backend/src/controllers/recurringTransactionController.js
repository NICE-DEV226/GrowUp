const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const mongoose = require('mongoose');

// Récupérer toutes les transactions récurrentes
exports.getRecurringTransactions = async (req, res) => {
  try {
    const userId = req.userId; // Changé de req.user._id à req.userId
    const { isActive } = req.query;

    const query = { userId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const recurring = await RecurringTransaction.find(query)
      .sort({ nextDate: 1 })
      .lean();

    res.json({ recurring, total: recurring.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer une transaction récurrente
exports.createRecurringTransaction = async (req, res) => {
  try {
    const userId = req.userId; // Changé
    const { 
      type, category, amount, frequency, dayOfMonth, dayOfWeek,
      startDate, endDate, note, accountId, icon, color 
    } = req.body;

    // Validation
    if (!type || !category || !amount || !frequency) {
      return res.status(400).json({ 
        error: 'Type, category, amount et frequency sont requis' 
      });
    }

    // Calculer la première date d'exécution
    const start = startDate ? new Date(startDate) : new Date();
    let nextDate = new Date(start);

    if (frequency === 'monthly' && dayOfMonth) {
      nextDate.setDate(dayOfMonth);
      if (nextDate < start) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else if (frequency === 'weekly' && dayOfWeek !== undefined) {
      const currentDay = nextDate.getDay();
      const daysUntil = (dayOfWeek - currentDay + 7) % 7;
      nextDate.setDate(nextDate.getDate() + daysUntil);
    }

    const recurring = new RecurringTransaction({
      userId,
      accountId,
      type,
      category,
      amount,
      frequency,
      dayOfMonth,
      dayOfWeek,
      startDate: start,
      endDate: endDate ? new Date(endDate) : null,
      nextDate,
      note,
      icon,
      color,
      isActive: true
    });

    await recurring.save();

    res.status(201).json({ recurring });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une transaction récurrente par ID
exports.getRecurringTransactionById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const recurring = await RecurringTransaction.findOne({ _id: id, userId });

    if (!recurring) {
      return res.status(404).json({ error: 'Transaction récurrente non trouvée' });
    }

    res.json({ recurring });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une transaction récurrente
exports.updateRecurringTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = req.body;

    const recurring = await RecurringTransaction.findOne({ _id: id, userId });

    if (!recurring) {
      return res.status(404).json({ error: 'Transaction récurrente non trouvée' });
    }

    // Mettre à jour les champs
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        recurring[key] = updates[key];
      }
    });

    await recurring.save();

    res.json({ recurring });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une transaction récurrente
exports.deleteRecurringTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const recurring = await RecurringTransaction.findOne({ _id: id, userId });

    if (!recurring) {
      return res.status(404).json({ error: 'Transaction récurrente non trouvée' });
    }

    await RecurringTransaction.deleteOne({ _id: id });

    res.json({ message: 'Transaction récurrente supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Activer/Désactiver une transaction récurrente
exports.toggleRecurringTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const recurring = await RecurringTransaction.findOne({ _id: id, userId });

    if (!recurring) {
      return res.status(404).json({ error: 'Transaction récurrente non trouvée' });
    }

    recurring.isActive = !recurring.isActive;
    await recurring.save();

    res.json({ recurring });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Exécuter manuellement une transaction récurrente
exports.executeRecurringTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;
    const { id } = req.params;

    const recurring = await RecurringTransaction.findOne({ _id: id, userId }).session(session);

    if (!recurring) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Transaction récurrente non trouvée' });
    }

    // Récupérer le compte
    let account;
    if (recurring.accountId) {
      account = await Account.findOne({ _id: recurring.accountId, userId }).session(session);
    } else {
      account = await Account.findOne({ userId, isDefault: true }).session(session);
    }

    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    // Créer la transaction
    const transaction = new Transaction({
      userId,
      accountId: account._id,
      type: recurring.type,
      category: recurring.category,
      amount: recurring.amount,
      date: new Date(),
      note: recurring.note,
      icon: recurring.icon,
      color: recurring.color
    });

    await transaction.save({ session });

    // Mettre à jour le solde du compte
    if (recurring.type === 'expense') {
      account.balance -= recurring.amount;
    } else {
      account.balance += recurring.amount;
    }

    await account.save({ session });

    // Mettre à jour la transaction récurrente
    recurring.lastExecuted = new Date();
    recurring.nextDate = recurring.calculateNextDate();
    await recurring.save({ session });

    await session.commitTransaction();

    res.json({ 
      transaction,
      recurring,
      account: {
        id: account._id,
        balance: account.balance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
