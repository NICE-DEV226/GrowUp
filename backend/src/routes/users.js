const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const { validate, userUpdateSchema, passwordChangeSchema, preferencesSchema } = require('../middleware/validation');

// Middleware d'authentification
const auth = passport.authenticate('jwt', { session: false });

// Routes
router.get('/me', auth, userController.getProfile);
router.put('/me', auth, validate(userUpdateSchema), userController.updateProfile);
router.post('/me/photo', auth, upload.single('photo'), userController.uploadPhoto);
router.delete('/me/photo', auth, userController.deletePhoto);
router.put('/me/password', auth, validate(passwordChangeSchema), userController.changePassword);
router.get('/me/preferences', auth, userController.getPreferences);
router.put('/me/preferences', auth, validate(preferencesSchema), userController.updatePreferences);

module.exports = router;
