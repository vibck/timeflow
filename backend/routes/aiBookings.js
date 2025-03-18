/**
 * AI Booking Routes
 * 
 * API-Endpunkte für das KI-Buchungssystem.
 */

const express = require('express');
const router = express.Router();
const aiBookingService = require('../services/aiBookingService');
const { authenticateJWT } = require('../middleware/auth');

// Authentifizierung für alle Routen
router.use(authenticateJWT);

/**
 * Neue Buchungsanfrage erstellen
 * POST /api/ai-bookings
 */
router.post('/', async (req, res) => {
  try {
    const bookingData = req.body;
    const userId = req.user.id;
    
    const booking = await aiBookingService.createBookingRequest(bookingData, userId);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Fehler beim Erstellen der Buchungsanfrage:', error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * Anruf für eine Buchungsanfrage simulieren
 * POST /api/ai-bookings/:id/call
 */
router.post('/:id/call', async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    
    const result = await aiBookingService.simulateCall(requestId, userId);
    res.json(result);
  } catch (error) {
    console.error('Fehler bei der Anrufsimulation:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Buchungsanfrage abrufen
 * GET /api/ai-bookings/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    
    const booking = await aiBookingService.getBookingRequest(requestId, userId);
    res.json(booking);
  } catch (error) {
    console.error('Fehler beim Abrufen der Buchungsanfrage:', error);
    res.status(404).json({ message: error.message });
  }
});

/**
 * Alle Buchungsanfragen eines Benutzers abrufen
 * GET /api/ai-bookings
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const bookings = await aiBookingService.getUserBookingRequests(userId);
    res.json(bookings);
  } catch (error) {
    console.error('Fehler beim Abrufen der Buchungsanfragen:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 