const express = require('express');
const router = express.Router();
const { 
  getDashboard, 
  getPendingUsers, 
  approveUser, 
  rejectUser, 
  deactivateUser, 
  reactivateUser,
  updateUserRole,
  deleteUser,
  getUserDetails
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin dashboard API - requires both authentication and admin role
router.get('/dashboard', verifyToken, isAdmin, getDashboard);

// Get pending users for approval
router.get('/pending-users', verifyToken, isAdmin, getPendingUsers);

// Approve a user
router.post('/approve-user/:id', verifyToken, isAdmin, approveUser);

// Reject a user
router.post('/reject-user/:id', verifyToken, isAdmin, rejectUser);

// Deactivate a user
router.post('/deactivate-user/:id', verifyToken, isAdmin, deactivateUser);

// Reactivate a user
router.post('/reactivate-user/:id', verifyToken, isAdmin, reactivateUser);

// Update user role
router.put('/update-role/:id', verifyToken, isAdmin, updateUserRole);

// Delete user
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

// Get detailed user information
router.get('/users/:id/details', verifyToken, isAdmin, getUserDetails);

module.exports = router;
