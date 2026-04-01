const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getRecurringTransactions,
  createRecurringTransaction,
  getRecurringTransactionById,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  executeRecurringTransaction
} = require('../controllers/recurringTransactionController');

// Routes
router.get('/', auth, getRecurringTransactions);
router.post('/', auth, createRecurringTransaction);
router.get('/:id', auth, getRecurringTransactionById);
router.put('/:id', auth, updateRecurringTransaction);
router.delete('/:id', auth, deleteRecurringTransaction);
router.patch('/:id/toggle', auth, toggleRecurringTransaction);
router.post('/:id/execute', auth, executeRecurringTransaction);

module.exports = router;
