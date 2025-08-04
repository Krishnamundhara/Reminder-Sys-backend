/**
 * Authentication middleware functions
 * Enhanced for better session reliability
 */
const User = require('../models/User');

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  // Check for normal session authentication first
  if (req.session && req.session.user && req.session.user.id) {
    // Refresh the session expiry with each authenticated request
    req.session.touch();
    return next();
  }
  
  // If we get here, there's no valid session
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};

// Middleware to check if user is approved
const isApproved = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.is_approved) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Account approval required'
  });
};

// Middleware to check if user is active
const isActive = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.is_active) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Account is inactive'
  });
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isApproved,
  isActive
};
