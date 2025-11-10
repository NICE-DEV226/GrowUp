const Account = require('../models/Account');
const mongoose = require('mongoose');

// Récupérer tous les comptes
exports.getAccounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const accounts = await Account.find({ userId })
      .sort({ isDefault: -1, createdAt: 1 })
      .lean();

    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer un compte
exports.createAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, balance = 0, currency } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Le nom du compte est requis' });
    }

    // Récupérer la devise de l'utilisateur si non spécifiée
    const user = req.user;
    const accountCurrency = currency || user.currency || 'EUR';

    const account = new Account({
      userId,
      name,
      balance,
      currency: accountCurrency,
      isDefault: false
    });

    await account.save();

    res.status(201).json({ account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un compte par ID
exports.getAccountById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const account = await Account.findOne({ _id: id, userId });

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    res.json({ account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un compte
exports.updateAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, currency } = req.body;

    const account = await Account.findOne({ _id: id, userId });

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    if (name) account.name = name;
    if (currency) account.currency = currency;

    await account.save();

    res.json({ account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un compte
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const account = await Account.findOne({ _id: id, userId });

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    // Ne pas supprimer si c'est le compte par défaut
    if (account.isDefault) {
      return res.status(400).json({ error: 'Impossible de supprimer le compte par défaut' });
    }

    // Ne supprimer que si le solde est 0
    if (account.balance !== 0) {
      return res.status(400).json({ error: 'Le solde du compte doit être à 0 pour le supprimer' });
    }

    await Account.deleteOne({ _id: id });

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Transférer entre comptes
exports.transferBetweenAccounts = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { fromAccountId, toAccountId, amount } = req.body;

    // Validation
    if (!fromAccountId || !toAccountId || !amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'fromAccountId, toAccountId et amount sont requis' });
    }

    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    if (fromAccountId === toAccountId) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Les comptes source et destination doivent être différents' });
    }

    // Récupérer les comptes
    const fromAccount = await Account.findOne({ _id: fromAccountId, userId }).session(session);
    const toAccount = await Account.findOne({ _id: toAccountId, userId }).session(session);

    if (!fromAccount || !toAccount) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Un ou plusieurs comptes non trouvés' });
    }

    // Vérifier le solde
    if (fromAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Solde insuffisant dans le compte source' });
    }

    // Effectuer le transfert
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save({ session });
    await toAccount.save({ session });

    await session.commitTransaction();

    res.json({
      message: 'Transfert effectué avec succès',
      fromAccount: {
        id: fromAccount._id,
        balance: fromAccount.balance
      },
      toAccount: {
        id: toAccount._id,
        balance: toAccount.balance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
