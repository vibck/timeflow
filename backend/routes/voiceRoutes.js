const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const twilio = require('twilio');
require('dotenv').config();

const {
    OPENAI_API_KEY,
    PUBLIC_URL,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER
} = process.env;

// Überprüfen der erforderlichen Umgebungsvariablen
const requiredEnvVars = {
    OPENAI_API_KEY,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
        console.error(`Fehlende Umgebungsvariable: ${key}`);
        process.exit(1);
    }
}

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// Aktive Konversationen speichern
const activeConversations = new Map();

// Generiere TwiML für die Sprachausgabe
function generateTwiML(text) {
    try {
        if (!text) {
            throw new Error('Kein Text für TwiML bereitgestellt');
        }

        // Escapen von Sonderzeichen im Text
        const escapedText = text.replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;'
        })[char]);

        return `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say language="de-DE" voice="Polly.Vicki">${escapedText}</Say>
                <Pause length="1"/>
                <Gather input="speech" language="de-DE" speechTimeout="auto" speechModel="phone_call" action="${PUBLIC_URL}/api/voice/process-response" method="POST">
                    <Say language="de-DE" voice="Polly.Vicki">Bitte antworten Sie jetzt.</Say>
                </Gather>
                <Pause length="5"/>
                <Say language="de-DE" voice="Polly.Vicki">Ich konnte keine Antwort hören. Bitte versuchen Sie es noch einmal.</Say>
                <Gather input="speech" language="de-DE" speechTimeout="auto" speechModel="phone_call" action="${PUBLIC_URL}/api/voice/process-response" method="POST">
                    <Say language="de-DE" voice="Polly.Vicki">Sie können jetzt sprechen.</Say>
                </Gather>
            </Response>`;
    } catch (error) {
        console.error('Fehler bei der TwiML-Generierung:', error);
        throw new Error('Fehler bei der TwiML-Generierung: ' + error.message);
    }
}

// Voice-Endpunkt für eingehende Twilio-Anfragen
router.post('/voice', async (req, res) => {
    try {
        // Generiere TwiML für die initiale Antwort
        const twiml = generateTwiML("Hallo, ich bin Mila von TimeFlow. Wie kann ich Ihnen helfen?");
        res.type('text/xml').send(twiml);
    } catch (error) {
        console.error('Fehler im Voice-Endpunkt:', error);
        res.status(500).send({
            success: false,
            error: error.message
        });
    }
});

// Erstelle eine neue Konversation
async function createConversation(appointmentDetails) {
    // System Message für die Konversation
    const systemMessage = {
        role: "system",
        content: `Du bist Mila, eine freundliche KI-Telefonassistentin für TimeFlow. 
        Du rufst an, um einen Termin zu bestätigen. 
        
        Wichtige Regeln:
        1. Sei freundlich, höflich und professionell
        2. Sprich immer auf Deutsch
        3. Halte deine Antworten kurz und verständlich
        4. Stelle dich am Anfang vor als "Mila von TimeFlow"
        5. Erkläre, dass du anrufst, um einen Termin zu bestätigen
        6. Nenne die Termindetails und frage, ob sie so passen
        7. Reagiere angemessen auf die Antworten 
        8. Beende das Gespräch mit einer höflichen Verabschiedung
        
        Termindetails:
        - Typ: ${appointmentDetails.terminTyp}
        - Datum: ${appointmentDetails.datum}
        - Uhrzeit: ${appointmentDetails.uhrzeit}
        - Dauer: ${appointmentDetails.dauer} Minuten
        - Details: ${appointmentDetails.beschreibung}
        - Name: ${appointmentDetails.patientName}
        - Ort: ${appointmentDetails.ort}`
    };

    // Unique ID für die Konversation erstellen
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Speichere die Konversation
    activeConversations.set(conversationId, {
        messages: [systemMessage],
        appointmentDetails,
        callSid: null
    });
    
    return conversationId;
}

