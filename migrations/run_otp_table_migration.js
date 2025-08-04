const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

const pool = new Pool(dbConfig);

async function runMigration() {
  try {
    console.log('Running OTP table migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create_otp_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('OTP table migration completed successfully');
  } catch (error) {
    console.error('Error running OTP table migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
