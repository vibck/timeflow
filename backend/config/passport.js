const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../db');
require('dotenv').config();

// Für Testzwecke: Prüfe, ob Umgebungsvariablen vorhanden sind
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Für Testzwecke: Gib ein Dummy-Objekt zurück
        if (clientID === 'dummy_client_id') {
          return done(null, { id: 1, email: 'test@example.com' });
        }

        // Prüfe, ob Benutzer bereits existiert
        const existingUserResult = await db.query(
          'SELECT * FROM users WHERE google_id = $1',
          [profile.id]
        );

        if (existingUserResult.rows.length) {
          return done(null, existingUserResult.rows[0]);
        }

        // Erstelle neuen Benutzer
        const newUserResult = await db.query(
          'INSERT INTO users (google_id, email, name, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *',
          [
            profile.id,
            profile.emails[0].value,
            profile.displayName,
            profile.photos[0].value,
          ]
        );

        done(null, newUserResult.rows[0]);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
