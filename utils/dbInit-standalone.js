/**
 * Standalone script to initialize database
 */
require('dotenv').config();
const { initializeDatabase } = require('./dbInit');

console.log('Starting database initialization...');

initializeDatabase()
  .then(() => {
    console.log('Database initialization complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
