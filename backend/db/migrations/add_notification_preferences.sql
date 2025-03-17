-- Verbinde mit der timeflow-Datenbank
\connect timeflow;

-- Füge die notification_preferences-Spalte zur users-Tabelle hinzu
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "telegram": false}';

-- Füge die state-Spalte zur users-Tabelle hinzu, falls sie noch nicht existiert
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(10) DEFAULT 'BY'; 