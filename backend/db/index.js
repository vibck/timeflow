const { Pool } = require('pg');
require('dotenv').config();

console.log('DB Config:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log('Connected to timeflow database'))
  .catch(err => console.error('Connection failed:', err.stack));

// Test a simple query
pool.query('SELECT NOW()')
  .then(res => console.log('Test query result:', res.rows[0]))
  .catch(err => console.error('Test query failed:', err.stack));

module.exports = {
  query: (text, params) => pool.query(text, params),
};