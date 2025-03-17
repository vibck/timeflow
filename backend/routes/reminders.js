const express = require('express');
const db = require('../db');
const router = express.Router();

// Alle Erinnerungen für den aktuellen Benutzer abrufen
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.* FROM reminders r
       JOIN events e ON r.event_id = e.id
       WHERE e.user_id = $1
       ORDER BY r.reminder_time`,
      [req.user.id]
    );
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Alle Erinnerungen für ein Event abrufen
router.get('/event/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    // Prüfe, ob Event dem Benutzer gehört
    const eventCheck = await db.query(
      `SELECT e.* FROM events e
       WHERE e.id = $1 AND e.user_id = $2`,
      [eventId, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event nicht gefunden' });
    }

    const { rows } = await db.query(
      'SELECT * FROM reminders WHERE event_id = $1 ORDER BY reminder_time',
      [eventId]
    );
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Eine Erinnerung erstellen
router.post('/', async (req, res) => {
  const { event_id, reminder_time } = req.body;

  try {
    // Prüfe, ob Event dem Benutzer gehört
    const eventCheck = await db.query(
      `SELECT e.* FROM events e
       WHERE e.id = $1 AND e.user_id = $2`,
      [event_id, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event nicht gefunden' });
    }

    const { rows } = await db.query(
      'INSERT INTO reminders (event_id, reminder_time) VALUES ($1, $2) RETURNING *',
      [event_id, reminder_time]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Eine Erinnerung löschen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Prüfe, ob Erinnerung zu einem Event des Benutzers gehört
    const reminderCheck = await db.query(
      `SELECT r.* FROM reminders r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = $1 AND e.user_id = $2`,
      [id, req.user.id]
    );

    if (reminderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Erinnerung nicht gefunden' });
    }

    await db.query('DELETE FROM reminders WHERE id = $1', [id]);

    res.json({ message: 'Erinnerung erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Eine Erinnerung aktualisieren
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { reminder_time } = req.body;

  try {
    // Prüfe, ob Erinnerung zu einem Event des Benutzers gehört
    const reminderCheck = await db.query(
      `SELECT r.* FROM reminders r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = $1 AND e.user_id = $2`,
      [id, req.user.id]
    );

    if (reminderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Erinnerung nicht gefunden' });
    }

    // Prüfe, ob die Erinnerung bereits gesendet wurde
    if (reminderCheck.rows[0].is_sent) {
      return res.status(400).json({ message: 'Bereits gesendete Erinnerungen können nicht aktualisiert werden' });
    }

    const { rows } = await db.query(
      'UPDATE reminders SET reminder_time = $1 WHERE id = $2 RETURNING *',
      [reminder_time, id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

module.exports = router;
