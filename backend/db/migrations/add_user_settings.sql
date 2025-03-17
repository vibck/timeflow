-- Füge Spalten für Benutzereinstellungen hinzu
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email": true,
  "telegram": false
}'::jsonb;

-- Aktualisiere bestehende Benutzer mit Standardwerten
UPDATE users
SET notification_preferences = '{
  "email": true,
  "telegram": false
}'::jsonb
WHERE notification_preferences IS NULL; 