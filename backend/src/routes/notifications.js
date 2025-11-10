const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const notificationController = require('../controllers/notificationController');

// Middleware d'authentification
const auth = passport.authenticate('jwt', { session: false });

// Routes
router.get('/', auth, notificationController.getNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/read-all', auth, notificationController.markAllAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);
router.delete('/all', auth, notificationController.deleteAllNotifications);
router.post('/register-token', auth, notificationController.registerToken);

module.exports = router;
