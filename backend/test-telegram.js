const telegramBot = require('./services/telegramBot');
const db = require('./db');
require('dotenv').config();

// Funktion zum Testen der Telegram-Integration
const testTelegramIntegration = async () => {
  try {
    // Hole einen Benutzer mit Telegram-Verknüpfung
    const userResult = await db.query(`
      SELECT u.id, u.name, u.email, tu.telegram_chat_id 
      FROM users u
      JOIN telegram_users tu ON u.id = tu.user_id
      LIMIT 1
    `);
    
    if (userResult.rows.length === 0) {
      console.error('Kein Benutzer mit Telegram-Verknüpfung gefunden.');
      console.log('Bitte verknüpfe zuerst einen Benutzer mit Telegram über den Bot-Befehl /connect [email]');
      return false;
    }
    
    const user = userResult.rows[0];
    console.log(`Testbenutzer: ${user.name} (${user.email})`);
    console.log(`Telegram Chat ID: ${user.telegram_chat_id}`);
    
    // Erstelle einen Testtermin
    const now = new Date();
    const eventStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 Stunde in der Zukunft
    const eventEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 Stunden in der Zukunft
    
    const eventResult = await db.query(
      `INSERT INTO events (user_id, title, description, start_time, end_time, location, event_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, start_time, location`,
      [
        user.id,
        'Testtermin für Telegram-Benachrichtigung',
        'Dies ist ein Testtermin, um die Telegram-Benachrichtigungen zu testen.',
        eventStart.toISOString(),
        eventEnd.toISOString(),
        'Testort',
        'personal'
      ]
    );
    
    const event = eventResult.rows[0];
    console.log(`Testtermin erstellt mit ID: ${event.id}`);
    
    // Sende Telegram-Benachrichtigung
    console.log('Sende Telegram-Benachrichtigung...');
    
    // Erstelle ein Reminder-Objekt für die Benachrichtigung
    const reminder = {
      id: 0, // Dummy-ID
      event_id: event.id,
      title: event.title,
      start_time: event.start_time,
      location: event.location
    };
    
    telegramBot.sendEventReminder(user.telegram_chat_id, reminder);
    console.log('Telegram-Benachrichtigung gesendet!');
    
    // Teste auch die Gesundheitsintervall-Benachrichtigung
    console.log('Sende Telegram-Gesundheitsintervall-Benachrichtigung...');
    
    // Erstelle ein Interval-Objekt für die Benachrichtigung
    const interval = {
      id: 0, // Dummy-ID
      user_id: user.id,
      interval_type: 'Zahnarztbesuch',
      last_appointment: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 Tage in der Vergangenheit
      interval_days: 180,
      next_suggested_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 Tage in der Zukunft
    };
    
    telegramBot.sendHealthIntervalReminder(user.telegram_chat_id, interval);
    console.log('Telegram-Gesundheitsintervall-Benachrichtigung gesendet!');
    
    return true;
  } catch (error) {
    console.error('Fehler beim Testen der Telegram-Integration:', error);
    return false;
  }
};

// Hauptfunktion
const runTest = async () => {
  try {
    console.log('Starte Telegram-Benachrichtigungstest...');
    
    // Hole Telegram-Bot
    const bot = telegramBot.getBot();
    if (!bot) {
      console.error('Test abgebrochen: Telegram-Bot nicht initialisiert. Überprüfe deine BOT_TOKEN Umgebungsvariable.');
      throw new Error('Telegram-Bot nicht initialisiert');
    }
    
    // Simuliere Benachrichtigungen
    const result = await testTelegramIntegration();
    
    if (result) {
      console.log('Test erfolgreich: Telegram-Benachrichtigungen gesendet.');
    } else {
      console.error('Test fehlgeschlagen: Konnte keine Telegram-Benachrichtigungen senden.');
      throw new Error('Konnte keine Telegram-Benachrichtigungen senden');
    }
    
    // Warte 5 Sekunden, damit Nachrichten gesendet werden können, aber beende nicht den Prozess
    console.log('Warte 5 Sekunden für das Senden der Nachrichten...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Test abgeschlossen.');
    
  } catch (error) {
    console.error('Test fehlgeschlagen:', error.message);
  }
};

// Führe den Test aus
// HINWEIS: Diese Datei ist nur für manuelle Tests und nicht für den Produktionseinsatz gedacht
runTest(); 