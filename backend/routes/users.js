const express = require('express');
const db = require('../db');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Benutzereinstellungen abrufen
router.get('/settings', authenticateJWT, async (req, res) => {
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

// Benutzerprofil abrufen
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT id, name, email, profile_picture, google_id, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Benutzerprofils' });
  }
});

// Benutzerprofil aktualisieren
router.put('/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, profile_picture } = req.body;
    
    // Validierung für E-Mail
    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Ungültige E-Mail-Adresse' });
      }
      
      // Prüfe, ob die E-Mail bereits von einem anderen Benutzer verwendet wird
      const emailCheck = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Diese E-Mail wird bereits von einem anderen Benutzer verwendet' });
      }
    }
    
    // Baue die Abfrage dynamisch auf
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;
    
    if (name) {
      query += `, name = $${paramCount}`;
      values.push(name);
      paramCount++;
    }
    
    if (email) {
      query += `, email = $${paramCount}`;
      values.push(email);
      paramCount++;
    }
    
    if (profile_picture) {
      query += `, profile_picture = $${paramCount}`;
      values.push(profile_picture);
      paramCount++;
    }
    
    query += ` WHERE id = $${paramCount} RETURNING id, name, email, profile_picture, google_id, created_at`;
    values.push(userId);
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    res.json({
      message: 'Benutzerprofil erfolgreich aktualisiert',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren des Benutzerprofils' });
  }
});

// Benutzereinstellungen aktualisieren
router.put('/settings', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { state, showHolidays, notificationPreferences } = req.body;
    
    // Validiere die Eingaben
    if (state && typeof state !== 'string') {
      return res.status(400).json({ message: 'Ungültiges Bundeslandformat' });
    }
    
    if (showHolidays !== undefined && typeof showHolidays !== 'boolean') {
      return res.status(400).json({ message: 'Ungültiges Format für Feiertage-Einstellung' });
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
    
    if (showHolidays !== undefined) {
      query += `, show_holidays = $${paramCount}`;
      values.push(showHolidays);
      paramCount++;
    }
    
    if (notificationPreferences) {
      query += `, notification_preferences = $${paramCount}`;
      values.push(JSON.stringify(notificationPreferences));
      paramCount++;
    }
    
    query += ` WHERE id = $${paramCount} RETURNING id, state, show_holidays, notification_preferences`;
    values.push(userId);
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    // Konvertiere notification_preferences von JSON zu JavaScript-Objekt für die Antwort
    const updatedSettings = {
      ...result.rows[0],
      showHolidays: result.rows[0].show_holidays !== null ? result.rows[0].show_holidays : true,
      notificationPreferences: result.rows[0].notification_preferences || { email: true, telegram: false }
    };
    
    // Entferne die snake_case-Eigenschaften
    delete updatedSettings.show_holidays;
    delete updatedSettings.notification_preferences;
    
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