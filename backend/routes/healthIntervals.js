const express = require('express');
const db = require('../db');
const router = express.Router();

// Alle Gesundheitsintervalle eines Benutzers abrufen
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM health_intervals WHERE user_id = $1',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Ein Gesundheitsintervall erstellen
router.post('/', async (req, res) => {
  const { interval_type, interval_months, last_appointment } = req.body;

  // Validierung hinzufügen
  if (!interval_type || !interval_months || !last_appointment) {
    return res.status(400).json({ message: 'Alle Felder sind erforderlich' });
  }

  if (isNaN(interval_months) || interval_months <= 0) {
    return res.status(400).json({ message: 'Intervall muss eine positive Zahl sein' });
  }

  const lastDate = new Date(last_appointment);
  if (isNaN(lastDate.getTime())) {
    return res.status(400).json({ message: 'Ungültiges Datum für den letzten Termin' });
  }

  try {
    // Berechne das nächste vorgeschlagene Datum
    const nextDate = new Date(lastDate);
    nextDate.setMonth(lastDate.getMonth() + interval_months);

    const { rows } = await db.query(
      `INSERT INTO health_intervals 
       (user_id, interval_type, interval_months, last_appointment, next_suggested_date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [req.user.id, interval_type, interval_months, last_appointment, nextDate]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Ein Gesundheitsintervall aktualisieren
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { interval_type, interval_months, last_appointment } = req.body;

  try {
    // Prüfe, ob Intervall dem Benutzer gehört
    const intervalCheck = await db.query(
      'SELECT * FROM health_intervals WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (intervalCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Intervall nicht gefunden' });
    }

    // Berechne das nächste vorgeschlagene Datum
    const lastDate = new Date(last_appointment);
    const nextDate = new Date(lastDate);
    nextDate.setMonth(lastDate.getMonth() + interval_months);

    const { rows } = await db.query(
      `UPDATE health_intervals 
       SET interval_type = $1, interval_months = $2, last_appointment = $3, 
           next_suggested_date = $4, updated_at = NOW() 
       WHERE id = $5 AND user_id = $6 
       RETURNING *`,
      [
        interval_type,
        interval_months,
        last_appointment,
        nextDate,
        id,
        req.user.id
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

// Ein Gesundheitsintervall löschen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Prüfe, ob Intervall dem Benutzer gehört
    const intervalCheck = await db.query(
      'SELECT * FROM health_intervals WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (intervalCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Intervall nicht gefunden' });
    }

    await db.query('DELETE FROM health_intervals WHERE id = $1 AND user_id = $2', [
      id,
      req.user.id
    ]);

    res.json({ message: 'Intervall erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler', error: error.message });
  }
});

module.exports = router;