// Hole eine Nachricht von der KI
async function getChatResponse(conversationId, userMessage = null) {
    try {
        const conversation = activeConversations.get(conversationId);
        
        if (!conversation) {
            throw new Error(`Keine Konversation mit ID ${conversationId} gefunden`);
        }
        
        // Füge Nutzernachricht hinzu, wenn vorhanden
        if (userMessage) {
            conversation.messages.push({
                role: "user",
                content: userMessage
            });
        }
        
        // Beim ersten Aufruf ohne Nutzernachricht die erste Nachricht der KI generieren
        if (!userMessage && conversation.messages.length === 1) {
            conversation.messages.push({
                role: "user",
                content: "Beginne das Telefonat und stelle dich vor."
            });
        }
        
        console.log('Sende Anfrage an OpenAI:', JSON.stringify(conversation.messages, null, 2));
        
        // Hole Antwort von OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: conversation.messages,
            temperature: 0.7,
            max_tokens: 256
        });
        
        // Extrahiere Antwort
        const assistantMessage = response.choices[0].message;
        
        // Füge Antwort zur Konversation hinzu
        conversation.messages.push(assistantMessage);
        
        // Speichere aktualisierte Konversation
        activeConversations.set(conversationId, conversation);
        
        return assistantMessage.content;
    } catch (error) {
        console.error('Fehler bei OpenAI Anfrage:', error);
        throw error;
    }
}

// Hauptendpunkt für ausgehende Anrufe
router.post('/outbound-call', async (req, res) => {
    const appointmentDetails = req.body;

    if (!appointmentDetails.telefonnummer || !appointmentDetails.terminTyp || 
        !appointmentDetails.datum || !appointmentDetails.uhrzeit) {
        return res.status(400).send({
            success: false,
            error: 'Fehlende Pflichtfelder'
        });
    }

    try {
        // Erstelle eine neue Konversation
        const conversationId = await createConversation(appointmentDetails);
        
        // Hole die erste Nachricht der KI
        const firstMessage = await getChatResponse(conversationId);
        console.log('Erste Nachricht der KI:', firstMessage);
        
        // Initiiere den Anruf
        const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        const call = await twilioClient.calls.create({
            to: appointmentDetails.telefonnummer,
            from: TWILIO_PHONE_NUMBER,
            twiml: generateTwiML(firstMessage),
            statusCallback: `${PUBLIC_URL}/api/voice/call-status`,
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
            statusCallbackMethod: 'POST'
        });

        // Speichere die CallSid in der Konversation
        const conversation = activeConversations.get(conversationId);
        conversation.callSid = call.sid;
        activeConversations.set(conversationId, conversation);

        return res.send({
            success: true,
            callSid: call.sid,
            conversationId: conversationId,
            message: 'Anruf wird gestartet'
        });

    } catch (error) {
        console.error('Fehler beim Anruf:', error);
        return res.status(500).send({
            success: false,
            error: error.message
        });
    }
});

// Verarbeite die Antwort des Anrufers
router.post('/process-response', async (req, res) => {
    const { SpeechResult, CallSid } = req.body;
    
    try {
        console.log('Antwort vom Anrufer erhalten:', SpeechResult);
        console.log('Call SID:', CallSid);
        
        if (!CallSid) {
            throw new Error('Keine CallSid im Request gefunden');
        }

        // Finde die Konversation anhand der CallSid
        const conversationEntry = Array.from(activeConversations.entries())
            .find(([id, conversation]) => conversation.callSid === CallSid);

        if (!conversationEntry) {
            console.error('Keine aktive Konversation für CallSid:', CallSid);
            throw new Error('Keine aktive Konversation gefunden');
        }

        const [conversationId, conversation] = conversationEntry;
        console.log('Konversation gefunden:', conversationId);

        // Hole Antwort von OpenAI basierend auf der Nutzereingabe
        const aiResponse = await getChatResponse(
            conversationId, 
            SpeechResult || "Keine deutliche Antwort erhalten"
        );
        
        console.log('Antwort der KI:', aiResponse);

        // Generiere TwiML für die Antwort
        const twiml = generateTwiML(aiResponse);
        return res.type('text/xml').send(twiml);

    } catch (error) {
        console.error('Fehler bei der Verarbeitung der Antwort:', error);
        // Im Fehlerfall eine freundliche Nachricht senden
        const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say language="de-DE" voice="Polly.Vicki">Es tut mir leid, ich konnte Ihre Antwort nicht verarbeiten. Bitte versuchen Sie es später noch einmal.</Say>
                <Pause length="1"/>
                <Hangup/>
            </Response>`;
        return res.type('text/xml').send(errorTwiml);
    }
});

// Status-Endpunkt für Twilio-Callbacks
router.post('/call-status', async (req, res) => {
    const { CallSid, CallStatus } = req.body;
    console.log(`Anrufstatus Update - CallSid: ${CallSid}, Status: ${CallStatus}`);
    res.sendStatus(200);
});

module.exports = router; 