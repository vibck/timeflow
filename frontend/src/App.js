import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// App-Seiten
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import EventForm from './pages/EventForm';
import HealthIntervals from './pages/HealthIntervals';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout-Komponente
import AnimatedLayout from './components/Layout/AnimatedLayout';

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
  const { mode } = useTheme();
  
  // MUI-Theme basierend auf dem ausgewählten Modus (hell/dunkel)
  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#2196f3'
      },
      secondary: {
        main: '#f50057'
      }
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(',')
    },
    components: {
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            backgroundColor: '#2196f3',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1976d2'
            }
          }
        }
      }
    }
  });

  // Animierte Layout-Komponente für die gesamte Anwendung
  const AppLayout = AnimatedLayout;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={router.future}>
        <Routes>
          {/* Öffentliche Routen */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Geschützte Routen */}
          <Route path="/" element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/calendar" element={
            <PrivateRoute>
              <AppLayout>
                <Calendar />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/events/new" element={
            <PrivateRoute>
              <AppLayout>
                <EventForm />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/events/:id" element={
            <PrivateRoute>
              <AppLayout>
                <EventForm />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/events/:id/edit" element={
            <PrivateRoute>
              <AppLayout>
                <EventForm />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/health-intervals" element={
            <PrivateRoute>
              <AppLayout>
                <HealthIntervals />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </PrivateRoute>
          } />
          
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
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
