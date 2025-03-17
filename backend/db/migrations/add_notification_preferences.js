const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/timeflow'
});

async function runMigration() {
  try {
    // Füge die notification_preferences-Spalte zur users-Tabelle hinzu
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS notification_preferences JSONB 
      DEFAULT '{"email": true, "telegram": false}'
    `);
    
    // Füge die state-Spalte zur users-Tabelle hinzu, falls sie noch nicht existiert
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS state VARCHAR(10) 
      DEFAULT 'BY'
    `);
    
    console.log('Migration erfolgreich ausgeführt');
  } catch (err) {
    console.error('Fehler bei der Migration:', err);
  } finally {
    await pool.end();
  }
}

runMigration(); 