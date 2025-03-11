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

export default api; 