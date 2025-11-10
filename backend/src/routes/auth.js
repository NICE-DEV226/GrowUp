const express = require('express');
const passport = require('../config/passport');
const authController = require('../controllers/authController');

const router = express.Router();

// Middleware d'authentification
const auth = passport.authenticate('jwt', { session: false });

// Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getCurrentUser);
router.post('/logout', auth, authController.logout);

module.exports = router;
