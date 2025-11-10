const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const accountController = require('../controllers/accountController');
const { validate, accountSchema, transferSchema } = require('../middleware/validation');

// Middleware d'authentification
const auth = passport.authenticate('jwt', { session: false });

// Routes
router.get('/', auth, accountController.getAccounts);
router.post('/', auth, validate(accountSchema), accountController.createAccount);
router.get('/:id', auth, accountController.getAccountById);
router.put('/:id', auth, validate(accountSchema), accountController.updateAccount);
router.delete('/:id', auth, accountController.deleteAccount);
router.post('/transfer', auth, validate(transferSchema), accountController.transferBetweenAccounts);

module.exports = router;
