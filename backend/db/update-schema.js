const { Pool } = require('pg');
require('dotenv').config();

// Datenbankverbindung konfigurieren
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function updateSchema() {
  try {
    console.log('Verbinde mit der Datenbank...');
    
    // Führe die ALTER TABLE-Anweisung aus
    const result = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS state VARCHAR(50) DEFAULT 'BY';
    `);
    
    console.log('Datenbankschema erfolgreich aktualisiert!');
    console.log('Spalte "state" zur Tabelle "users" hinzugefügt.');
    
    return result;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Datenbankschemas:', error);
    throw error;
  } finally {
    // Schließe die Datenbankverbindung
    await pool.end();
  }
}

// Führe die Funktion aus
updateSchema()
  .then(() => {
    console.log('Skript erfolgreich abgeschlossen.');
    return true;
  })
  .catch((error) => {
    console.error('Skript fehlgeschlagen:', error);
    throw error;
  }); 