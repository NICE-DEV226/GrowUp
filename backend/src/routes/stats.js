const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const statsController = require('../controllers/statsController');

// Middleware d'authentification
const auth = passport.authenticate('jwt', { session: false });

// Routes de base
router.get('/summary', auth, statsController.getSummary);
router.get('/monthly', auth, statsController.getMonthlyStats);
router.get('/trends', auth, statsController.getTrends);
router.get('/dashboard', auth, statsController.getDashboardStats);

// TODO: Routes avancées à implémenter
// router.get('/period', auth, statsAdvancedController.getPeriodStats);
// router.get('/categories', auth, statsAdvancedController.getCategoryStats);
// router.get('/weekly', auth, statsAdvancedController.getWeeklyTrend);
// router.get('/insights', auth, statsAdvancedController.getInsights);

module.exports = router;
