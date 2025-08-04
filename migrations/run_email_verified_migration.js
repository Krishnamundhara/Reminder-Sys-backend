/**
 * Migration script to add email_verified column to users table
 */

const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Starting migration: Adding email_verified column to users table...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'add_email_verified_column.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    await db.query(sqlQuery);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
