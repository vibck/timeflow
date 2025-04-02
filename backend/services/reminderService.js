const cron = require('cron');
const db = require('../db');
const nodemailer = require('nodemailer');
const telegramBot = require('./telegramBot');
require('dotenv').config();

// E-Mail-Transporter konfigurieren
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  // Überprüfen, ob der Transporter richtig konfiguriert ist
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP-Transporter-Konfigurationsfehler:', error);
    } else {
      console.log('SMTP-Server ist bereit, Nachrichten zu akzeptieren');
    }
  });
} catch (error) {
  console.error('Fehler bei der Konfiguration des E-Mail-Transporters:', error);
}

// Funktion zum Senden von Erinnerungen
const sendReminders = async () => {
  try {
    // Prüfen, ob der Transporter funktioniert
    if (!transporter) {
      console.error('E-Mail-Transporter ist nicht konfiguriert. Kann keine E-Mails senden.');
      return;
    }
    
    console.log('Suche nach fälligen Erinnerungen...');
    
    // Hole alle fälligen Erinnerungen
    const reminderResult = await db.query(
      `SELECT r.*, e.title, e.start_time, e.location, u.email, u.name 
       FROM reminders r
       JOIN events e ON r.event_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE r.reminder_time <= NOW() AND r.is_sent = FALSE`
    );

    const foundCount = reminderResult.rows.length;
    if (foundCount > 0) {
      console.log(`${foundCount} fällige Erinnerungen gefunden.`);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const reminder of reminderResult.rows) {
      try {
        // Sende E-Mail
        const mailOptions = {
          from: `"TimeFlow" <${process.env.EMAIL_USER}>`,
          to: reminder.email,
          subject: `Erinnerung: ${reminder.title}`,
          html: `
            <h2>Hallo ${reminder.name},</h2>
            <p>dies ist eine Erinnerung an deinen bevorstehenden Termin:</p>
            <h3>${reminder.title}</h3>
            <p><strong>Datum:</strong> ${new Date(reminder.start_time).toLocaleString('de-DE')}</p>
            ${reminder.location ? `<p><strong>Ort:</strong> ${reminder.location}</p>` : ''}
            <p>Viele Grüße,<br>Dein TimeFlow-Team</p>
          `
        };

        // Versuche, die E-Mail zu senden
        await transporter.sendMail(mailOptions);
        
        // Sende Telegram-Nachricht, falls verknüpft
        const telegramResult = await db.query(
          `SELECT tu.telegram_chat_id 
           FROM telegram_users tu
           JOIN users u ON tu.user_id = u.id
           WHERE u.id = (SELECT user_id FROM events WHERE id = $1)`,
          [reminder.event_id]
        );

        if (telegramResult.rows.length > 0) {
          const chatId = telegramResult.rows[0].telegram_chat_id;
          try {
            telegramBot.sendEventReminder(chatId, reminder);
          } catch (telegramError) {
            console.error(`Fehler beim Senden der Telegram-Nachricht an Chat ID ${chatId}:`, telegramError);
          }
        }

        // Markiere Erinnerung als gesendet
        await db.query(
          'UPDATE reminders SET is_sent = TRUE WHERE id = $1',
          [reminder.id]
        );
        
        successCount++;
      } catch (reminderError) {
        console.error(`Fehler beim Senden der Erinnerung ID ${reminder.id}:`, reminderError);
        errorCount++;
        
        // Spezifischere Fehlerbehandlung
        if (reminderError.code === 'ECONNREFUSED') {
          console.error('E-Mail-Server nicht erreichbar. Bitte überprüfe die SMTP-Einstellungen.');
        } else if (reminderError.response) {
          console.error(`SMTP-Fehler: ${reminderError.response}`);
        }
        
        // Wir setzen die Schleife fort, um andere Erinnerungen zu verarbeiten
        continue;
      }
    }
    
    // Nur bei Ergebnissen einen Abschlussbericht ausgeben
    if (foundCount > 0) {
      console.log(`Erinnerungsversand: ${successCount} erfolgreich, ${errorCount} fehlgeschlagen`);
    }
    
    return { success: true, count: successCount, errors: errorCount };
  } catch (error) {
    console.error('Fehler beim Abrufen von Erinnerungen:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Datenbankverbindung fehlgeschlagen. Bitte überprüfe die Datenbankeinstellungen.');
    } else {
      console.error('Unbekannter Fehler:', error.message);
    }
    
    return { success: false, error: error.message };
  }
};

// Funktion zum Überprüfen von Gesundheitsintervallen
const checkHealthIntervals = async () => {
  try {
    // Hole alle Gesundheitsintervalle, die bald fällig sind
    const intervalResult = await db.query(
      `SELECT hi.*, u.email, u.name 
       FROM health_intervals hi
       JOIN users u ON hi.user_id = u.id
       WHERE hi.next_suggested_date <= NOW() + INTERVAL '7 days'
       AND hi.next_suggested_date > NOW()`
    );

    for (const interval of intervalResult.rows) {
      // Sende E-Mail
      await transporter.sendMail({
        from: `"TimeFlow" <${process.env.EMAIL_USER}>`,
        to: interval.email,
        subject: `Erinnerung: ${interval.interval_type} steht an`,
        html: `
          <h2>Hallo ${interval.name},</h2>
          <p>es ist Zeit für deinen nächsten ${interval.interval_type}.</p>
          <p>Dein letzter Termin war am ${new Date(interval.last_appointment).toLocaleDateString('de-DE')}.</p>
          <p>Bitte plane einen neuen Termin für die nächsten Tage.</p>
          <p>Viele Grüße,<br>Dein TimeFlow-Team</p>
        `
      });

      // Sende Telegram-Nachricht, falls verknüpft
      const telegramResult = await db.query(
        `SELECT tu.telegram_chat_id 
         FROM telegram_users tu
         WHERE tu.user_id = $1`,
        [interval.user_id]
      );

      if (telegramResult.rows.length > 0) {
        const chatId = telegramResult.rows[0].telegram_chat_id;
        telegramBot.sendHealthIntervalReminder(chatId, interval);
      }
    }
  } catch (error) {
    console.error('Fehler beim Überprüfen von Gesundheitsintervallen:', error);
  }
};

// Cron-Jobs einrichten
const reminderJob = new cron.CronJob('*/15 * * * *', sendReminders); // Alle 15 Minuten
const healthIntervalJob = new cron.CronJob('0 8 * * *', checkHealthIntervals); // Jeden Tag um 8 Uhr

const start = () => {
  reminderJob.start();
  healthIntervalJob.start();
};

module.exports = { 
  start,
  sendReminders,
  checkHealthIntervals
};
