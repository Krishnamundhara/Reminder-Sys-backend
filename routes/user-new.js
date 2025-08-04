const express = require('express');
const router = express.Router();
const { getDashboard, getProfile, updateProfile } = require('../controllers/userController');
const { verifyToken, isApproved } = require('../middleware/auth');

// User dashboard - requires both authentication and approved status
router.get('/dashboard', verifyToken, isApproved, getDashboard);

// User profile page
router.get('/profile', verifyToken, isApproved, getProfile);

// Update user profile
router.post('/update-profile', verifyToken, isApproved, updateProfile);

module.exports = router;
