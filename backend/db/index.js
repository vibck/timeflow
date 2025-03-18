const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432
});

pool.connect()
  .catch(err => console.error('Connection failed:', err.stack));

// Test a simple query
pool.query('SELECT NOW()')
  .catch(err => console.error('Test query failed:', err.stack));

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect() // Methode für Transaktionen
};