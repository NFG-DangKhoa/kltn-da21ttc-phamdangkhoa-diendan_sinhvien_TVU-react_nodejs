// File: backend/routes/authRoutes.js
const express = require('express');
const { register, login, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');
const { googleLogin, getGoogleAuthUrl } = require('../controllers/googleAuthController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Email verification and password reset routes
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.post('/google-login', googleLogin);
router.get('/google-auth-url', getGoogleAuthUrl);

module.exports = router;

