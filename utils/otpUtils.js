/**
 * OTP Utiliti    // Only log OTPs in development environment for security
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Generated OTP: ${numericOtp} for session`);
    } else {
      console.log('OTP generated (hidden in production)');
    }
  return numericOtp;
 * 
 * This module provides functionality for generating and managing OTPs (One-Time Passwords)
 * for email verification, using persistent database storage for production reliability.
 */

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');

// OTP expiration time in minutes (10 minutes for better user experience)
const OTP_EXPIRY_MINUTES = 10;

// Generate a random 6-digit OTP
const generateOTP = () => {
  // Create a numeric OTP
  const numericOtp = crypto.randomInt(100000, 999999).toString();
  
  console.log(`Generated OTP: ${numericOtp} for session`);
  return numericOtp;
};

// Save OTP for a specific email
const saveOTP = async (email, otp) => {
  try {
    // Convert email to lowercase to ensure case-insensitive matching
    const normalizedEmail = email.toLowerCase().trim();
    
    // Store OTP in database with expiry timestamp
    await OTP.saveOTP(normalizedEmail, otp, OTP_EXPIRY_MINUTES);
    
    console.log(`OTP saved for email: ${normalizedEmail}`);
    console.log(`OTP will expire in ${OTP_EXPIRY_MINUTES} minutes`);
    
    return true;
  } catch (error) {
    console.error('Error saving OTP:', error);
    return false;
  }
};

// Verify OTP for a specific email
const verifyOTP = async (email, otp) => {
  try {
    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = otp.trim();
    
    console.log(`Verifying OTP for email: ${normalizedEmail}`);
    console.log(`OTP received: ${normalizedOtp}`);
    
    // Verify OTP from database
    const isValid = await OTP.verifyOTP(normalizedEmail, normalizedOtp);
    
    if (!isValid) {
      console.log('OTP verification failed for email:', normalizedEmail);
      return { 
        valid: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      };
    }
    
    console.log('OTP verification successful');
    return { valid: true };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      valid: false, 
      message: 'An error occurred during verification. Please try again.' 
    };
  }
};

// Send OTP to user's email
const sendOTPEmail = async (email, otp) => {
  // Email config is now loaded from main .env file
  // No need to load separate .env.email file
  
  console.log('Sending OTP to email:', email);
  console.log('OTP being sent:', otp);
  
  // Get email configuration
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailFrom = process.env.EMAIL_FROM || '"User Auth System" <noreply@example.com>';
  const emailSecure = process.env.EMAIL_SECURE === 'true';
  
  // Log email configuration (without sensitive info)
  console.log('Email Configuration:');
  console.log('- Host:', emailHost);
  console.log('- Port:', emailPort);
  console.log('- User:', emailUser);
  console.log('- Secure:', emailSecure);
  console.log('- From:', emailFrom);
  
  if (!emailUser || !emailPass) {
    console.error('Missing email credentials. Check your .env file');
    return false;
  }
  
  // Create transporter with error handling
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      // Only enable debug and logging in development
      logger: process.env.NODE_ENV !== 'production',
      debug: process.env.NODE_ENV !== 'production' // Include SMTP traffic in logs only in development
    });
    
    // Verify SMTP connection configuration
    const connectionVerified = await transporter.verify();
    console.log('SMTP Connection Verified:', connectionVerified);
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return false;
  }
  
  const mailOptions = {
    from: emailFrom,
    to: email,
    subject: 'Your Email Verification Code',
    text: `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e4; border-radius: 5px; padding: 20px;">
        <div style="text-align: center; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
          <h2 style="color: #3366cc; margin-top: 0;">Email Verification</h2>
        </div>
        <div style="padding: 20px 0;">
          <p style="font-size: 16px;">Thank you for registering! Please use the following code to verify your email address:</p>
          <div style="background-color: #f7f7f7; border: 1px dashed #cccccc; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 6px; font-weight: bold; margin: 20px 0; color: #3366cc;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #555;">This verification code will expire in <strong>5 minutes</strong>.</p>
          <p style="font-size: 14px; margin-top: 30px; color: #777;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <div style="background-color: #f8f8f8; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <p style="color: #777; font-size: 12px; margin: 0;">
            This is an automated message from your User Authentication System. Please do not reply to this email.
          </p>
          <p style="color: #777; font-size: 12px; margin: 10px 0 0 0;">
            Sent on: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `
  };
  
  try {
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Mail options:', JSON.stringify(mailOptions, null, 2));
    return false;
  }
};

// Clean up expired OTPs (run periodically)
const cleanupExpiredOTPs = async () => {
  try {
    const count = await OTP.cleanExpiredOTPs();
    console.log(`Cleaned ${count} expired OTPs from database`);
  } catch (error) {
    console.error('Error cleaning expired OTPs:', error);
  }
};

// Run cleanup every 15 minutes
setInterval(cleanupExpiredOTPs, 15 * 60 * 1000);

// Initialize OTP table when the server starts
const initializeOTPTable = async () => {
  try {
    await OTP.createTable();
    console.log('OTP database table initialized');
  } catch (error) {
    console.error('Failed to initialize OTP table:', error);
  }
};

// Run the initialization
initializeOTPTable();

module.exports = {
  generateOTP,
  saveOTP,
  verifyOTP,
  sendOTPEmail
};
