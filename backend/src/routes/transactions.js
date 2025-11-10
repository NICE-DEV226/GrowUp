const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const transactionController = require('../controllers/transactionController');
const { validate, transactionSchema } = require('../middleware/validation');

// Middleware d'authentification
const auth = passport.authenticate('jwt', { session: false });

// Routes
router.get('/', auth, transactionController.getTransactions);
router.post('/', auth, validate(transactionSchema), transactionController.createTransaction);
router.get('/:id', auth, transactionController.getTransactionById);
router.put('/:id', auth, validate(transactionSchema), transactionController.updateTransaction);
router.delete('/:id', auth, transactionController.deleteTransaction);

module.exports = router;
