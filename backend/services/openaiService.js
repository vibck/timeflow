/**
 * OpenAI Service
 * 
 * Dieser Service bietet Integrationen mit OpenAI-Diensten:
 * - GPT-3.5 Turbo für Gesprächsführung
 * - Whisper für Spracherkennung
 * - TTS für Sprachsynthese
 */

const { OpenAI } = require('openai');
require('dotenv').config();

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generiert eine Antwort für ein Gespräch mit GPT-3.5 Turbo
   * @param {Array} messages - Nachrichten im OpenAI-Format [{role: 'system', content: '...'}, ...]
   * @returns {Promise<string>} - Die generierte Antwort
   */
  async generateResponse(messages) {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Fehler bei OpenAI API-Anfrage:', error);
      throw new Error('Konnte keine Antwort generieren');
    }
  }

  /**
   * Transkribiert Audio mit Whisper API
   * @param {Buffer} audioBuffer - Audio-Daten als Buffer
   * @returns {Promise<string>} - Transkribierter Text
   */
  async transcribeAudio(audioBuffer) {
    try {
      const tempFilePath = `/tmp/audio-${Date.now()}.wav`;
      const fs = require('fs');
      fs.writeFileSync(tempFilePath, audioBuffer);

      const transcription = await this.client.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1'
      });

      // Lösche temporäre Datei
      fs.unlinkSync(tempFilePath);

      return transcription.text;
    } catch (error) {
      console.error('Fehler bei Whisper API-Anfrage:', error);
      throw new Error('Konnte Audio nicht transkribieren');
    }
  }

  /**
   * Erzeugt eine Sprachausgabe mit TTS API
   * @param {string} text - Der zu sprechende Text
   * @returns {Promise<Buffer>} - Audio-Daten als Buffer
   */
  async generateSpeech(text) {
    try {
      const response = await this.client.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('Fehler bei TTS API-Anfrage:', error);
      throw new Error('Konnte Sprachausgabe nicht generieren');
    }
  }
}

module.exports = new OpenAIService(); 