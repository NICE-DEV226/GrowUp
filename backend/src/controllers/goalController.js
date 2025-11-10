const Goal = require('../models/Goal');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Récupérer tous les objectifs
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user._id;

    const goals = await Goal.find({ userId })
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer un objectif
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, targetAmount, deadline, icon, color, category, priority } = req.body;

    // Validation
    if (!title || !targetAmount) {
      return res.status(400).json({ error: 'Title et targetAmount sont requis' });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({ error: 'Le montant cible doit être positif' });
    }

    const goal = new Goal({
      userId,
      title,
      targetAmount,
      deadline,
      icon: icon || 'target',
      color: color || '#733fea',
      category: category || 'Épargne',
      priority: priority || 0
    });

    await goal.save();

    res.status(201).json({ goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un objectif par ID
exports.getGoalById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({ error: 'Objectif non trouvé' });
    }

    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un objectif
exports.updateGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { title, targetAmount, deadline, icon, color, category, priority, currentAmount } = req.body;

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({ error: 'Objectif non trouvé' });
    }

    // Mettre à jour les champs
    if (title) goal.title = title;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (deadline !== undefined) goal.deadline = deadline;
    if (icon) goal.icon = icon;
    if (color) goal.color = color;
    if (category) goal.category = category;
    if (priority !== undefined) goal.priority = priority;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;

    // Vérifier si l'objectif est atteint
    goal.checkAchieved();

    await goal.save();

    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Allouer de l'argent à un objectif
exports.allocateToGoal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, accountId } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    const goal = await Goal.findOne({ _id: id, userId }).session(session);

    if (!goal) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Objectif non trouvé' });
    }

    // Récupérer le compte
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

    // Vérifier le solde
    if (account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Déduire du compte
    account.balance -= amount;
    await account.save({ session });

    // Ajouter à l'objectif (ne pas dépasser le target)
    const wasAchieved = goal.isAchieved;
    goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    goal.checkAchieved();
    await goal.save({ session });

    // Créer une notification si l'objectif vient d'être atteint
    if (!wasAchieved && goal.isAchieved) {
      const notification = new Notification({
        userId,
        title: 'Objectif atteint ! 🎉',
        message: `Félicitations ! Vous avez atteint "${goal.title}"`,
        type: 'success',
        category: 'Objectifs',
        data: { goalId: goal._id }
      });
      await notification.save({ session });
    }

    await session.commitTransaction();

    res.json({
      goal,
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

// Supprimer un objectif
exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({ error: 'Objectif non trouvé' });
    }

    await Goal.deleteOne({ _id: id });

    res.json({ message: 'Objectif supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
