require('dotenv').config();
const { Pool } = require('pg');

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new Pool(dbConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
  dbConfig,
  pool
};
