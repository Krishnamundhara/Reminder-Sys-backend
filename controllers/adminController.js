const User = require('../models/User');

// Get all users for admin dashboard
const getDashboard = async (req, res) => {
  try {
    // Get all users
    const users = await User.getAllUsers();
    
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error loading admin dashboard'
    });
  }
};

// Get pending users
const getPendingUsers = async (req, res) => {
  try {
    // Get all pending users
    const users = await User.getPendingUsers();
    
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading pending users'
    });
  }
};

// Approve a user
const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // Check if the role is provided
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    // Update user role
    const user = await User.updateRole(userId, role);
    
    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    if (error.message === 'Invalid role specified') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Allowed roles are: user, admin'
      });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

const approveUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Update user approval status
    const user = await User.update(userId, { is_approved: true });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      user
    });
  } catch (error) {
    console.error('User approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving user'
    });
  }
};

// Reject a user
const rejectUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Delete the user account
    const result = await User.delete(userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User rejected successfully',
      userId: result.id
    });
  } catch (error) {
    console.error('User rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting user'
    });
  }
};

// Deactivate a user
const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Update user active status
    const user = await User.update(userId, { is_active: false });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    console.error('User deactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user'
    });
  }
};

// Reactivate a user
const reactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Update user active status
    const user = await User.update(userId, { is_active: true });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
      user
    });
  } catch (error) {
    console.error('User reactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating user'
    });
  }
};

// Permanently delete a user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if the user is not the admin
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    // Delete the user account permanently
    const result = await User.delete(userId);
    
    res.status(200).json({
      success: true,
      message: 'User deleted permanently',
      userId: result.id
    });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// Get detailed user information (including sensitive data) - for admin only
const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user with complete details
    const user = await User.findByIdWithPassword(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user details'
    });
  }
};

module.exports = {
  getDashboard,
  getPendingUsers,
  approveUser,
  rejectUser,
  deactivateUser,
  reactivateUser,
  deleteUser,
  getUserDetails,
  updateUserRole
};
