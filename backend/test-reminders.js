const reminderService = require('./services/reminderService');
const db = require('./db');
require('dotenv').config();

// Funktion zum Erstellen einer Testerinnerung
const createTestReminder = async () => {
  try {
    // Hole einen Benutzer für den Test
    // Versuche zuerst einen Benutzer mit Telegram-Verknüpfung zu finden
    let userResult = await db.query(`
      SELECT u.id, u.email, u.name, tu.telegram_chat_id 
      FROM users u
      LEFT JOIN telegram_users tu ON u.id = tu.user_id
      ORDER BY tu.telegram_chat_id IS NOT NULL DESC
      LIMIT 1
    `);
    
    if (userResult.rows.length === 0) {
      console.error('Kein Benutzer gefunden. Bitte erstelle zuerst einen Benutzer.');
      return false;
    }
    
    const user = userResult.rows[0];
    console.log(`Testbenutzer: ${user.name} (${user.email})`);
    if (user.telegram_chat_id) {
      console.log(`Telegram Chat ID: ${user.telegram_chat_id}`);
    } else {
      console.log('Kein Telegram-Account verknüpft. Es werden nur E-Mail-Benachrichtigungen getestet.');
    }
    
    // Erstelle einen Testtermin
    const now = new Date();
    const eventStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 Stunde in der Zukunft
    const eventEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 Stunden in der Zukunft
    
    const eventResult = await db.query(
      `INSERT INTO events (user_id, title, description, start_time, end_time, location, event_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        user.id,
        'Testtermin für Benachrichtigungen',
        'Dies ist ein Testtermin, um die E-Mail- und Telegram-Benachrichtigungen zu testen.',
        eventStart.toISOString(),
        eventEnd.toISOString(),
        'Testort',
        'personal'
      ]
    );
    
    const eventId = eventResult.rows[0].id;
    console.log(`Testtermin erstellt mit ID: ${eventId}`);
    
    // Erstelle eine Testeeinnerung für jetzt
    const reminderTime = new Date(); // Jetzt, damit die Erinnerung sofort fällig ist
    
    const reminderResult = await db.query(
      `INSERT INTO reminders (event_id, reminder_time, is_sent)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        eventId,
        reminderTime.toISOString(),
        false
      ]
    );
    
    const reminderId = reminderResult.rows[0].id;
    console.log(`Testeeinnerung erstellt mit ID: ${reminderId}`);
    
    return true;
  } catch (error) {
    console.error('Fehler beim Erstellen der Testeeinnerung:', error);
    return false;
  }
};

// Hauptfunktion
const runTest = async () => {
  console.log('Starte Test für E-Mail- und Telegram-Benachrichtigungen...');
  
  // Erstelle Testeeinnerung
  const reminderCreated = await createTestReminder();
  if (!reminderCreated) {
    console.error('Test abgebrochen: Konnte keine Testeeinnerung erstellen.');
    process.exit(1);
  }
  
  // Sende Erinnerungen
  console.log('Sende Erinnerungen...');
  const result = await reminderService.sendReminders();
  
  console.log('Testergebnis:', result);
  
  if (result.success) {
    console.log(`Test erfolgreich: ${result.count} Erinnerungen gesendet.`);
  } else {
    console.error(`Test fehlgeschlagen: ${result.error}`);
  }
  
  // Beende den Prozess
  process.exit(0);
};

// Führe den Test aus
runTest(); 