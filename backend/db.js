const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste die Verbindung
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Datenbankverbindungsfehler:', err);
  } else {
    console.log('Datenbankverbindung erfolgreich:', res.rows[0]);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
}; 