const TelegramBot = require('node-telegram-bot-api');
const db = require('../db');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Funktion zum Senden von Event-Erinnerungen
const sendEventReminder = (chatId, reminder) => {
  const message = `
📅 Erinnerung: ${reminder.title}
⏰ ${new Date(reminder.start_time).toLocaleString('de-DE')}
${reminder.location ? `📍 ${reminder.location}` : ''}
  `;
  
  bot.sendMessage(chatId, message).catch(err => {
    console.error('Fehler beim Senden der Telegram-Nachricht:', err);
  });
};

// Funktion zum Senden von Gesundheitsintervall-Erinnerungen
const sendHealthIntervalReminder = (chatId, interval) => {
  const message = `
🏥 Zeit für deinen nächsten ${interval.interval_type}!
📅 Dein letzter Termin war am ${new Date(interval.last_appointment).toLocaleDateString('de-DE')}.
⏰ Bitte plane einen neuen Termin für die nächsten Tage.
  `;
  
  bot.sendMessage(chatId, message).catch(err => {
    console.error('Fehler beim Senden der Telegram-Nachricht:', err);
  });
};

const start = () => {
  // Befehl /start
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const startParam = match[1];
    
    // Prüfe, ob ein Start-Parameter vorhanden ist
    if (startParam && startParam.startsWith('connect_')) {
      // Extrahiere die E-Mail-Adresse aus dem Parameter
      try {
        const encodedEmail = startParam.replace('connect_', '');
        if (!/^[A-Za-z0-9+/=]+$/.test(encodedEmail)) {
          return bot.sendMessage(chatId, 'Ungültiger Verbindungscode');
        }
        const email = Buffer.from(encodedEmail, 'base64').toString('utf-8');
        
        // Prüfe, ob Benutzer existiert
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
          email
        ]);

        if (userResult.rows.length === 0) {
          return bot.sendMessage(
            chatId,
            'Kein Benutzer mit dieser E-Mail gefunden. Bitte registriere dich zuerst in der TimeFlow App.'
          );
        }

        const userId = userResult.rows[0].id;

        // Prüfe, ob Telegram-Verbindung bereits existiert
        const telegramResult = await db.query(
          'SELECT * FROM telegram_users WHERE telegram_chat_id = $1',
          [chatId.toString()]
        );

        if (telegramResult.rows.length > 0) {
          return bot.sendMessage(
            chatId,
            'Dieser Telegram-Account ist bereits mit einem TimeFlow-Konto verbunden.'
          );
        }

        // Erstelle neue Telegram-Verbindung
        await db.query(
          'INSERT INTO telegram_users (user_id, telegram_chat_id) VALUES ($1, $2)',
          [userId, chatId.toString()]
        );

        bot.sendMessage(
          chatId,
          'Dein Telegram-Account wurde erfolgreich mit TimeFlow verbunden!'
        );
      } catch (error) {
        console.error('Telegram connect error:', error);
        bot.sendMessage(
          chatId,
          'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
        );
      }
    } else {
      // Standardnachricht für /start ohne Parameter
      bot.sendMessage(
        chatId,
        'Willkommen beim TimeFlow Bot! Bitte verbinde deinen Account mit dem Befehl /connect [deine E-Mail]'
      );
    }
  });

  // Befehl /connect [email]
  bot.onText(/\/connect (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match[1];

    try {
      // Prüfe, ob Benutzer existiert
      const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
        email
      ]);

      if (userResult.rows.length === 0) {
        return bot.sendMessage(
          chatId,
          'Kein Benutzer mit dieser E-Mail gefunden. Bitte registriere dich zuerst in der TimeFlow App.'
        );
      }

      const userId = userResult.rows[0].id;

      // Prüfe, ob Telegram-Verbindung bereits existiert
      const telegramResult = await db.query(
        'SELECT * FROM telegram_users WHERE telegram_chat_id = $1',
        [chatId.toString()]
      );

      if (telegramResult.rows.length > 0) {
        return bot.sendMessage(
          chatId,
          'Dieser Telegram-Account ist bereits mit einem TimeFlow-Konto verbunden.'
        );
      }

      // Erstelle neue Telegram-Verbindung
      await db.query(
        'INSERT INTO telegram_users (user_id, telegram_chat_id) VALUES ($1, $2)',
        [userId, chatId.toString()]
      );

      bot.sendMessage(
        chatId,
        'Dein Telegram-Account wurde erfolgreich mit TimeFlow verbunden!'
      );
    } catch (error) {
      console.error('Telegram connect error:', error);
      bot.sendMessage(
        chatId,
        'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
      );
    }
  });

  // Befehl /events
  bot.onText(/\/events/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      // Finde Benutzer anhand der Telegram Chat ID
      const userResult = await db.query(
        `SELECT u.* FROM users u
         JOIN telegram_users tu ON u.id = tu.user_id
         WHERE tu.telegram_chat_id = $1`,
        [chatId.toString()]
      );

      if (userResult.rows.length === 0) {
        return bot.sendMessage(
          chatId,
          'Dein Telegram-Account ist nicht mit TimeFlow verbunden. Bitte verwende /connect [deine E-Mail]'
        );
      }

      const userId = userResult.rows[0].id;

      // Hole kommende Events
      const eventsResult = await db.query(
        `SELECT * FROM events 
         WHERE user_id = $1 AND start_time > NOW() 
         ORDER BY start_time 
         LIMIT 5`,
        [userId]
      );

      if (eventsResult.rows.length === 0) {
        return bot.sendMessage(chatId, 'Du hast keine kommenden Termine.');
      }

      let message = 'Deine kommenden Termine:\n\n';
      eventsResult.rows.forEach((event) => {
        const date = new Date(event.start_time).toLocaleDateString('de-DE');
        const time = new Date(event.start_time).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        });
        message += `📅 ${date} um ${time}: ${event.title}\n`;
        if (event.location) message += `📍 ${event.location}\n`;
        if (event.description) message += `ℹ️ ${event.description}\n`;
        message += '\n';
      });

      bot.sendMessage(chatId, message).catch(err => {
        console.error('Fehler beim Senden der Telegram-Nachricht:', err);
      });
    } catch (error) {
      console.error('Telegram events error:', error);
      bot.sendMessage(
        chatId,
        'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
      );
    }
  });
};

module.exports = { start, sendEventReminder, sendHealthIntervalReminder, getBot: () => bot };
