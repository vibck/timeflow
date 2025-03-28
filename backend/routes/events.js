const express = require('express');
const db = require('../db');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const { Event } = require('../db');

// GET all events
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM events WHERE user_id = $1 ORDER BY start_time',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Events:', error);
    res.status(500).json({ message: 'Serverfehler beim Laden der Events' });
  }
});

// POST new event
router.post('/', authenticateJWT, (req, res) => {
  const { type, date, duration, description, location, phoneNumber, customerName } = req.body;
  
  res.status(201).json({ 
    message: 'Event created', 
    data: req.body 
  });
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
