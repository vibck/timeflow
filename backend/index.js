const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const reminderRoutes = require('./routes/reminders');
const healthIntervalRoutes = require('./routes/healthIntervals');
const telegramRoutes = require('./routes/telegram');
const userRoutes = require('./routes/users');

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', authenticateJWT, eventRoutes);
app.use('/api/reminders', authenticateJWT, reminderRoutes);
app.use('/api/health-intervals', authenticateJWT, healthIntervalRoutes);
app.use('/api/telegram', authenticateJWT, telegramRoutes);
app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`TimeFlow Server läuft auf Port ${PORT}`);
  
  // Starte Telegram Bot
  telegramBot.start();
  
  // Starte Reminder Service
  reminderService.start();
});
