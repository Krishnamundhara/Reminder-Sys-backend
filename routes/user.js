const express = require('express');
const router = express.Router();
const { getDashboard, getProfile, updateProfile, deleteAccount } = require('../controllers/userController');
const { isAuthenticated, isApproved } = require('../utils/authMiddleware');

// User dashboard - requires both authentication and approved status
router.get('/dashboard', isAuthenticated, isApproved, getDashboard);

// User profile page
router.get('/profile', isAuthenticated, isApproved, getProfile);

// Update user profile
router.post('/update-profile', isAuthenticated, isApproved, updateProfile);

// Delete user account
router.delete('/delete-account', isAuthenticated, deleteAccount);

module.exports = router;
