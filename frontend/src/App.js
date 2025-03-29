import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'; // createTheme entfernt
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext';
import theme from './theme'; // Importiere unser Theme-Objekt

// App-Seiten
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import EventForm from './pages/EventForm';
import HealthIntervals from './pages/HealthIntervals';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layout-Komponente
// import AnimatedLayout from './components/Layout/AnimatedLayout';
import Layout from './components/Layout';
import AIBooking from './components/AIBooking';
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
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Lade...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * AppWithTheme - Hauptanwendung mit Theme-Unterstützung
 * Verwaltet das Theme und die Routen der Anwendung
 */
const AppWithTheme = () => {
  
  // Erstelle das Theme mit unserer benutzerdefinierten Funktion
  // Removed the reference to createAppTheme

  // Wir benötigen AppLayout nicht mehr, da wir alle Routen über das Layout-Element rendern
  // const AppLayout = AnimatedLayout;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={router.future}>
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
          
          {/* Die folgenden Routen entfernen, da sie jetzt im Layout oben sind */}
          {/* 404-Seite */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
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
      <CustomThemeProvider>
        <AppWithTheme />
      </CustomThemeProvider>
    </AuthProvider>
  );
};

export default App;
