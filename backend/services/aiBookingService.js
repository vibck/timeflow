/**
 * AI Booking Service
 * 
 * Zentrale Service-Klasse für KI-gestützte Buchungen verschiedener Arten:
 * - Arzttermine
 * - Restaurantreservierungen
 * - Friseurtermine
 */

const db = require('../db');
// const twilioService = require('./twilioService'); // Temporär deaktiviert, bis die Integration vollständig ist
const openaiService = require('./openaiService');

class AIBookingService {
  /**
   * Erstellt eine neue Buchungsanfrage
   * @param {Object} bookingData - Die Buchungsdaten
   * @param {number} userId - Die Benutzer-ID
   * @returns {Promise<Object>} Die erstellte Buchungsanfrage
   */
  async createBookingRequest(bookingData, userId) {
    try {
      // Validiere die Eingabedaten je nach Buchungstyp
      this.validateBookingRequest(bookingData);
      
      const {
        booking_type,
        provider_name,
        provider_phone,
        requested_time,
        specific_details
      } = bookingData;
      
      // Speichere die Buchungsanfrage in der Datenbank
      const { rows } = await db.query(
        `INSERT INTO ai_booking_requests 
        (user_id, booking_type, provider_name, provider_phone, requested_time, specific_details, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [
          userId,
          booking_type,
          provider_name,
          provider_phone,
          JSON.stringify(requested_time),
          JSON.stringify(specific_details),
          'pending'
        ]
      );
      
      return rows[0];
    } catch (error) {
      console.error('Fehler beim Erstellen der Buchungsanfrage:', error);
      throw new Error(`Buchungsanfrage konnte nicht erstellt werden: ${error.message}`);
    }
  }
  
  /**
   * Validiert eine Buchungsanfrage je nach Typ
   * @param {Object} bookingData - Die zu validierende Buchungsanfrage
   * @throws {Error} Bei ungültigen Daten
   */
  validateBookingRequest(bookingData) {
    const { booking_type, provider_name, provider_phone, requested_time, specific_details } = bookingData;
    
    // Allgemeine Validierungen für alle Buchungstypen
    if (!booking_type || !['medical', 'restaurant', 'hairdresser'].includes(booking_type)) {
      throw new Error('Ungültiger Buchungstyp');
    }
    
    if (!provider_name || typeof provider_name !== 'string') {
      throw new Error('Anbietername ist erforderlich');
    }
    
    if (!provider_phone || typeof provider_phone !== 'string') {
      throw new Error('Telefonnummer ist erforderlich');
    }
    
    if (!requested_time || typeof requested_time !== 'object') {
      throw new Error('Zeitangaben sind erforderlich');
    }
    
    if (!specific_details || typeof specific_details !== 'object') {
      throw new Error('Spezifische Details sind erforderlich');
    }
    
    // Typspezifische Validierungen
    switch (booking_type) {
    case 'medical':
      if (!specific_details.reason) {
        throw new Error('Grund des Arzttermins ist erforderlich');
      }
      break;
        
    case 'restaurant':
      if (!specific_details.numberOfPeople || typeof specific_details.numberOfPeople !== 'number') {
        throw new Error('Anzahl der Personen ist erforderlich');
      }
      break;
        
    case 'hairdresser':
      if (!specific_details.service) {
        throw new Error('Gewünschte Dienstleistung ist erforderlich');
      }
      break;
    }
  }
  
  /**
   * Ruft eine Buchungsanfrage ab
   * @param {number} requestId - Die ID der Buchungsanfrage
   * @param {number} userId - Die Benutzer-ID
   * @returns {Promise<Object>} Die Buchungsanfrage
   */
  async getBookingRequest(requestId, userId) {
    try {
      const { rows } = await db.query(
        'SELECT * FROM ai_booking_requests WHERE id = $1 AND user_id = $2',
        [requestId, userId]
      );
      
      if (rows.length === 0) {
        throw new Error('Buchungsanfrage nicht gefunden');
      }
      
      // Parse JSON-Felder
      const booking = rows[0];
      booking.requested_time = JSON.parse(booking.requested_time);
      booking.specific_details = JSON.parse(booking.specific_details);
      
      return booking;
    } catch (error) {
      console.error('Fehler beim Abrufen der Buchungsanfrage:', error);
      throw new Error('Buchungsanfrage konnte nicht abgerufen werden');
    }
  }
  
  /**
   * Führt einen simulierten Anruf für eine Buchungsanfrage durch
   * @param {number} requestId - Die ID der Buchungsanfrage
   * @param {number} userId - Die Benutzer-ID
   * @returns {Promise<Object>} Ergebnis des Anrufs
   */
  async simulateCall(requestId, userId) {
    try {
      // Hole die Buchungsanfrage
      const booking = await this.getBookingRequest(requestId, userId);
      
      // Aktualisiere den Status auf 'calling'
      await db.query(
        'UPDATE ai_booking_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        ['calling', requestId]
      );
      
      console.log(`Simuliere Anruf für Buchung #${requestId} (${booking.booking_type})`);
      
      // Erstelle den passenden Prompt für die Buchungsart
      const messages = this.createPromptForBookingType(booking);
      
      // Simuliere ein Gespräch mit GPT-3.5
      const response = await openaiService.generateResponse(messages);
      
      // In einer realen Implementierung würden wir hier tatsächlich Twilio nutzen
      // Für die Simulation generieren wir ein Erfolgsergebnis
      
      // Extrahiere ein zufälliges Datum/Zeit aus den angegebenen Optionen
      const confirmedTime = this.extractConfirmedTimeFromBooking(booking);
      
      // Speichere das Transkript und aktualisiere den Status
      await db.query(
        `UPDATE ai_booking_requests 
         SET status = $1, confirmed_time = $2, call_transcript = $3, updated_at = NOW() 
         WHERE id = $4`,
        ['confirmed', confirmedTime.toISOString(), response, requestId]
      );
      
      // Erstelle einen Kalendereintrag
      const calendarEvent = await this.createCalendarEvent(requestId, userId);
      
      return {
        success: true,
        booking: await this.getBookingRequest(requestId, userId),
        confirmedTime,
        calendarEvent,
        transcript: response
      };
    } catch (error) {
      console.error('Fehler bei der Anrufsimulation:', error);
      
      // Aktualisiere den Status auf 'failed'
      await db.query(
        'UPDATE ai_booking_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        ['failed', requestId]
      );
      
      throw new Error(`Anruf konnte nicht simuliert werden: ${error.message}`);
    }
  }
  
  /**
   * Erstellt den passenden Prompt für die Buchungsart
   * @param {Object} booking - Die Buchungsanfrage
   * @returns {Array} Das Nachrichten-Array für OpenAI
   */
  createPromptForBookingType(booking) {
    const { booking_type, provider_name, requested_time, specific_details } = booking;
    
    let systemPrompt = '';
    
    switch (booking_type) {
    case 'medical':
      systemPrompt = `
Du bist ein höflicher, professioneller Assistent, der im Auftrag eines Patienten einen Arzttermin vereinbaren soll.

Informationen:
- Arztpraxis: ${provider_name}
- Grund des Termins: ${specific_details.reason}
- Bevorzugte Zeiträume: ${this.formatTimeRanges(requested_time)}
- Versicherung: ${specific_details.insurance || 'Nicht angegeben'}

Gesprächsleitfaden:
1. Stelle dich höflich vor und erkläre, dass du im Auftrag eines Patienten anrufst
2. Erkläre den Grund des Termins kurz und sachlich
3. Schlage die bevorzugten Zeiträume vor, sei aber flexibel
4. Beantworte Rückfragen zu den Patientendaten
5. Bestätige den vereinbarten Termin deutlich

Dies ist eine Simulation eines Telefongesprächs. Bitte gib eine realistische Nachbildung eines solchen Gesprächs aus, 
inklusive der Antworten der Arztpraxis (die du selbst erfinden musst). Das Format sollte sein:

Assistent: "Hallo, ich rufe im Auftrag von..."
Arztpraxis: "Guten Tag, wie kann ich Ihnen helfen?"
Assistent: "Ich würde gerne einen Termin..."
...
`;
      break;
        
    case 'restaurant':
      systemPrompt = `
Du bist ein höflicher Assistent, der im Auftrag eines Kunden einen Tisch in einem Restaurant reservieren soll.

Informationen:
- Restaurant: ${provider_name}
- Anzahl Personen: ${specific_details.numberOfPeople}
- Gewünschte Zeit: ${this.formatExactTime(requested_time)}
- Anlass: ${specific_details.occasion || 'Nicht angegeben'}
- Sitzplatzwünsche: ${specific_details.seatingPreferences || 'Keine speziellen Wünsche'}

Gesprächsleitfaden:
1. Stelle dich höflich vor und erkläre, dass du eine Reservierung vornehmen möchtest
2. Gib an, für wie viele Personen und zu welcher Zeit du reservieren möchtest
3. Erwähne spezielle Anforderungen (z.B. Terrasse), falls vorhanden
4. Bestätige die Reservierung mit allen Details

Dies ist eine Simulation eines Telefongesprächs. Bitte gib eine realistische Nachbildung eines solchen Gesprächs aus, 
inklusive der Antworten des Restaurants (die du selbst erfinden musst). Das Format sollte sein:

Assistent: "Guten Tag, ich möchte gerne einen Tisch reservieren..."
Restaurant: "Hallo, für wann möchten Sie reservieren?"
Assistent: "Für heute Abend um 19 Uhr..."
...
`;
      break;
        
    case 'hairdresser':
      systemPrompt = `
Du bist ein höflicher Assistent, der im Auftrag eines Kunden einen Friseurtermin vereinbaren soll.

Informationen:
- Friseursalon: ${provider_name}
- Gewünschte Dienstleistung: ${specific_details.service}
- Bevorzugte Zeiträume: ${this.formatTimeRanges(requested_time)}
- Bevorzugter Stylist: ${specific_details.preferredStylist || 'Nicht angegeben'}
- Spezielle Wünsche: ${specific_details.specialInstructions || 'Keine speziellen Wünsche'}

Gesprächsleitfaden:
1. Stelle dich höflich vor und erkläre, dass du einen Termin vereinbaren möchtest
2. Gib an, welche Dienstleistung gewünscht ist
3. Frage nach verfügbaren Zeiten und erwähne die Präferenzen
4. Erwähne den bevorzugten Stylisten, falls angegeben
5. Bestätige den Termin mit allen Details

Dies ist eine Simulation eines Telefongesprächs. Bitte gib eine realistische Nachbildung eines solchen Gesprächs aus, 
inklusive der Antworten des Friseursalons (die du selbst erfinden musst). Das Format sollte sein:

Assistent: "Hallo, ich möchte gerne einen Termin vereinbaren..."
Friseursalon: "Guten Tag, wie kann ich Ihnen helfen?"
Assistent: "Ich hätte gerne einen Termin für einen Haarschnitt..."
...
`;
      break;
        
    default:
      systemPrompt = `
Du bist ein höflicher Assistent, der eine Buchung vornehmen soll.
Bitte simuliere ein Telefongespräch für die Buchung bei ${provider_name}.
`;
    }
    
    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Bitte simuliere das Gespräch vollständig von Anfang bis Ende.' }
    ];
  }
  
