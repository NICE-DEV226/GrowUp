const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const mongoose = require('mongoose');

// Récupérer toutes les transactions avec filtres
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to, type, category, search, limit = 50, cursor } = req.query;

    const query = { userId };

    // Filtres
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { note: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, _id: -1 })
      .limit(parseInt(limit))
      .lean();

    const total = await Transaction.countDocuments({ userId });

    const nextCursor = transactions.length === parseInt(limit) 
      ? transactions[transactions.length - 1]._id 
      : null;

    res.json({
      transactions,
      total,
      nextCursor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer une transaction
exports.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { type, category, amount, date, note, accountId, tags, icon, color } = req.body;

    // Validation
    if (!type || !category || !amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Type, category et amount sont requis' });
    }

    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    // Récupérer le compte (par défaut si non spécifié)
    let account;
    if (accountId) {
      account = await Account.findOne({ _id: accountId, userId }).session(session);
    } else {
      account = await Account.findOne({ userId, isDefault: true }).session(session);
    }

    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    // Vérifier le solde pour les dépenses
    if (type === 'expense' && account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Créer la transaction
    const transaction = new Transaction({
      userId,
      accountId: account._id,
      type,
      category,
      amount,
      date: date || new Date(),
      note,
      tags,
      icon,
      color
    });

    await transaction.save({ session });

    // Mettre à jour le solde du compte
    if (type === 'expense') {
      account.balance -= amount;
    } else {
      account.balance += amount;
    }

    await account.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      transaction,
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

// Récupérer une transaction par ID
exports.getTransactionById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une transaction
exports.updateTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { type, category, amount, date, note, tags, icon, color } = req.body;

    const transaction = await Transaction.findOne({ _id: id, userId }).session(session);

    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    const account = await Account.findById(transaction.accountId).session(session);

    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    // Annuler l'ancienne transaction
    if (transaction.type === 'expense') {
      account.balance += transaction.amount;
    } else {
      account.balance -= transaction.amount;
    }

    // Appliquer la nouvelle transaction
    const newType = type || transaction.type;
    const newAmount = amount || transaction.amount;

    if (newType === 'expense') {
      if (account.balance < newAmount) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Solde insuffisant' });
      }
      account.balance -= newAmount;
    } else {
      account.balance += newAmount;
    }

    // Mettre à jour la transaction
    transaction.type = newType;
    transaction.category = category || transaction.category;
    transaction.amount = newAmount;
    transaction.date = date || transaction.date;
    transaction.note = note !== undefined ? note : transaction.note;
    transaction.tags = tags || transaction.tags;
    transaction.icon = icon || transaction.icon;
    transaction.color = color || transaction.color;

    await transaction.save({ session });
    await account.save({ session });

    await session.commitTransaction();

    res.json({
      transaction,
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

// Supprimer une transaction
exports.deleteTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId }).session(session);

    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    const account = await Account.findById(transaction.accountId).session(session);

    if (account) {
      // Restaurer le solde
      if (transaction.type === 'expense') {
        account.balance += transaction.amount;
      } else {
        account.balance -= transaction.amount;
      }
      await account.save({ session });
    }

    await Transaction.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();

    res.json({ 
      message: 'Transaction supprimée avec succès',
      account: account ? {
        id: account._id,
        balance: account.balance
      } : null
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
