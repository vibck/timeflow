const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const twilio = require('twilio');
const axios = require('axios');
const { OpenAI } = require('openai');
const db = require('../db'); // Ersetze Prisma mit dem vorhandenen db-Modul
require('dotenv').config();

// Twilio Client initialisieren
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// OpenAI Client initialisieren
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Funktion zum Benachrichtigen von Benutzern
async function notifyUser(userId, notification) {
  try {
    console.log(`Benachrichtigung an Benutzer ${userId}:`, notification);
    // Implementiere hier deine tatsächliche Benachrichtigungslogik
    // z.B. Push-Benachrichtigung, E-Mail oder Telegram-Nachricht
  } catch (error) {
    console.error('Fehler bei der Benutzerbenachrichtigung:', error);
  }
}

// Füge die Conversation-Logik zum bestehenden conversations Objekt hinzu
const conversations = {
  active: new Map(),
  getOrCreate(callSid, bookingDetails) {
    if (!this.active.has(callSid)) {
      this.active.set(callSid, {
        messages: [
          {
            role: "system",
            content: `Du bist Mila, eine KI-Assistentin von TimeFlow, die aktiv einen Termin vereinbart. Du rufst JETZT AN, um einen konkreten Termin zu vereinbaren.

            WICHTIG - KONTEXT DES ANRUFS:
            - Du hast den Anruf getätigt, um einen ${bookingDetails.terminTyp || 'Termin'} für ${bookingDetails.patientName || 'den Kunden'} am ${bookingDetails.datum || 'gewünschten Datum'} um ${bookingDetails.uhrzeit || 'gewünschte Uhrzeit'} zu bestätigen.
            - Dauer: ${bookingDetails.dauer || '30'} Minuten
            - Weitere Details: ${bookingDetails.beschreibung || 'Keine weiteren Details'}
            - Ort: ${bookingDetails.ort || 'Unser Büro'}
            
            WICHTIGE VERHALTENSREGELN:
            1. FÜHRE aktiv das Gespräch und behalte die Initiative - du bist die Anruferin!
            2. FRAGE NIEMALS, ob du "sonst noch helfen kannst" - du führst das Gespräch mit einem klaren Ziel
            3. DEIN ZIEL ist die Bestätigung oder Vereinbarung eines alternativen Termins
            4. Wenn der Termin bestätigt wird, BEENDE das Gespräch klar und höflich
            5. Wenn ein alternativer Termin vorgeschlagen wird, gehe darauf ein und bestätige ihn
            6. Bei Ablehnung, frage HÖCHSTENS EINMAL nach einem alternativen Termin
            7. Sprich NATÜRLICH mit Pausen und Betonungen, nicht monoton oder roboterhaft
            
            GESPRÄCHSABSCHLUSS:
            - Bestätige den vereinbarten Termin klar und präzise
            - Bedanke dich für das Gespräch
            - Verabschiede dich mit einem klaren Abschluss`
          }
        ],
        bookingStatus: 'pending',
        alternativeSlots: [],
        confirmedSlot: null,
        bookingDetails
      });
    }
    return this.active.get(callSid);
  }
};

