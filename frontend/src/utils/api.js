import axios from 'axios';

// Basis-URL für alle API-Anfragen
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Erstelle eine Axios-Instanz mit Standardkonfiguration
const api = axios.create({
  baseURL,
  timeout: 10000, // 10 Sekunden Timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request-Interceptor für Authentifizierung
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response-Interceptor für Fehlerbehandlung
api.interceptors.response.use(
  response => response,
  error => {
    // Automatische Abmeldung bei 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 