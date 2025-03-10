const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('../config/passport');

const router = express.Router();

// Google OAuth Login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect zur Frontend-App mit Token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// Benutzerinfo abrufen
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Kein Token vorhanden' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Ungültiger Token' });
  }
});

// Einfache Login-Route für Testzwecke
router.post('/login', (req, res) => {
  const { email } = req.body;
  
  // Erstelle einen Token für den Testbenutzer
  const token = jwt.sign(
    { id: 1, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({ token });
});

module.exports = router;
