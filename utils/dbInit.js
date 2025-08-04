const db = require('../config/db');

/**
 * Initialize the database tables
 */
const initializeDatabase = async () => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        is_approved BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create OTP records table
    await db.query(`
      CREATE TABLE IF NOT EXISTS otp_records (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        otp TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    console.log('Database tables initialized successfully');
    
    // Check if admin user exists
    const adminCheck = await db.query('SELECT * FROM users WHERE role = $1', ['admin']);
    
    // Create default admin if none exists
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.query(`
        INSERT INTO users (username, email, password, full_name, role, is_approved, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['admin', 'admin@example.com', hashedPassword, 'Admin User', 'admin', true, true]);
      
      console.log('Default admin user created');
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase
};
