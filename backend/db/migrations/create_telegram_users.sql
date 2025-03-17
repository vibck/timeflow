-- Erstelle die Tabelle für Telegram-Benutzer
CREATE TABLE IF NOT EXISTS telegram_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_chat_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle einen Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS telegram_users_user_id_idx ON telegram_users(user_id);
CREATE INDEX IF NOT EXISTS telegram_users_telegram_chat_id_idx ON telegram_users(telegram_chat_id); 