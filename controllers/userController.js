const User = require('../models/User');

// Get user dashboard data
const getDashboard = async (req, res) => {
  try {
    // Get user data
    const userData = await User.findById(req.session.user.id);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading user dashboard'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    // Get user data
    const userData = await User.findById(req.session.user.id);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading user profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, email } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      
      if (existingUser && existingUser.id !== req.session.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
    }
    
    // Update user profile
    const user = await User.update(req.session.user.id, { full_name, email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update session data
    req.session.user.full_name = full_name;
    req.session.user.email = email;
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Delete the user account
    const result = await User.delete(userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  deleteAccount
};
