const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Goal = require('../models/Goal');

// Statistiques globales
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Solde total de tous les comptes
    const accountsAgg = await Account.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);

    const totalBalance = accountsAgg[0]?.totalBalance || 0;

    // Total des revenus
    const incomeAgg = await Transaction.aggregate([
      { $match: { userId, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;

    // Total des dépenses
    const expenseAgg = await Transaction.aggregate([
      { $match: { userId, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpense = expenseAgg[0]?.total || 0;

    // Devise de l'utilisateur
    const currency = req.user.currency || 'EUR';

    res.json({
      totalBalance,
      totalIncome,
      totalExpense,
      currency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Statistiques mensuelles
exports.getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Revenus du mois
    const incomeAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'income',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const income = incomeAgg[0]?.total || 0;

    // Dépenses du mois
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const expense = expenseAgg[0]?.total || 0;

    // Dépenses par catégorie
    const byCategory = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    // Formater les catégories
    const byCategoryFormatted = {};
    byCategory.forEach(cat => {
      byCategoryFormatted[cat._id] = cat.amount;
    });

    // Nombre de transactions
    const transactions = await Transaction.countDocuments({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    res.json({
      income,
      expense,
      byCategory: byCategoryFormatted,
      transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tendances (évolution sur plusieurs mois)
exports.getTrends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { range = '6m' } = req.query;

    // Déterminer le nombre de mois
    const monthsCount = range === '3m' ? 3 : range === '1y' ? 12 : 6;

    const months = [];
    const currentDate = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      // Revenus du mois
      const incomeAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            type: 'income',
            date: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const income = incomeAgg[0]?.total || 0;

      // Dépenses du mois
      const expenseAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const expense = expenseAgg[0]?.total || 0;

      months.push({
        month: monthDate.toISOString(),
        income,
        expense,
        balance: income - expense
      });
    }

    res.json({ months });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stats pour le dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Solde total
    const accountsAgg = await Account.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);

    const totalBalance = accountsAgg[0]?.totalBalance || 0;

    // Revenus et dépenses du mois en cours
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date();

    const incomeAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'income',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;

    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpense = expenseAgg[0]?.total || 0;

    // 5 dernières transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Top catégories de dépenses
    const topCategories = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { amount: -1 } },
      { $limit: 5 }
    ]);

    // Calculer les pourcentages
    const topCategoriesFormatted = topCategories.map(cat => ({
      category: cat._id,
      amount: cat.amount,
      percentage: totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0
    }));

    // Progression des objectifs
    const goals = await Goal.find({ userId, isAchieved: false })
      .sort({ priority: -1 })
      .limit(3)
      .lean();

    const goalsProgress = goals.map(goal => ({
      id: goal._id,
      title: goal.title,
      progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
    }));

    res.json({
      totalBalance,
      totalIncome,
      totalExpense,
      recentTransactions,
      topCategories: topCategoriesFormatted,
      goalsProgress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
