import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import AIBooking from './pages/AIBooking';
import HealthIntervals from './pages/HealthIntervals';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';

// App-Seiten
import Calendar from './pages/Calendar';
import EventForm from './pages/EventForm';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

// Layout-Komponente
// import AnimatedLayout from './components/Layout/AnimatedLayout';
import Layout from './components/Layout';

/**
 * React Router Future Flags
 * Diese Konfiguration bereitet die App auf React Router v7 vor:
 */
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

/**
 * PrivateRoute - Schützt Routen für nicht authentifizierte Benutzer
 * Leitet zur Login-Seite weiter, wenn der Benutzer nicht angemeldet ist
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * AppContent - Hauptanwendung mit Theme-Unterstützung
 * Verwaltet das Theme und die Routen der Anwendung
 */
const AppContent = () => {
  const { theme } = useTheme();
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState(null);
  
  // Funktion zum Öffnen des Popups
  const openEventFormPopup = (event) => {
    if (event) {
      try {
        // Sichere Erstellung von Date-Objekten mit Fallbacks
        const createSafeDate = (dateValue) => {
          if (!dateValue) return new Date();
          
          try {
            const date = new Date(dateValue);
            // Überprüfe, ob das Datum gültig ist
            if (isNaN(date.getTime())) {
              console.warn('Ungültiges Datum erkannt:', dateValue);
              return new Date(); // Fallback auf aktuelles Datum
            }
            return date;
          } catch (e) {
            console.error('Fehler beim Erstellen des Date-Objekts:', e);
            return new Date(); // Fallback auf aktuelles Datum
          }
        };
        
        // Verwende die vorhandenen oder berechneten Werte
        const startTime = createSafeDate(event.datetime || event.start_time);
        const endTime = createSafeDate(event.end_time) || new Date(startTime.getTime() + 60 * 60 * 1000); // +1 Stunde als Fallback
        
        // Prüfe, ob es sich um ein neues oder bestehendes Event handelt
        // Ein Event ist neu, wenn es keine ID hat oder eine temporäre ID, die mit 'new-event-' beginnt
        const isNew = !event.id || (event.id && event.id.toString().startsWith('new-event-'));
        
        setEventData({
          id: isNew ? null : event.id, // Keine ID für neue Events
          title: event.title || '',
          description: event.description || '',
          location: event.location || '',
          start_time: startTime,
          end_time: endTime,
          event_type: event.event_type || 'personal',
          color: event.color
        });
        setShowEventForm(true);
      } catch (error) {
        console.error('Fehler beim Öffnen des Popups:', error);
        // Fehlermeldung anzeigen (optional)
      }
    }
  };
  
  // Funktion zum Schließen des Popups
  const closeEventFormPopup = () => {
    setShowEventForm(false);
    setEventData(null);
    
    // Refresh calendar events
    if (window.refreshCalendarEvents) {
      window.refreshCalendarEvents();
    }
    // Refresh sidebar events
    if (window.refreshSidebarEvents) {
      window.refreshSidebarEvents();
    }
    // Refresh dashboard events
    if (window.refreshDashboardEvents) {
      window.refreshDashboardEvents();
    }
  };
  
  // Funktion global verfügbar machen
  useEffect(() => {
    window.openEventFormPopup = openEventFormPopup;
    
    return () => {
      window.openEventFormPopup = null;
    };
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Öffentliche Routen */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Geschützte Routen */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="ai-booking" element={<AIBooking />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="events/new" element={<EventForm />} />
              <Route path="events/:id" element={<EventForm />} />
              <Route path="events/:id/edit" element={<EventForm />} />
              <Route path="health-intervals" element={<HealthIntervals />} />
            </Route>
            
            {/* 404-Seite */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Globales EventForm-Popup */}
          {showEventForm && (
            <EventForm
              open={showEventForm}
              onClose={closeEventFormPopup}
              initialData={eventData}
              isEdit={eventData && eventData.id ? true : false}
            />
          )}
        </Router>
      </LocalizationProvider>
    </MuiThemeProvider>
  );
};

/**
 * App - Einstiegspunkt mit Kontext-Providern
 * Umschließt die Anwendung mit den notwendigen Providern
 */
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
