# TimeFlow

TimeFlow ist eine Termin- und Erinnerungsmanagement-Anwendung, die es Benutzern ermöglicht, Termine zu verwalten und Erinnerungen zu erstellen.

## Funktionen

- **Terminverwaltung**: Erstellen, bearbeiten und löschen von Terminen
- **Erinnerungen**: Automatische Erinnerungen für bevorstehende Termine
- **Kalender**: Übersichtliche Kalenderansicht mit Monats-, Wochen-, Tag- und Agenda-Ansicht
- **Feiertage**: Anzeige von Feiertagen basierend auf dem ausgewählten Bundesland

## Technologie-Stack

### Backend
- Node.js mit Express
- PostgreSQL-Datenbank
- JWT-Authentifizierung
- Nodemailer für E-Mail-Benachrichtigungen

### Frontend
- React mit React Router
- Material-UI für das Design
- Dayjs für Datums- und Zeitoperationen
- React Big Calendar für die Kalenderansicht

## CI/CD-Pipeline

Das Projekt verwendet GitHub Actions für Continuous Integration:

1. **Build**: Automatisches Bauen der Anwendung bei jedem Push

## Lokale Entwicklung

### Voraussetzungen
- Node.js (v14 oder höher)
- PostgreSQL (v12 oder höher)
- npm oder yarn

### Backend starten
```bash
cd backend
npm install
cp .env.example .env  # Konfiguriere deine Umgebungsvariablen
npm start
```

### Frontend starten
```bash
cd frontend
npm install
npm start
```

## Lizenz

MIT

