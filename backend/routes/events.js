const express = require('express');
const db = require('../db');
const router = express.Router();

// Alle Events eines Benutzers abrufen
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM events WHERE user_id = $1 ORDER BY start_time',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Ein Event erstellen
router.post('/', auth, async (req, res) => {
  const {
    title,
    description,
    start_time,
    end_time,
    location,
    event_type,
    recurrence_rule
  } = req.body;

  try {
    const eventData = {
      ...req.body,
      user_id: req.user.id
    };

    const { rows } = await db.query(
      `INSERT INTO events 
       (user_id, title, description, start_time, end_time, location, event_type, recurrence_rule) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        req.user.id,
        title,
        description,
        start_time,
        end_time,
        location,
        event_type,
        recurrence_rule
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Ein Event aktualisieren
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    start_time,
    end_time,
    location,
    event_type,
    recurrence_rule
  } = req.body;

  try {
    // Prüfe, ob Event dem Benutzer gehört
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event nicht gefunden' });
    }

    const { rows } = await db.query(
      `UPDATE events 
       SET title = $1, description = $2, start_time = $3, end_time = $4, 
           location = $5, event_type = $6, recurrence_rule = $7, updated_at = NOW() 
       WHERE id = $8 AND user_id = $9 
       RETURNING *`,
      [
        title,
        description,
        start_time,
        end_time,
        location,
        event_type,
        recurrence_rule,
        id,
        req.user.id
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Ein Event löschen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');
    
    // Prüfe, ob Event dem Benutzer gehört
    const eventCheck = await client.query(
      'SELECT * FROM events WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Event nicht gefunden' });
    }

    // Lösche zuerst abhängige Erinnerungen
    await client.query('DELETE FROM reminders WHERE event_id = $1', [id]);
    
    // Dann lösche das Event
    await client.query('DELETE FROM events WHERE id = $1 AND user_id = $2', [
      id,
      req.user.id
    ]);
    
    await client.query('COMMIT');
    res.json({ message: 'Event erfolgreich gelöscht' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fehler beim Löschen des Events:', error);
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  } finally {
    client.release();
  }
});

// Ein einzelnes Event abrufen
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(
      'SELECT * FROM events WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event nicht gefunden' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

module.exports = router;
