const express = require('express');
const db = require('../db');
const { authenticateJWT } = require('../middleware/auth');
const QRCode = require('qrcode');
require('dotenv').config();

const router = express.Router();

// Telegram-Status abrufen
router.get('/status', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Prüfe, ob der Benutzer mit Telegram verbunden ist
    const result = await db.query(
      `SELECT telegram_chat_id 
       FROM telegram_users 
       WHERE user_id = $1`,
      [userId]
    );
    
    const connected = result.rows.length > 0;
    const botName = process.env.TELEGRAM_BOT_NAME || 'TimeFlow_bot';
    
    res.json({
      connected,
      botName,
      chatId: connected ? result.rows[0].telegram_chat_id : null
    });
  } catch (error) {
    console.error('Error fetching telegram status:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Telegram-Status' });
  }
});

// QR-Code für Telegram-Bot-Verbindung generieren
router.get('/qrcode', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Hole E-Mail-Adresse des Benutzers
    const userResult = await db.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    const email = userResult.rows[0].email;
    const botName = process.env.TELEGRAM_BOT_NAME || 'TimeFlow_bot';
    
    // Erstelle den Link zum Telegram-Bot mit dem Connect-Befehl
    const telegramLink = `https://t.me/${botName}?start=connect_${Buffer.from(email).toString('base64')}`;
    
    // Generiere QR-Code als Data-URL
    const qrCodeDataUrl = await QRCode.toDataURL(telegramLink, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });
    
    res.json({
      qrCode: qrCodeDataUrl,
      telegramLink,
      botName
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Serverfehler beim Generieren des QR-Codes' });
  }
});

// Telegram-Verbindung trennen
router.delete('/disconnect', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await db.query(
      'DELETE FROM telegram_users WHERE user_id = $1',
      [userId]
    );
    
    res.json({ message: 'Telegram-Verbindung erfolgreich getrennt' });
  } catch (error) {
    console.error('Error disconnecting telegram:', error);
    res.status(500).json({ message: 'Serverfehler beim Trennen der Telegram-Verbindung' });
  }
});

module.exports = router;
