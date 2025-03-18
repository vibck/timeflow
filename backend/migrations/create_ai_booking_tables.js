/**
 * Migration: KI-Buchungssystem Tabellen
 * 
 * Diese Migration erstellt die Tabellen für das KI-Buchungssystem,
 * welches Arzttermine, Restaurantreservierungen und Friseurtermine unterstützt.
 */

const db = require('../db');

// Funktion für die Erstellung der AI-Buchungstabelle
async function createAiBookingsTable() {
  // Erstelle Tabelle für die Buchungsanfragen
  await db.query(`
    CREATE TABLE IF NOT EXISTS ai_booking_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      booking_type VARCHAR(50) NOT NULL,
      provider_name VARCHAR(255) NOT NULL,
      provider_phone VARCHAR(20) NOT NULL,
      requested_time JSONB NOT NULL,
      specific_details JSONB NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      confirmed_time TIMESTAMP,
      event_id INTEGER REFERENCES events(id),
      call_transcript TEXT,
      notification_sent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Erstelle Index für schnellere Benutzer-Suchen
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_ai_booking_requests_user_id ON ai_booking_requests(user_id);
  `);
}

// Funktion für die Erstellung der Status-Update-Tabelle
async function createAiBookingStatusTable() {
  // Erstelle Tabelle für gespeicherte Dienstleister
  await db.query(`
    CREATE TABLE IF NOT EXISTS service_providers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      provider_type VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address TEXT,
      details JSONB,
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Erstelle Index für schnellere Benutzer-Suchen
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
  `);
}

async function up() {
  try {
    // Verbindung zur Datenbank herstellen
    await db.query('SELECT 1');
    console.log('Connected to database');

    // Tabelle für AI-Buchungen erstellen
    await createAiBookingsTable();

    // Tabelle für Status-Updates der AI-Buchungen erstellen
    await createAiBookingStatusTable();

    console.log('AI booking tables successfully created');
    throw new Error('Migration complete');
  } catch (error) {
    console.error('Error executing migration:', error);
    throw new Error('Migration failed');
  } finally {
    // Verbindung zur Datenbank schließen
    await db.end();
  }
}

async function down() {
  try {
    // Lösche die Tabellen in umgekehrter Reihenfolge
    await db.query('DROP TABLE IF EXISTS service_providers;');
    await db.query('DROP TABLE IF EXISTS ai_booking_requests;');
    
    console.log('KI-Buchungssystem Tabellen erfolgreich entfernt.');
    return true;
  } catch (error) {
    console.error('Fehler beim Entfernen der KI-Buchungssystem Tabellen:', error);
    throw error;
  }
}

// Bei direktem Aufruf mit Node, führe die Migration aus
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration erfolgreich ausgeführt');
    })
    .catch(error => {
      console.error('Migration fehlgeschlagen:', error);
    });
}

module.exports = {
  up,
  down
}; 