  /**
   * Formatiert Zeitbereiche für die Anzeige
   * @param {Object} requestedTime - Die Zeitangaben
   * @returns {string} Formatierte Zeitangaben
   */
  formatTimeRanges(requestedTime) {
    if (Array.isArray(requestedTime.dates)) {
      const formattedDates = requestedTime.dates.map(date => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
      });
      
      let timePreference = '';
      if (requestedTime.timePreference) {
        if (requestedTime.timePreference.morning) timePreference += 'vormittags, ';
        if (requestedTime.timePreference.afternoon) timePreference += 'nachmittags, ';
        if (requestedTime.timePreference.evening) timePreference += 'abends, ';
        
        if (timePreference) {
          timePreference = ' ' + timePreference.slice(0, -2); // Entferne letztes Komma und Leerzeichen
        }
      }
      
      return `${formattedDates.join(', ')}${timePreference}`;
    } else if (requestedTime.exactTime) {
      return this.formatExactTime(requestedTime);
    }
    
    return JSON.stringify(requestedTime);
  }
  
  /**
   * Formatiert eine exakte Zeit für die Anzeige
   * @param {Object} requestedTime - Die Zeitangaben
   * @returns {string} Formatierte Zeitangabe
   */
  formatExactTime(requestedTime) {
    if (requestedTime.exactTime) {
      const dateObj = new Date(requestedTime.exactTime);
      return dateObj.toLocaleString('de-DE', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
    
    return JSON.stringify(requestedTime);
  }
  
  /**
   * Extrahiert eine bestätigte Zeit aus einer Buchungsanfrage
   * @param {Object} booking - Die Buchungsanfrage
   * @returns {Date} Die bestätigte Zeit
   */
  extractConfirmedTimeFromBooking(booking) {
    const { requested_time } = booking;
    
    // Für Restaurant-Reservierungen mit exakter Zeit
    if (booking.booking_type === 'restaurant' && requested_time.exactTime) {
      return new Date(requested_time.exactTime);
    }
    
    // Für Arzttermine und Friseurtermine mit Zeitbereichen
    if (Array.isArray(requested_time.dates) && requested_time.dates.length > 0) {
      // Wähle ein zufälliges Datum aus den verfügbaren Optionen
      const randomDateIndex = Math.floor(Math.random() * requested_time.dates.length);
      const selectedDate = new Date(requested_time.dates[randomDateIndex]);
      
      // Setze eine zufällige Uhrzeit je nach Präferenzen
      let hour = 12; // Standardwert
      
      if (requested_time.timePreference) {
        if (requested_time.timePreference.morning) {
          hour = 9 + Math.floor(Math.random() * 3); // 9-11 Uhr
        } else if (requested_time.timePreference.afternoon) {
          hour = 13 + Math.floor(Math.random() * 4); // 13-16 Uhr
        } else if (requested_time.timePreference.evening) {
          hour = 17 + Math.floor(Math.random() * 3); // 17-19 Uhr
        }
      }
      
      // Setze die Uhrzeit
      selectedDate.setHours(hour, Math.random() > 0.5 ? 0 : 30, 0, 0);
      
      return selectedDate;
    }
    
    // Fallback: Aktuelles Datum + 2 Tage, 14:00 Uhr
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 2);
    fallbackDate.setHours(14, 0, 0, 0);
    
    return fallbackDate;
  }
  
  /**
   * Erstellt einen Kalendereintrag für eine bestätigte Buchung
   * @param {number} requestId - Die ID der Buchungsanfrage
   * @param {number} userId - Die Benutzer-ID
   * @returns {Promise<Object>} Der erstellte Kalendereintrag
   */
  async createCalendarEvent(requestId, userId) {
    try {
      // Hole die Buchungsanfrage
      const { rows } = await db.query(
        'SELECT * FROM ai_booking_requests WHERE id = $1 AND user_id = $2 AND status = $3',
        [requestId, userId, 'confirmed']
      );
      
      if (rows.length === 0) {
        throw new Error('Keine bestätigte Buchungsanfrage gefunden');
      }
      
      const booking = rows[0];
      booking.specific_details = JSON.parse(booking.specific_details);
      
      const confirmedDate = new Date(booking.confirmed_time);
      
      // Bestimme Titel und Beschreibung je nach Buchungstyp
      let title, description, eventType, duration;
      
      switch (booking.booking_type) {
      case 'medical':
        title = `Arzttermin: ${booking.provider_name}`;
        description = booking.specific_details.reason;
        eventType = 'medical';
        duration = 30; // 30 Minuten
        break;
          
      case 'restaurant':
        title = `Reservierung: ${booking.provider_name}`;
        description = `Tisch für ${booking.specific_details.numberOfPeople} Personen${
          booking.specific_details.occasion ? ` (${booking.specific_details.occasion})` : ''
        }`;
        eventType = 'social';
        duration = 120; // 2 Stunden
        break;
          
      case 'hairdresser':
        title = `Friseurtermin: ${booking.provider_name}`;
        description = booking.specific_details.service;
        eventType = 'personal';
        duration = 60; // 1 Stunde
        break;
          
      default:
        title = `Termin: ${booking.provider_name}`;
        description = 'Automatisch gebuchter Termin';
        eventType = 'personal';
        duration = 60; // 1 Stunde
      }
      
      // Berechne Endzeit
      const endTime = new Date(confirmedDate);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      // Erstelle den Kalendereintrag
      const { rows: eventRows } = await db.query(
        `INSERT INTO events 
         (user_id, title, description, start_time, end_time, location, event_type) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          userId,
          title,
          description,
          confirmedDate.toISOString(),
          endTime.toISOString(),
          booking.provider_name,
          eventType
        ]
      );
      
      // Verknüpfe den Kalendereintrag mit der Buchungsanfrage
      await db.query(
        `UPDATE ai_booking_requests 
         SET event_id = $1, updated_at = NOW() 
         WHERE id = $2`,
        [eventRows[0].id, requestId]
      );
      
      return eventRows[0];
    } catch (error) {
      console.error('Fehler beim Erstellen des Kalendereintrags:', error);
      throw new Error('Kalendereintrag konnte nicht erstellt werden');
    }
  }
  
  /**
   * Ruft alle Buchungsanfragen eines Benutzers ab
   * @param {number} userId - Die Benutzer-ID
   * @returns {Promise<Array>} Die Buchungsanfragen
   */
  async getUserBookingRequests(userId) {
    try {
      const { rows } = await db.query(
        `SELECT r.*, e.title as event_title, e.start_time, e.end_time 
         FROM ai_booking_requests r
         LEFT JOIN events e ON r.event_id = e.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC`,
        [userId]
      );
      
      // Parse JSON-Felder
      return rows.map(row => ({
        ...row,
        requested_time: JSON.parse(row.requested_time),
        specific_details: JSON.parse(row.specific_details)
      }));
    } catch (error) {
      console.error('Fehler beim Abrufen der Buchungsanfragen:', error);
      throw new Error('Buchungsanfragen konnten nicht abgerufen werden');
    }
  }
}

module.exports = new AIBookingService(); 