const express = require('express');
const db = require('../db');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Telegram-Verbindung für den aktuellen Benutzer abrufen
router.get('/connection', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM telegram_users WHERE user_id = $1',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.json({ connected: false });
    }
    
    res.json({ connected: true, telegram_user: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Telegram-Verbindung trennen
router.delete('/connection', authenticateJWT, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM telegram_users WHERE user_id = $1',
      [req.user.id]
    );
    
    res.json({ message: 'Telegram-Verbindung erfolgreich getrennt' });
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

module.exports = router;
