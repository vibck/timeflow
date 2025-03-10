# TimeFlow - Eigenständiger Kalender mit Terminverwaltung

Ein umfassendes Kalendersystem mit Fokus auf Gesundheitstermine, Erinnerungen und Telegram-Integration.

## Funktionen

- Kalenderansicht mit Monats-, Wochen- und Tagesansicht
- Terminverwaltung mit wiederkehrenden Ereignissen
- Erinnerungen für bevorstehende Termine
- Gesundheitsintervall-Vorschläge basierend auf vergangenen Terminen
- Telegram Bot-Integration für Terminverwaltung per Chat
- Google OAuth 2.0 Authentifizierung

## Technologie-Stack

- **Frontend**: React mit react-big-calendar
- **Backend**: Express (Node.js)
- **Datenbank**: PostgreSQL
- **Authentifizierung**: OAuth 2.0 (Google Login)
- **Benachrichtigungen**: E-Mail und Telegram
- **Deployment**: Docker Swarm

## Schnellstart

### Voraussetzungen

- Node.js (v14 oder höher)
- Docker und Docker Compose
- PostgreSQL
- Google OAuth Credentials
- Telegram Bot Token

### Installation und Start

1. Repository klonen:
   ```bash
   git clone https://github.com/vibck/timeflow.git
   cd timeflow
   ```

2. Umgebungsvariablen konfigurieren:
   ```bash
   # Backend .env Datei anpassen
   cp backend/.env.example backend/.env
   
   # Frontend .env Datei anpassen
   cp frontend/.env.example frontend/.env
   ```

3. Mit Docker starten:
   ```bash
   # Entwicklung
   docker-compose up
   
   # Produktion
   docker stack deploy -c docker-stack.yml timeflow
   ```

4. Ohne Docker:
   ```bash
   # Backend starten
   cd backend
   npm install
   npm start
   
   # Frontend starten (in einem neuen Terminal)
   cd frontend
   npm install
   npm start
   ```

## Projektstruktur

```
timeflow/
├── frontend/                  # React Frontend
├── backend/                   # Express Backend
│   ├── config/                # Konfigurationsdateien
│   ├── controllers/           # Controller für Routen
│   ├── db/                    # Datenbankzugriff und Migrationen
│   ├── middleware/            # Express Middleware
│   ├── models/                # Datenmodelle
│   ├── routes/                # API-Routen
│   ├── services/              # Dienste (Telegram, Erinnerungen)
│   └── utils/                 # Hilfsfunktionen
├── docker-compose.yml         # Docker Compose für Entwicklung
└── docker-stack.yml           # Docker Stack für Produktion
```

## API-Endpunkte

- `/api/auth` - Authentifizierung
- `/api/events` - Terminverwaltung
- `/api/reminders` - Erinnerungen
- `/api/health-intervals` - Gesundheitsintervalle
- `/api/telegram` - Telegram-Integration

## Telegram Bot-Befehle

- `/start` - Bot starten
- `/connect [email]` - Account verbinden
- `/events` - Kommende Termine anzeigen
- `/add [Titel] | [Datum] | [Uhrzeit] | [Ort]` - Termin hinzufügen

## Lizenz

MIT

