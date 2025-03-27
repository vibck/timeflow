const express = require('express');
const router = express.Router();
const axios = require('axios');
const twilio = require('twilio');
require('dotenv').config();

// Twilio Client initialisieren (für Kompatibilität)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Speichere aktive Gespräche
const conversations = {
  active: new Map(),
  getOrCreate(callSid, bookingDetails) {
    if (!this.active.has(callSid)) {
      this.active.set(callSid, {
        callSid,
        bookingDetails,
        ultravoxCallId: null,
        status: 'pending'
      });
    }
    return this.active.get(callSid);
  },
  getByUltravoxId(ultravoxCallId) {
    for (let [_, conversation] of this.active.entries()) {
      if (conversation.ultravoxCallId === ultravoxCallId) {
        return conversation;
      }
    }
    return null;
  }
};

// Endpoint für ausgehende Anrufe
router.post('/outbound-call', async (req, res) => {
  try {
    console.log('======= ULTRAVOX OUTBOUND CALL REQUEST =======');
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

    // Validierung der Eingabedaten
    if (!telefonnummer) {
      console.error('Fehler: Keine Telefonnummer angegeben');
      return res.status(400).json({
        success: false,
        error: 'Telefonnummer ist erforderlich'
      });
    }

    // Speichere die Buchungsdetails
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

    // 1. Erstelle einen Ultravox-Call
    const ultravoxCallResponse = await axios.post('https://api.ultravox.ai/v1/calls', {
      systemPrompt: `Du bist Mila, eine KI-Assistentin von TimeFlow, die aktiv einen Termin vereinbart. Du rufst JETZT AN, um einen konkreten Termin zu vereinbaren.

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
      7. Sprich NATÜRLICH mit Pausen und Betonungen
      
      GESPRÄCHSABSCHLUSS:
      - Bestätige den vereinbarten Termin klar und präzise
      - Bedanke dich für das Gespräch
      - Verabschiede dich mit einem klaren Abschluss`,
      medium: { 
        "twilio": {} 
      },
      firstSpeaker: "FIRST_SPEAKER_USER",
      agentVoice: {
        provider: "ULTRAVOX",
        voiceId: "de-DE-vicki", // Standard deutsche weibliche Stimme von Ultravox
      },
      language: "de-DE"
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ULTRAVOX_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const ultravoxCallId = ultravoxCallResponse.data.id;
    console.log('Ultravox Call erstellt:', ultravoxCallId);

    // 2. Verwende die joinUrl, um einen Twilio-Call zu initiieren
    const joinUrl = ultravoxCallResponse.data.joinUrl;

    // 3. Initiiere den Anruf mit Twilio
    const call = await twilioClient.calls.create({
      to: telefonnummer,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: joinUrl, // Verwende die Ultravox joinUrl
      method: 'POST'
    });

    console.log('Twilio Anruf initiiert:', call.sid);
    
    // 4. Speichere die Verknüpfung zwischen Twilio CallSid und Ultravox Call ID
    const conversation = conversations.getOrCreate(call.sid, bookingDetails);
    conversation.ultravoxCallId = ultravoxCallId;
    conversation.status = 'active';

    res.json({
      success: true,
      callSid: call.sid,
      ultravoxCallId: ultravoxCallId,
      message: 'Call initiated successfully'
    });

  } catch (error) {
    console.error('Error initiating Ultravox call:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Webhook-Endpunkt für Ultravox-Ereignisse
router.post('/webhook', async (req, res) => {
  try {
    console.log('Ultravox Webhook empfangen:', JSON.stringify(req.body));
    
    const { event, callId, data } = req.body;
    
    // Finde die zugehörige Konversation
    const conversation = conversations.getByUltravoxId(callId);
    
    if (!conversation) {
      console.warn(`Keine Konversation für Ultravox Call ID ${callId} gefunden`);
      return res.sendStatus(200); // Bestätige den Webhook trotzdem
    }
    
    // Verarbeite verschiedene Ereignistypen
    switch (event) {
      case 'call.ended':
        console.log(`Anruf ${conversation.callSid} beendet:`, data);
        conversation.status = 'completed';
        // Hier könntest du das Gespräch in der Datenbank speichern
        break;
        
      case 'call.transcription':
        console.log(`Transkription für ${conversation.callSid}:`, data.text);
        // Speichere die Transkription wenn nötig
        break;
        
      default:
        console.log(`Unbekanntes Ereignis: ${event}`);
    }
    
    res.sendStatus(200);
    
  } catch (error) {
    console.error('Fehler bei der Verarbeitung des Ultravox-Webhooks:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router; 