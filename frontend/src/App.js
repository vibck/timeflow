import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

// Layout-Komponente
// import AnimatedLayout from './components/Layout/AnimatedLayout';
import Layout from './components/Layout';
import Profile from './components/Profile';

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
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
