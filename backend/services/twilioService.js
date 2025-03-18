/**
 * Twilio Service
 * 
 * Dieser Service bietet Integrationen mit Twilio für Telefonanrufe.
 */

const twilio = require('twilio');
const { VoiceResponse } = require('twilio').twiml;
require('dotenv').config();

class TwilioService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.twilioNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  /**
   * Führt einen Telefonanruf durch
   * @param {string} to - Zieltelefonnummer
   * @param {string} twimlUrl - URL für TwiML-Anweisungen oder Webhook
   * @returns {Promise<Object>} - Anrufinformationen
   */
  async makeCall(to, twimlUrl) {
    try {
      // Normalisiere Telefonnummer auf internationales Format
      const normalizedNumber = this.normalizePhoneNumber(to);
      
      const call = await this.client.calls.create({
        to: normalizedNumber,
        from: this.twilioNumber,
        url: twimlUrl,
        statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      });
      
      return {
        callSid: call.sid,
        status: call.status,
        direction: call.direction,
        from: call.from,
        to: call.to
      };
    } catch (error) {
      console.error('Fehler beim Twilio-Anruf:', error);
      throw new Error(`Konnte Anruf nicht durchführen: ${error.message}`);
    }
  }

  /**
   * Erstellt eine TwiML-Antwort für einen Anruf
   * @param {string} speechText - Text, der gesprochen werden soll
   * @param {string} responseUrl - URL für die Antwort
   * @returns {string} - TwiML-Anweisungen als String
   */
  generateTwiML(speechText, responseUrl = null) {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    
    // Füge Say-Element hinzu
    response.say({
      voice: 'woman',
      language: 'de-DE'
    }, speechText);
    
    // Falls eine Response-URL angegeben wurde, füge diese als Gather hinzu
    if (responseUrl) {
      response.gather({
        input: 'speech',
        action: responseUrl,
        method: 'POST',
        speechTimeout: 'auto',
        language: 'de-DE'
      });
    }
    
    return response.toString();
  }

  /**
   * Normalisiert eine Telefonnummer ins internationale Format
   * @param {string} phoneNumber - Die zu normalisierende Telefonnummer
   * @returns {string} - Normalisierte Telefonnummer
   */
  normalizePhoneNumber(phoneNumber) {
    // Entferne Leerzeichen, Bindestriche und Klammern
    let normalized = phoneNumber.replace(/[\s\-()]/g, '');
    
    // Füge deutsche Ländervorwahl hinzu, falls nicht vorhanden
    if (normalized.startsWith('0')) {
      normalized = '+49' + normalized.substring(1);
    } else if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }
    
    return normalized;
  }

  /**
   * Ruft Informationen zu einem aktiven Anruf ab
   * @param {string} callSid - Die SID des Anrufs
   * @returns {Promise<Object>} - Anrufinformationen
   */
  async getCallInfo(callSid) {
    try {
      const call = await this.client.calls(callSid).fetch();
      return call;
    } catch (error) {
      console.error('Fehler beim Abrufen der Anrufinformationen:', error);
      throw new Error('Konnte Anrufinformationen nicht abrufen');
    }
  }

  // Erzeuge einen TwiML-Response für die Anrufannahme
  generateInitialTwiml() {
    const response = new VoiceResponse();
    
    // Spiele eine Begrüßungsnachricht ab
    response.say({
      voice: 'Polly.Vicki',
      language: 'de-DE'
    }, 'Willkommen beim TimeFlow Buchungsassistenten. ' +
       'Bitte halten Sie einen Moment, während wir die Verbindung herstellen.');
    
    // Füge eine Pause hinzu (optional)
    response.pause({ length: 1 });
    
    // Warteschleife starten (wegen des DTMF-Tons für die Annahme)
    response.say({
      voice: 'Polly.Vicki',
      language: 'de-DE'
    }, 'Wir verbinden Sie nun. Einen Moment bitte.');
    
    return response.toString();
  }
}

module.exports = new TwilioService(); 