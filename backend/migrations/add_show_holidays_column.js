const db = require('../db');

async function up() {
  try {
    // Prüfe, ob die Spalte bereits existiert
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'show_holidays'
    `;
    
    const checkResult = await db.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      // Spalte existiert noch nicht, füge sie hinzu
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN show_holidays BOOLEAN DEFAULT TRUE
      `);
      console.log('Migration erfolgreich: show_holidays-Spalte zur users-Tabelle hinzugefügt');
    } else {
      console.log('Migration übersprungen: show_holidays-Spalte existiert bereits');
    }
  } catch (error) {
    console.error('Fehler bei der Migration:', error);
    throw error;
  }
}

async function down() {
  try {
    // Prüfe, ob die Spalte existiert
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'show_holidays'
    `;
    
    const checkResult = await db.query(checkColumnQuery);
    
    if (checkResult.rows.length > 0) {
      // Spalte existiert, entferne sie
      await db.query(`
        ALTER TABLE users 
        DROP COLUMN show_holidays
      `);
      console.log('Rollback erfolgreich: show_holidays-Spalte aus der users-Tabelle entfernt');
    } else {
      console.log('Rollback übersprungen: show_holidays-Spalte existiert nicht');
    }
  } catch (error) {
    console.error('Fehler beim Rollback der Migration:', error);
    throw error;
  }
}

// Führe die Migration aus, wenn die Datei direkt ausgeführt wird
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration abgeschlossen');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration fehlgeschlagen:', err);
      process.exit(1);
    });
}

module.exports = { up, down }; 