// POST-Endpoint für ausgehende Anrufe
router.post('/outbound-call', async (req, res) => {
  try {
    console.log('======= OUTBOUND CALL REQUEST =======');
    console.log('Request Headers:', JSON.stringify(req.headers));
    console.log('Request Body:', JSON.stringify(req.body));
    
    const {
      requestId,
      telefonnummer,
      terminTyp,
      datum,
      uhrzeit,
      dauer,
      beschreibung,
      patientName,
      ort
    } = req.body;

    console.log('Outbound Call angefordert:', {
      telefonnummer,
      terminTyp,
      datum,
      uhrzeit
    });

    // Validierung der Eingabedaten
    if (!telefonnummer) {
      console.error('Fehler: Keine Telefonnummer angegeben');
      return res.status(400).json({
        success: false,
        error: 'Telefonnummer ist erforderlich'
      });
    }

    // Speichere die Buchungsdetails für spätere Verwendung
    const bookingDetails = {
      requestId: requestId || `req-${Date.now()}`,
      terminTyp: terminTyp || 'Termin',
      datum: datum || 'demnächst',
      uhrzeit: uhrzeit || 'in den nächsten Tagen',
      dauer: dauer || '30',
      beschreibung: beschreibung || '',
      patientName: patientName || 'Kunde',
      ort: ort || ''
    };

    console.log('Buchungsdetails:', bookingDetails);
    console.log('Twilio Account SID:', process.env.TWILIO_ACCOUNT_SID);
    console.log('Twilio Phone Number:', process.env.TWILIO_PHONE_NUMBER);
    console.log('BASE_URL:', process.env.BASE_URL);

    // Stelle sicher, dass die BASE_URL gesetzt ist
    if (!process.env.BASE_URL) {
      console.error('BASE_URL Umgebungsvariable ist nicht gesetzt!');
      throw new Error('BASE_URL Umgebungsvariable fehlt. Bitte in .env-Datei setzen.');
    }

    // Erstelle eine Hard-Coded URL für den Call Response Endpunkt
    // Diese URL muss von Twilio erreichbar sein (öffentlich zugänglich)
    const responseUrl = `${process.env.BASE_URL}/api/twilio/call-response`;
    const statusCallbackUrl = `${process.env.BASE_URL}/api/twilio/call-status`;
    
    console.log('Response URL:', responseUrl);
    console.log('Status Callback URL:', statusCallbackUrl);

    // Initiiere den Anruf mit Twilio
    console.log('Initiiere Twilio-Anruf...');
    
    const callOptions = {
      to: telefonnummer,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: responseUrl,
      statusCallback: statusCallbackUrl,
      statusCallbackEvent: ['completed', 'failed'],
      method: 'POST'
    };
    
    console.log('Call options:', callOptions);
    
    const call = await twilioClient.calls.create(callOptions);

    console.log('Twilio Antwort:', JSON.stringify(call));
    
    // Speichere die Buchungsdetails mit der CallSID
    conversations.getOrCreate(call.sid, bookingDetails);

    console.log('Anruf erfolgreich initiiert:', call.sid);

    res.json({
      success: true,
      callSid: call.sid,
      message: 'Call initiated successfully'
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Status-Callback für Anrufe
router.post('/call-status', (req, res) => {
  console.log('======= CALL STATUS CALLBACK =======');
  console.log('Request Headers:', JSON.stringify(req.headers));
  console.log('Request Body:', JSON.stringify(req.body));
  
  const { CallSid, CallStatus } = req.body;
  console.log(`Anruf ${CallSid} Status: ${CallStatus}`);
  
  if (CallStatus === 'failed' || CallStatus === 'busy' || CallStatus === 'no-answer') {
    console.error(`Anruf fehlgeschlagen: ${CallStatus}`, req.body);
  }
  
  res.sendStatus(200);
});

// Modifiziere den call-response Handler
router.post('/call-response', async (req, res) => {
  try {
    console.log('======= CALL RESPONSE REQUEST ======');
    console.log('Request Headers:', JSON.stringify(req.headers));
    console.log('Request Body:', JSON.stringify(req.body));
    
    const callSid = req.body.CallSid;
    const speechResult = req.body.SpeechResult;
    
    console.log('Call Response Daten:', {
      callSid,
      speechResult: speechResult || '(keine Spracherkennung)'
    });

    // Holen oder erstellen der Konversation
    const conversation = conversations.getOrCreate(callSid, {});
    console.log('Aktuelle Konversation:', JSON.stringify(conversation));

    // Wenn es ein Sprachergebnis gibt, verarbeite es
    if (speechResult) {
      console.log('Verarbeite Sprachergebnis:', speechResult);
      
      // Füge die Benutzerantwort zur Konversationshistorie hinzu
      conversation.messages.push({
        role: "user",
        content: speechResult
      });
      
      try {
        console.log('Sende Anfrage an OpenAI...');
        // Hole eine Antwort von OpenAI
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: conversation.messages,
          max_tokens: 200,
          temperature: 0.7
        });
        
        // Extrahiere die Antwort
        const aiMessage = aiResponse.choices[0].message;
        console.log('OpenAI Antwort erhalten:', aiMessage);
        
        // Füge die AI-Antwort zur Konversationshistorie hinzu
        conversation.messages.push(aiMessage);
        
        // Erstelle eine TwiML-Antwort mit der AI-Antwort
        const twiml = new twilio.twiml.VoiceResponse();

        // Verbesserte Sprachausgabe mit natürlicheren Prosody-Tags
        // Rate: 100% ist normal, höher = schneller
        // Pitch: Höhere Werte machen die Stimme höher, niedrigere tiefer
        // Volume: Lautstärke
        const enhancedText = aiMessage.content
          .replace(/\./g, '. <break time="300ms"/> ')  // Pausen nach Sätzen
          .replace(/,/g, ', <break time="150ms"/> ')   // Kleinere Pausen nach Kommas
          .replace(/\?/g, '? <break time="300ms"/> '); // Pausen nach Fragen
        
        const speechText = `<speak>
          <prosody rate="105%" pitch="+0%" volume="loud">
            ${enhancedText}
          </prosody>
        </speak>`;
        
        console.log('TwiML Sprachtext:', speechText);
        
        // Sage die Antwort mit verbesserter Stimme
        twiml.say({
          voice: 'Polly.Vicki',
          language: 'de-DE',
        }, speechText);
        
        // Prüfe, ob das Gespräch beendet werden soll
        // Suche nach Abschlussphrasen in der Antwort
        const isConversationEnding = 
          aiMessage.content.toLowerCase().includes('auf wiedersehen') || 
          aiMessage.content.toLowerCase().includes('tschüss') ||
          aiMessage.content.toLowerCase().includes('schönen tag noch') ||
          aiMessage.content.toLowerCase().includes('verabschieden');
          
        if (isConversationEnding) {
          console.log('Gespräch wird beendet');
          // Keine Gather-Aktion mehr, da das Gespräch endet
          // Optional: Hier könnte ein Hangup hinzugefügt werden
          twiml.hangup();
        } else {
          // Füge eine Gather-Anweisung hinzu, um auf Benutzerantwort zu warten
          twiml.gather({
            input: 'speech',
            language: 'de-DE',
            speechTimeout: 'auto',
            action: '/api/twilio/call-response',
            method: 'POST'
          });
        }
        
        // Sende die TwiML-Antwort
        console.log('Sende TwiML-Antwort:', twiml.toString());
        res.type('text/xml');
        res.send(twiml.toString());
        console.log('TwiML-Antwort erfolgreich gesendet');
        
      } catch (openaiError) {
        console.error('Fehler bei OpenAI-Anfrage:', openaiError);
        
        // Erstelle eine Fehler-TwiML bei OpenAI-Problemen
        const errorTwiml = new twilio.twiml.VoiceResponse();
        errorTwiml.say({
          voice: 'Polly.Vicki',
          language: 'de-DE'
        }, '<speak><prosody rate="105%" pitch="+0%">Entschuldigung, es gab ein technisches Problem. Ich werde später erneut anrufen. Auf Wiedersehen.</prosody></speak>');
        
        errorTwiml.hangup();
        
        console.log('Sende Fehler-TwiML:', errorTwiml.toString());
        res.type('text/xml');
        res.send(errorTwiml.toString());
        console.log('Fehler-TwiML erfolgreich gesendet');
      }
    } else {
      // Erster Aufruf ohne Sprachergebnis - initiale Begrüßung
      console.log('Initialer Anruf ohne Sprachergebnis, sende Begrüßung');
      
      // Erstelle eine initiale TwiML-Antwort
      const twiml = new twilio.twiml.VoiceResponse();
      
      // Hole Buchungsdetails, wenn vorhanden
      const bookingDetails = conversation.bookingDetails || {};
      
      // Erstelle eine natürlichere personalisierte Begrüßung mit Pausen
      const greeting = `<speak>
        <prosody rate="105%" pitch="+0%" volume="loud">
          Hallo, <break time="200ms"/> hier ist Mila von TimeFlow. <break time="300ms"/>
          Ich rufe an bezüglich ${bookingDetails.terminTyp && bookingDetails.terminTyp !== 'Termin' ? bookingDetails.terminTyp : 'Ihres Termins'} 
          ${bookingDetails.datum ? 'am ' + bookingDetails.datum : ''} 
          ${bookingDetails.uhrzeit ? 'um ' + bookingDetails.uhrzeit : ''}. <break time="300ms"/>
          Passt dieser Zeitpunkt für Sie?
        </prosody>
      </speak>`;
      
      console.log('Begrüßungs-Text:', greeting);
      
      // Sage die Begrüßung mit verbesserter Stimme
      twiml.say({
        voice: 'Polly.Vicki',
        language: 'de-DE',
      }, greeting);
      
      // Füge eine Gather-Anweisung hinzu, um auf Benutzerantwort zu warten
      twiml.gather({
        input: 'speech',
        language: 'de-DE',
        speechTimeout: 'auto',
        action: '/api/twilio/call-response',
        method: 'POST'
      });
      
      // Sende die TwiML-Antwort
      console.log('Sende initiale TwiML-Antwort:', twiml.toString());
      res.type('text/xml');
      res.send(twiml.toString());
      console.log('Initiale TwiML-Antwort erfolgreich gesendet');
    }

  } catch (error) {
    console.error('Error in call-response:', error);
    console.error('Error stack:', error.stack);
    
    try {
      // Erstelle eine einfache Fehler-TwiML-Antwort
      const twimlResponse = new twilio.twiml.VoiceResponse();
      twimlResponse.say({
        voice: 'Polly.Vicki',
        language: 'de-DE'
      }, '<speak><prosody rate="105%" pitch="+0%">Es tut mir leid, es ist ein Fehler aufgetreten. Wir werden Sie später erneut kontaktieren.</prosody></speak>');
      
      twimlResponse.hangup();
      
      const twimlString = twimlResponse.toString();
      console.log('Fehler-TwiML generiert:', twimlString);
      
      res.type('text/xml');
      res.send(twimlString);
    } catch (twimlError) {
      console.error('Fehler beim Erstellen der Fehler-TwiML:', twimlError);
      res.status(500).send('Internal Server Error');
    }
  }
});

// Endpunkt für Transkriptions-Callbacks
router.post('/call-response/transcribe', (req, res) => {
  console.log('Transkription erhalten:', req.body);
  res.sendStatus(200);
});

module.exports = router; 