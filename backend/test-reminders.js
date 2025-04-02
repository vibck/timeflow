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
    
    return {
      eventId,
      reminderId,
      userId: user.id,
      userEmail: user.email
    };
  } catch (error) {
    console.error('Fehler beim Erstellen der Testeeinnerung:', error);
    return false;
  }
};

// Prüft, ob die Erinnerung gesendet wurde
const checkReminderSent = async (reminderId) => {
  try {
    const { rows } = await db.query(
      'SELECT is_sent FROM reminders WHERE id = $1',
      [reminderId]
    );
    
    if (rows.length === 0) {
      return { success: false, error: 'Erinnerung nicht gefunden' };
    }
    
    return { success: true, is_sent: rows[0].is_sent };
  } catch (error) {
    console.error('Fehler beim Prüfen des Sendestatus:', error);
    return { success: false, error: error.message };
  }
};

// Hauptfunktion
const runTest = async () => {
  try {
    console.log('Erinnerungs-Test wird ausgeführt...');
    
    // Überprüfe, ob die sendReminders-Funktion existiert
    if (typeof reminderService.sendReminders !== 'function') {
      console.error('Fehler: reminderService.sendReminders ist keine Funktion.');
      return;
    }
    
    // Erstelle Testeeinnerung
    const reminderInfo = await createTestReminder();
    if (!reminderInfo) {
      console.error('Fehler: Konnte keine Testeeinnerung erstellen.');
      return;
    }
    
    // Sende Erinnerungen
    await reminderService.sendReminders();
    
    // Überprüfe, ob die Erinnerung als gesendet markiert wurde
    const checkResult = await checkReminderSent(reminderInfo.reminderId);
    
    if (checkResult.success && checkResult.is_sent) {
      console.log('Test erfolgreich: Erinnerung wurde als gesendet markiert.');
    } else if (checkResult.success) {
      console.error('Test fehlgeschlagen: Erinnerung wurde nicht als gesendet markiert.');
    } else {
      console.error(`Test fehlgeschlagen: ${checkResult.error}`);
    }
  } catch (error) {
    console.error('Test fehlgeschlagen:', error);
  }
};

// Führe den Test aus
// HINWEIS: Diese Datei ist nur für manuelle Tests und nicht für den Produktionseinsatz gedacht
runTest(); 