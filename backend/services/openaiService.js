const { Configuration, OpenAIApi } = require('openai');
const config = require('../config/config');

// OpenAI-Konfiguration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || config.openai.apiKey,
});
const openai = new OpenAIApi(configuration);

/**
 * Generiert eine Antwort basierend auf dem Benutzer-Chat
 */
const generateChatResponse = async (userMessage, context = '') => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Du bist ein Assistent für das Buchungssystem TimeFlow.' },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Fehler:', error);
    throw new Error('Fehler bei der Kommunikation mit OpenAI');
  }
};

module.exports = {
  generateChatResponse
}; 