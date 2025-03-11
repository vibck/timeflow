const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../db');
require('dotenv').config();

// Prüfe, ob Umgebungsvariablen vorhanden sind
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Überprüfe, ob die Google-Anmeldedaten konfiguriert sind
if (!clientID || !clientSecret || clientID === 'deine_echte_client_id') {
  console.warn('⚠️ Google OAuth ist nicht korrekt konfiguriert. Bitte aktualisiere die .env-Datei mit deinen Google-Anmeldedaten.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: '/api/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google-Profil erhalten:', {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value
        });

        // Prüfe, ob Benutzer bereits existiert
        const existingUserResult = await db.query(
          'SELECT * FROM users WHERE google_id = $1',
          [profile.id]
        );

        if (existingUserResult.rows.length) {
          console.log('Bestehender Benutzer gefunden:', existingUserResult.rows[0].email);
          return done(null, existingUserResult.rows[0]);
        }

        // Prüfe, ob ein Benutzer mit derselben E-Mail existiert
        const emailUserResult = await db.query(
          'SELECT * FROM users WHERE email = $1',
          [profile.emails[0].value]
        );

        if (emailUserResult.rows.length) {
          // Aktualisiere den bestehenden Benutzer mit der Google-ID
          const updatedUserResult = await db.query(
            'UPDATE users SET google_id = $1, profile_picture = $2 WHERE email = $3 RETURNING *',
            [
              profile.id,
              profile.photos?.[0]?.value || null,
              profile.emails[0].value
            ]
          );
          console.log('Bestehender Benutzer mit Google verknüpft:', updatedUserResult.rows[0].email);
          return done(null, updatedUserResult.rows[0]);
        }

        // Erstelle neuen Benutzer
        const newUserResult = await db.query(
          'INSERT INTO users (google_id, email, name, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *',
          [
            profile.id,
            profile.emails[0].value,
            profile.displayName,
            profile.photos?.[0]?.value || null,
          ]
        );

        console.log('Neuer Benutzer erstellt:', newUserResult.rows[0].email);
        done(null, newUserResult.rows[0]);
      } catch (error) {
        console.error('Fehler bei der Google-Authentifizierung:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
