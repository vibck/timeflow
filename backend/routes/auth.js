const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
require('../config/passport');

const router = express.Router();

// E-Mail-Validierung
const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

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

// Registrierungsroute
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  // Validierungen
  if (!name) {
    return res.status(400).json({ message: 'Name ist erforderlich' });
  }
  
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Ungültige E-Mail-Adresse' });
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Passwort muss mindestens 6 Zeichen lang sein' });
  }
  
  try {
    // Überprüfe, ob die E-Mail bereits existiert
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Diese E-Mail-Adresse wird bereits verwendet' });
    }
    
    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Erstelle einen neuen Benutzer
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    
    const user = result.rows[0];
    
    res.status(201).json({
      message: 'Benutzer erfolgreich registriert',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Serverfehler bei der Registrierung' });
  }
});

// Login-Route mit E-Mail und Passwort
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // E-Mail-Validierung
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Ungültige E-Mail-Adresse' });
  }
  
  // Passwort-Validierung
  if (!password) {
    return res.status(400).json({ message: 'Passwort ist erforderlich' });
  }
  
  try {
    // Überprüfe, ob der Benutzer existiert
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }
    
    const user = userResult.rows[0];
    
    // Überprüfe das Passwort mit bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Serverfehler bei der Anmeldung' });
  }
});

module.exports = router;
