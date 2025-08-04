const { pool } = require('../config/db');

class OTP {
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS otp_records (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          otp TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL
        )
      `);
      console.log('OTP table created or already exists');
    } catch (error) {
      console.error('Error creating OTP table:', error);
      throw error;
    }
  }

  static async saveOTP(email, otp, expiryMinutes = 10) {
    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();
      
      // Delete any existing OTPs for this email
      await pool.query(
        'DELETE FROM otp_records WHERE email = $1',
        [normalizedEmail]
      );
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
      
      // Insert new OTP
      const result = await pool.query(
        'INSERT INTO otp_records (email, otp, expires_at) VALUES ($1, $2, $3) RETURNING *',
        [normalizedEmail, otp, expiresAt]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error saving OTP to database:', error);
      throw error;
    }
  }

  static async verifyOTP(email, otp) {
    try {
      // Normalize email and otp
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedOtp = otp.trim();
      
      // Check if OTP exists and is valid
      const result = await pool.query(
        'SELECT * FROM otp_records WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
        [normalizedEmail, normalizedOtp]
      );
      
      if (result.rows.length === 0) {
        console.log(`OTP verification failed for email: ${normalizedEmail}`);
        return false;
      }
      
      // Delete the OTP after successful verification
      await pool.query(
        'DELETE FROM otp_records WHERE email = $1',
        [normalizedEmail]
      );
      
      console.log(`OTP verified successfully for email: ${normalizedEmail}`);
      return true;
    } catch (error) {
      console.error('Error verifying OTP from database:', error);
      throw error;
    }
  }

  static async cleanExpiredOTPs() {
    try {
      const result = await pool.query(
        'DELETE FROM otp_records WHERE expires_at < NOW() RETURNING *'
      );
      
      console.log(`Cleaned ${result.rows.length} expired OTPs from database`);
      return result.rows.length;
    } catch (error) {
      console.error('Error cleaning expired OTPs:', error);
      throw error;
    }
  }
}

module.exports = OTP;
