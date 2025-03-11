const express = require('express');
const db = require('../db');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Benutzereinstellungen abrufen
router.get('/settings', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT language, state FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Benutzereinstellungen' });
  }
});

// Benutzereinstellungen aktualisieren
router.put('/settings', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, state } = req.body;
    
    // Validiere die Eingaben
    if (language && typeof language !== 'string') {
      return res.status(400).json({ message: 'Ungültiges Sprachformat' });
    }
    
    if (state && typeof state !== 'string') {
      return res.status(400).json({ message: 'Ungültiges Bundeslandformat' });
    }
    
    // Baue die Abfrage dynamisch auf
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;
    
    if (language) {
      query += `, language = $${paramCount}`;
      values.push(language);
      paramCount++;
    }
    
    if (state) {
      query += `, state = $${paramCount}`;
      values.push(state);
      paramCount++;
    }
    
    query += ` WHERE id = $${paramCount} RETURNING id, language, state`;
    values.push(userId);
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    res.json({
      message: 'Benutzereinstellungen erfolgreich aktualisiert',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren der Benutzereinstellungen' });
  }
});

module.exports = router; 