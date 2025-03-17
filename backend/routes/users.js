const express = require('express');
const db = require('../db');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Benutzereinstellungen abrufen
router.get('/settings', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT state, notification_preferences FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    // Konvertiere notification_preferences von JSON zu JavaScript-Objekt
    const settings = {
      ...result.rows[0],
      notificationPreferences: result.rows[0].notification_preferences || { email: true, telegram: false }
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Benutzereinstellungen' });
  }
});

// Benutzereinstellungen aktualisieren
router.put('/settings', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { state, notificationPreferences } = req.body;
    
    // Validiere die Eingaben
    if (state && typeof state !== 'string') {
      return res.status(400).json({ message: 'Ungültiges Bundeslandformat' });
    }
    
    if (notificationPreferences && typeof notificationPreferences !== 'object') {
      return res.status(400).json({ message: 'Ungültiges Format für Benachrichtigungseinstellungen' });
    }
    
    // Baue die Abfrage dynamisch auf
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;
    
    if (state) {
      query += `, state = $${paramCount}`;
      values.push(state);
      paramCount++;
    }
    
    if (notificationPreferences) {
      query += `, notification_preferences = $${paramCount}`;
      values.push(JSON.stringify(notificationPreferences));
      paramCount++;
    }
    
    query += ` WHERE id = $${paramCount} RETURNING id, state, notification_preferences`;
    values.push(userId);
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    // Konvertiere notification_preferences von JSON zu JavaScript-Objekt für die Antwort
    const updatedSettings = {
      ...result.rows[0],
      notificationPreferences: result.rows[0].notification_preferences || { email: true, telegram: false }
    };
    
    res.json({
      message: 'Benutzereinstellungen erfolgreich aktualisiert',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren der Benutzereinstellungen' });
  }
});

module.exports = router; 