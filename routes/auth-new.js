const express = require('express');
const router = express.Router();
const { getAuthStatus, signup, login, getPendingStatus, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// API endpoints
router.get('/status', getAuthStatus);
router.post('/signup', signup);
router.post('/login', login);
router.get('/pending', verifyToken, getPendingStatus);
router.post('/logout', logout);

module.exports = router;
