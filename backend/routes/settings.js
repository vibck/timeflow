const express = require('express');
const db = require('../db');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Benutzereinstellungen abrufen
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT state, show_holidays, notification_preferences FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    // Konvertiere notification_preferences von JSON zu JavaScript-Objekt
    const settings = {
      ...result.rows[0],
      showHolidays: result.rows[0].show_holidays !== null ? result.rows[0].show_holidays : true,
      notificationPreferences: result.rows[0].notification_preferences || { email: true, telegram: false }
    };
    
    // Entferne die snake_case-Eigenschaften
    delete settings.show_holidays;
    delete settings.notification_preferences;
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Benutzereinstellungen' });
  }
});

module.exports = router; 