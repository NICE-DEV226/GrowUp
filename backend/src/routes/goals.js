const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const goalController = require('../controllers/goalController');
const { validate, goalSchema, allocateSchema } = require('../middleware/validation');

// Middleware d'authentification
const auth = passport.authenticate('jwt', { session: false });

// Routes
router.get('/', auth, goalController.getGoals);
router.post('/', auth, validate(goalSchema), goalController.createGoal);
router.get('/:id', auth, goalController.getGoalById);
router.put('/:id', auth, validate(goalSchema), goalController.updateGoal);
router.post('/:id/allocate', auth, validate(allocateSchema), goalController.allocateToGoal);
router.delete('/:id', auth, goalController.deleteGoal);

module.exports = router;
