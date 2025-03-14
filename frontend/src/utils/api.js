import axios from 'axios';

// Erstelle eine Axios-Instanz mit der Basis-URL aus der Umgebungsvariable
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Füge einen Request-Interceptor hinzu, um den JWT-Token zu allen Anfragen hinzuzufügen
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Füge einen Response-Interceptor hinzu
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nur wichtige Fehler loggen oder für Produktionsumgebung deaktivieren
    if (process.env.NODE_ENV !== 'production') {
      if (error.response) {
        console.error(`API-Fehler: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        console.error('Keine Antwort vom Server erhalten');
      } else {
        console.error('Fehler beim Erstellen der Anfrage:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 