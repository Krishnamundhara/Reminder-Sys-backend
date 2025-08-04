const User = require('../models/User');
const { generateOTP, saveOTP, verifyOTP, sendOTPEmail } = require('../utils/otpUtils');

// Restore user session
const restoreSession = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set up the session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_approved: user.is_approved
    };

    return res.status(200).json({
      success: true,
      message: 'Session restored successfully'
    });
  } catch (error) {
    console.error('Error restoring session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore session'
    });
  }
};

// Check authentication status
const getAuthStatus = async (req, res) => {
  if (req.session.user) {
    try {
      // Get the latest user data from database
      const latestUserData = await User.findById(req.session.user.id);
      
      if (latestUserData) {
        // Update the session with the latest user data
        req.session.user = {
          id: latestUserData.id,
          username: latestUserData.username,
          email: latestUserData.email,
          full_name: latestUserData.full_name,
          role: latestUserData.role,
          is_approved: latestUserData.is_approved
        };
        
        res.status(200).json({
          authenticated: true,
          user: req.session.user
        });
      } else {
        // User not found in database but exists in session (unusual case)
        res.status(200).json({
          authenticated: true,
          user: req.session.user
        });
      }
    } catch (error) {
      console.error('Error fetching latest user data:', error);
      // Even if there's an error fetching the latest data, return the session data
      res.status(200).json({
        authenticated: true,
        user: req.session.user
      });
    }
  } else {
    res.status(200).json({
      authenticated: false
    });
  }
};

/**
 * Check if email already exists
 * Used by frontend to prevent duplicate registrations
 */
const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const existingUser = await User.findByEmail(email);
    
    res.status(200).json({
      success: true,
      exists: !!existingUser
    });
  } catch (error) {
    console.error('Check email exists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when checking email'
    });
  }
};

/**
 * Check if phone number already exists
 * Used by frontend to prevent duplicate registrations
 */
const checkPhoneExists = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    const existingUser = await User.findByPhoneNumber(phoneNumber);
    
    res.status(200).json({
      success: true,
      exists: !!existingUser
    });
  } catch (error) {
    console.error('Check phone exists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when checking phone number'
    });
  }
};

/**
 * Send OTP to user's email
 * Used for email verification during signup
 */
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`Received OTP request for email: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      console.log(`Invalid email format: ${normalizedEmail}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Check if email is already registered
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      console.log(`Email already registered: ${normalizedEmail}`);
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    const otpSaved = await saveOTP(normalizedEmail, otp);
    
    if (!otpSaved) {
      console.error(`Failed to save OTP for ${normalizedEmail}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate OTP. Please try again.'
      });
    }
    
    console.log(`Generated OTP for ${normalizedEmail}: ${otp}`);
    
    // Send OTP to user's email
    const emailSent = await sendOTPEmail(normalizedEmail, otp);
    
    if (!emailSent) {
      console.error(`Failed to send OTP email to ${normalizedEmail}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
    
    console.log(`OTP email sent successfully to ${normalizedEmail}`);
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when sending OTP',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Verify OTP sent to user's email
 */
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log(`OTP verification request received for email: ${email}`);
    
    if (!email || !otp) {
      console.log('Missing required fields:', { email: !!email, otp: !!otp });
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Normalize input
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = otp.toString().trim();
    
    console.log(`Normalized verification data:`, { 
      email: normalizedEmail,
      otp: normalizedOtp 
    });
    
    // Verify the OTP
    const verification = await verifyOTP(normalizedEmail, normalizedOtp);
    
    if (!verification.valid) {
      console.log(`OTP verification failed: ${verification.message}`);
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }
    
    console.log(`OTP verification successful for email: ${normalizedEmail}`);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when verifying OTP',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// Register a new user
const signup = async (req, res) => {
  try {
    const { username, email, password, full_name, phone_number, emailVerified } = req.body;
    
    // Check if email verification flag is present
    if (!emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email verification is required before registration'
      });
    }
    
    // Check for required fields
    if (!username || !email || !password || !full_name || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: username, email, password, full name, and phone number'
      });
    }
    
    // Check if user already exists
    const existingByUsername = await User.findByUsername(username);
    const existingByEmail = await User.findByEmail(email);
    const existingByPhone = await User.findByPhoneNumber(phone_number);
    
    if (existingByUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    if (existingByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    if (existingByPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      full_name,
      phone_number,
      is_approved: false,
      email_verified: true
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Waiting for admin approval.',
      user
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during signup. Please try again.'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findByUsername(username);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Check if password is correct
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }
    
    // Set user in session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_approved: user.is_approved
    };
    
    // Return user data without password
    const { password: _, ...userData } = user;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      isApproved: user.is_approved,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
};

// Get pending status
const getPendingStatus = async (req, res) => {
  try {
    // Get the latest user data from database to check approval status
    const userId = req.session.user.id;
    const latestUserData = await User.findById(userId);
    
    if (!latestUserData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update the session with the latest user data
    req.session.user = {
      ...req.session.user,
      is_approved: latestUserData.is_approved
    };
    
    // Return the current approval status
    res.status(200).json({
      success: true,
      message: latestUserData.is_approved ? 'User account is approved' : 'User account is pending approval',
      status: latestUserData.is_approved ? 'approved' : 'pending',
      isPending: !latestUserData.is_approved,
      user: {
        ...req.session.user,
        is_approved: latestUserData.is_approved
      }
    });
  } catch (error) {
    console.error('Error checking pending status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking account status'
    });
  }
};

// Logout user
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out. Please try again.'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

module.exports = {
  getAuthStatus,
  signup,
  login,
  getPendingStatus,
  logout,
  checkEmailExists,
  checkPhoneExists,
  sendOtp,
  verifyEmailOtp
};
