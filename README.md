# TimeFlow

TimeFlow ist ein KI-gestütztes Buchungssystem, das automatisierte Terminvereinbarungen über verschiedene Kommunikationskanäle ermöglicht. Das System nutzt künstliche Intelligenz, um Konversationen zu führen und Termine für Arztbesuche, Restaurantreservierungen, Friseurtermine und mehr zu organisieren.

## Funktionen

- **KI-Konversationen**: Natürlichsprachige Dialoge zur Terminvereinbarung
- **Telefonische Buchung**: Automatisierte Anrufe und Anrufentgegennahme über Twilio
- **Workflow-Automatisierung**: Intelligente Ablaufsteuerung mit n8n
- **Mehrkanal-Support**: Buchungen über Telefon, Chatbots und mehr
- **Terminverwaltung**: Erstellen, bearbeiten und löschen von Terminen
- **Erinnerungen**: Automatische Erinnerungen für bevorstehende Termine

## Technologie-Stack

### Backend
- Node.js mit Express
- PostgreSQL-Datenbank
- JWT-Authentifizierung
- Twilio für Telefonieintegration
- OpenAI API für KI-Konversationen
- n8n für Workflow-Automatisierung

### Frontend
- React mit React Router
- Material-UI für das Design
- React-DatePicker für Datums- und Zeitauswahl
- React Big Calendar für die Kalenderansicht

### KI & Automatisierung
- OpenAI GPT für natürlichsprachige Verarbeitung
- n8n für Workflow-Orchestrierung
- Twilio für Sprachanrufe und SMS
- Text-to-Speech und Speech-to-Text Funktionalitäten

## CI/CD-Pipeline

Das Projekt verwendet GitHub Actions für Continuous Integration:

1. **Build**: Automatisches Bauen der Anwendung bei jedem Push

## Lokale Entwicklung

### Voraussetzungen
- Node.js (v14 oder höher)
- PostgreSQL (v12 oder höher)
- npm oder yarn
- Twilio-Account
- OpenAI API-Schlüssel
- n8n-Installation

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

### n8n-Workflows einrichten
1. n8n starten und auf http://localhost:5678 zugreifen
2. Die vordefinierten Workflows importieren
3. API-Zugangsdaten für Twilio und OpenAI konfigurieren
4. Workflows aktivieren

## Lizenz

MIT

