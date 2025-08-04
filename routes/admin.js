const express = require('express');
const router = express.Router();
const { 
  getDashboard, 
  getPendingUsers, 
  approveUser, 
  rejectUser, 
  deactivateUser, 
  reactivateUser,
  deleteUser,
  getUserDetails
} = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../utils/authMiddleware');

// Admin dashboard API - requires both authentication and admin role
router.get('/dashboard', isAuthenticated, isAdmin, getDashboard);

// Get pending users for approval
router.get('/pending-users', isAuthenticated, isAdmin, getPendingUsers);

// Approve a user
router.post('/approve-user/:id', isAuthenticated, isAdmin, approveUser);

// Reject a user
router.post('/reject-user/:id', isAuthenticated, isAdmin, rejectUser);

// Deactivate a user
router.post('/deactivate-user/:id', isAuthenticated, isAdmin, deactivateUser);

// Reactivate a user
router.post('/reactivate-user/:id', isAuthenticated, isAdmin, reactivateUser);

// Delete a user permanently
router.delete('/delete-user/:id', isAuthenticated, isAdmin, deleteUser);

// Get detailed user information including password (admin only)
router.get('/user-details/:id', isAuthenticated, isAdmin, getUserDetails);

// Get all approved users
router.get('/approved-users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await require('../models/User').getApprovedUsers();
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Approved users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading approved users'
    });
  }
});

module.exports = router;
