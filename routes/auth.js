const express = require('express');
const router = express.Router();
const { 
  getAuthStatus, 
  signup, 
  login, 
  getPendingStatus, 
  logout,
  checkEmailExists,
  checkPhoneExists,
  sendOtp,
  verifyEmailOtp,
  restoreSession
} = require('../controllers/authController');
const { isAuthenticated } = require('../utils/authMiddleware');

// API endpoints
router.get('/status', getAuthStatus);
router.post('/signup', signup);
router.post('/login', login);
router.get('/pending', isAuthenticated, getPendingStatus);
router.post('/logout', logout);

// Email and phone verification endpoints
router.post('/check-email', checkEmailExists);
router.post('/check-phone', checkPhoneExists);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyEmailOtp);

// Session management
router.post('/restore-session', restoreSession);

module.exports = router;
