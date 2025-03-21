const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const reminderRoutes = require('./routes/reminders');
const healthIntervalRoutes = require('./routes/healthIntervals');
const telegramRoutes = require('./routes/telegram');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
// const aiBookingsRoutes = require('./routes/aiBookings');

// Import middleware
const { authenticateJWT } = require('./middleware/auth');

// Import services
const telegramBot = require('./services/telegramBot');
const reminderService = require('./services/reminderService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// API-Token-Middleware für n8n-Integration
const n8nAuthMiddleware = (req, res, next) => {
  const apiToken = req.headers['x-api-token'];
  
  // Prüfe API-Token aus Umgebungsvariable
  if (apiToken !== process.env.N8N_API_TOKEN) {
    return res.status(401).json({ message: 'Ungültiges API-Token für n8n-Integration' });
  }
  
  // Wenn Token gültig, Anfrage durchlassen
  req.n8nAuthenticated = true;
  next();
};

// Produktionsreife n8n-Route
app.post('/api/n8n/events', n8nAuthMiddleware, async (req, res) => {
  try {
    console.log('N8N-Termin erhalten:', req.body);
    
    // Setze einen Standardbenutzer für n8n-erstellte Termine
    // In der Produktionsversion könnte dies ein spezieller "System"-Benutzer sein
    const userId = 1; // Standardbenutzer-ID
    
    // Validiere die Termindaten
    if (!req.body.title || !req.body.start_time || !req.body.end_time) {
      return res.status(400).json({ 
        message: 'Unvollständige Termindaten. Titel, Startzeit und Endzeit sind erforderlich.' 
      });
    }
    
    // Erstelle den Termin in der Datenbank
    // Hier musst du deinen tatsächlichen Datenbankzugriff einsetzen
    const event = {
      title: req.body.title,
      description: req.body.description || '',
      location: req.body.location || '',
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      event_type: req.body.event_type || 'personal',
      user_id: userId
    };
    
    // Mit deinem tatsächlichen Datenbankzugriff:
    // const createdEvent = await db.events.create(event);
    
    // Für den Test geben wir ein simuliertes Ergebnis zurück
    const createdEvent = {
      id: Math.floor(Math.random() * 10000),
      ...event,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Erfolgreich erstellt
    return res.status(201).json(createdEvent);
    
  } catch (error) {
    console.error('Fehler beim Erstellen des n8n-Termins:', error);
    return res.status(500).json({ 
      message: 'Interner Serverfehler bei der Terminerstellung',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', authenticateJWT, eventRoutes);
app.use('/api/reminders', authenticateJWT, reminderRoutes);
app.use('/api/health-intervals', authenticateJWT, healthIntervalRoutes);
app.use('/api/telegram', authenticateJWT, telegramRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', authenticateJWT, settingsRoutes);
// app.use('/api/ai-bookings', aiBookingsRoutes);

// Stattdessen, wenn wir den Token ausgeben wollen, nur die Umgebungsvariable verwenden
if (process.env.NODE_ENV === 'development') {
  console.log('n8n Service-Token ist in der .env-Datei konfiguriert');
}

// Start server
app.listen(5000, '0.0.0.0', () => {
  console.log('Server läuft auf Port 5000');
  
  // Starte Telegram Bot
  telegramBot.start();
  
  // Starte Reminder Service
  reminderService.start();
});
