const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const axios = require('axios');
require('dotenv').config();

// Twilio-Client initialisieren
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// OpenAI Voice Server URL
const OPENAI_VOICE_SERVER = process.env.OPENAI_VOICE_SERVER || 'http://localhost:5050';

// Hilfsfunktion zum Überprüfen der Verbindung zum OpenAI Voice Server
async function checkVoiceServerConnection() {
    try {
        const response = await axios.get(OPENAI_VOICE_SERVER);
        return response.data.status === 'running';
    } catch (error) {
        console.error('Fehler bei der Verbindung zum OpenAI Voice Server:', error.message);
        return false;
    }
}

// Hilfsfunktion zur Validierung der Anrufdetails
function validateBookingDetails(details) {
  const requiredFields = ['telefonnummer', 'terminTyp', 'datum', 'uhrzeit'];
  
  for (const field of requiredFields) {
    if (!details[field]) {
      console.error(`Fehlende Anrufdetails: ${field}`);
      return null;
    }
  }
  
  // Standardwerte für optionale Felder
  return {
    ...details,
    dauer: details.dauer || '30',
    beschreibung: details.beschreibung || 'keine',
    patientName: details.patientName || 'Kunde',
    ort: details.ort || 'Praxis'
  };
}

// Route für ausgehende Anrufe
router.post('/outbound-call', async (req, res) => {
    const {
        telefonnummer,
        terminTyp,
        datum,
        uhrzeit,
        dauer = '30',
        beschreibung = 'keine weiteren Details',
        patientName = 'Kunde',
        ort = 'Praxis'
    } = req.body;

    // Validierung der Pflichtfelder
    if (!telefonnummer || !terminTyp || !datum || !uhrzeit) {
        return res.status(400).json({
            success: false,
            error: 'Fehlende Pflichtfelder: telefonnummer, terminTyp, datum, uhrzeit sind erforderlich'
        });
    }

    try {
        // Direkt TwiML generieren ohne OpenAI Voice Server Überprüfung
        const publicUrl = process.env.PUBLIC_URL || `https://${req.headers.host}`;
        console.log('Verwendete URL:', publicUrl);

        const systemMessage = `
            Du bist Mila, eine freundliche KI-Assistentin von TimeFlow.
            Deine Aufgabe ist es, Termine zu bestätigen und zu koordinieren.
            Sprich immer auf Deutsch. Sei freundlich, höflich und professionell.
            
            Termin zum Bestätigen:
            - Typ: ${terminTyp}
            - Datum: ${datum}
            - Uhrzeit: ${uhrzeit}
            - Dauer: ${dauer} Minuten
            - Details: ${beschreibung}
            - Name: ${patientName}
            - Ort: ${ort}
            
            Anweisungen:
            1. Stelle dich vor als "Mila von TimeFlow"
            2. Erkläre, dass du wegen der Terminbestätigung anrufst
            3. Nenne die Termindetails
            4. Frage höflich, ob der Termin so passt
        `;

        // TwiML für den Anruf generieren
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say language="de-DE">Einen Moment bitte, ich verbinde Sie mit unserer KI-Assistentin.</Say>
                <Pause length="1"/>
                <Connect>
                    <Stream url="wss://${publicUrl.replace(/^https?:\/\//, '')}/stream">
                        <Parameter name="systemMessage" value="${encodeURIComponent(systemMessage)}"/>
                        <Parameter name="debug" value="true"/>
                    </Stream>
                </Connect>
                <Say language="de-DE">Entschuldigung, es gab ein Problem mit der Verbindung. Wir rufen Sie gleich zurück.</Say>
            </Response>`;

        console.log('Generiertes TwiML:', twiml);

        // Anruf über Twilio initiieren
        const call = await twilioClient.calls.create({
            to: telefonnummer,
            from: process.env.TWILIO_PHONE_NUMBER,
            twiml: twiml,
            statusCallback: `${publicUrl}/call-status`,
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
            statusCallbackMethod: 'POST',
            timeout: 30
        });

        console.log('Anruf initiiert:', call.sid);
        return res.json({
            success: true,
            callSid: call.sid,
            message: 'Anruf wird gestartet'
        });

    } catch (error) {
        console.error('Fehler beim Anruf:', error);
        return res.status(500).json({
            success: false,
            error: `Fehler beim Initiieren des Anrufs: ${error.message}`,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Endpunkt zur Verarbeitung der Sprach- oder Tastendruck-Antworten
router.post('/gather-response', (req, res) => {
  try {
    console.log('======= GATHER RESPONSE =======');
    console.log('Request Body:', JSON.stringify(req.body));
    
    const twiml = new VoiceResponse();
    
    // Auswertung der Antwort
    let userInput = '';
    
    if (req.body.Digits) {
      userInput = req.body.Digits;
    } else if (req.body.SpeechResult) {
      userInput = req.body.SpeechResult.toLowerCase();
    }
    
    console.log('User Input:', userInput);
    
    // Antwort basierend auf der Eingabe
    if (userInput === '1' || userInput.includes('ja') || userInput.includes('bestätig')) {
      // Bestätigung
      twiml.say({
        voice: 'Polly.Vicki',
        language: 'de-DE'
      }, 'Vielen Dank für die Bestätigung Ihres Termins! Wir freuen uns auf Ihren Besuch. Auf Wiederhören!');
    } else if (userInput === '2' || userInput.includes('nein') || userInput.includes('absage') || userInput.includes('stornieren')) {
      // Absage
      twiml.say({
        voice: 'Polly.Vicki',
        language: 'de-DE'
      }, 'Sie haben den Termin abgesagt. Ein Mitarbeiter wird sich in Kürze mit Ihnen in Verbindung setzen. Vielen Dank für Ihren Anruf!');
    } else if (userInput === '3' || userInput.includes('änder') || userInput.includes('verschieb') || userInput.includes('später')) {
      // Terminverschiebung
      twiml.say({
        voice: 'Polly.Vicki',
        language: 'de-DE'
      }, 'Sie möchten den Termin verschieben. Ein Mitarbeiter wird sich in Kürze mit Ihnen in Verbindung setzen, um einen neuen Termin zu vereinbaren. Vielen Dank für Ihren Anruf!');
    } else {
      // Unklare Eingabe - erneut fragen
      const gather = twiml.gather({
        input: 'dtmf speech',
        speechTimeout: 'auto',
        speechModel: 'phone_call',
        language: 'de-DE',
        hints: 'ja, nein, später, ändern',
        action: '/api/ai-calls/gather-response',
        method: 'POST',
        numDigits: 1,
        timeout: 5
      });
      
      gather.say({
        voice: 'Polly.Vicki',
        language: 'de-DE'
      }, `Entschuldigung, ich habe Sie nicht verstanden. Bitte sagen Sie Ja oder drücken Sie die 1 für eine Bestätigung, Nein oder die 2 für eine Absage, oder Ändern oder die 3 für eine Terminverschiebung.`);
      
      // Fallback
      twiml.say({
        voice: 'Polly.Vicki',
        language: 'de-DE'
      }, `Es tut mir leid, ich konnte Ihre Antwort nicht erfassen. Wir werden Sie später erneut kontaktieren. Vielen Dank für Ihre Zeit!`);
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Fehler bei der Verarbeitung der Gather-Antwort:', error);
    
    const twiml = new VoiceResponse();
    twiml.say({
      voice: 'Polly.Vicki',
      language: 'de-DE'
    }, 'Es ist ein Fehler aufgetreten. Bitte kontaktieren Sie uns direkt unter unserer Servicenummer.');
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// Webhook-Endpunkt für Twilio-Anrufstatus-Updates
router.post('/call-status', (req, res) => {
  try {
    console.log('======= TWILIO CALL STATUS UPDATE =======');
    console.log('Request Headers:', JSON.stringify(req.headers));
    console.log('Request Body:', JSON.stringify(req.body));
    
    const { CallSid, CallStatus, CallDuration } = req.body;
    
    // Protokolliere den Anrufstatus
    console.log(`Anruf ${CallSid} Status: ${CallStatus}, Dauer: ${CallDuration || 'N/A'} Sekunden`);
    
    // Hier könnten weitere Verarbeitungsschritte für bestimmte Status implementiert werden
    if (CallStatus === 'completed') {
      console.log(`Anruf ${CallSid} wurde erfolgreich abgeschlossen.`);
    } else if (CallStatus === 'failed' || CallStatus === 'busy' || CallStatus === 'no-answer') {
      console.error(`Anruf ${CallSid} fehlgeschlagen: ${CallStatus}`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Fehler bei Twilio-Statusupdate-Verarbeitung:', error);
    res.status(500).send('Error');
  }
});

module.exports = router; 