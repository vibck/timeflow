import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Konfiguriere axios
axios.defaults.baseURL = API_URL;

// Füge Token zu Anfragen hinzu, wenn vorhanden
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Events API
export const eventsApi = {
  getAll: () => axios.get('/events'),
  getById: id => axios.get(`/events/${id}`),
  create: data => axios.post('/events', data),
  update: (id, data) => axios.put(`/events/${id}`, data),
  delete: id => axios.delete(`/events/${id}`)
};

// Reminders API
export const remindersApi = {
  getByEventId: eventId => axios.get(`/reminders/event/${eventId}`),
  create: data => axios.post('/reminders', data),
  delete: id => axios.delete(`/reminders/${id}`)
};

// Health Intervals API
export const healthIntervalsApi = {
  getAll: () => axios.get('/health-intervals'),
  create: data => axios.post('/health-intervals', data),
  update: (id, data) => axios.put(`/health-intervals/${id}`, data),
  delete: id => axios.delete(`/health-intervals/${id}`)
};

// Telegram API
export const telegramApi = {
  getConnection: () => axios.get('/telegram/connection'),
  deleteConnection: () => axios.delete('/telegram/connection')
};
