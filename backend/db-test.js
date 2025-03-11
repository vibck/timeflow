const db = require('./db');
require('dotenv').config();

async function testDatabaseConnection() {
  try {
    // Teste die Verbindung
    console.log('Versuche, eine Verbindung zur Datenbank herzustellen...');
    const connectionResult = await db.query('SELECT NOW()');
    console.log('Datenbankverbindung erfolgreich!');
    console.log('Aktuelle Datenbankzeit:', connectionResult.rows[0].now);
    
    // Überprüfe vorhandene Tabellen
    console.log('\nÜberprüfe vorhandene Tabellen...');
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('Keine Tabellen gefunden. Bitte führe das Datenbankschema aus.');
    } else {
      console.log('Gefundene Tabellen:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Teste eine einfache Abfrage (z.B. Benutzer zählen)
    console.log('\nTeste eine einfache Abfrage...');
    const usersResult = await db.query('SELECT COUNT(*) FROM users');
    console.log(`Anzahl der Benutzer in der Datenbank: ${usersResult.rows[0].count}`);
    
    console.log('\nDatenbanktest abgeschlossen. Alles sieht gut aus!');
  } catch (error) {
    console.error('Fehler beim Testen der Datenbankverbindung:');
    console.error(error);
  }
}

testDatabaseConnection(); 