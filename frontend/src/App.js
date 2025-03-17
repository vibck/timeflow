import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Seiten importieren (werden später erstellt)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import EventForm from './pages/EventForm';
import HealthIntervals from './pages/HealthIntervals';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout-Komponente
import Layout from './components/Layout';

// Geschützte Route-Komponente
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Lade...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// App-Komponente mit Theme-Unterstützung
const AppWithTheme = () => {
  const { mode } = useTheme();
  
  // Erstelle ein MUI-Theme basierend auf dem ausgewählten Modus
  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
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
        '"Segoe UI Symbol"',
      ].join(','),
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/calendar" element={
            <PrivateRoute>
              <Layout>
                <Calendar />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/events/new" element={
            <PrivateRoute>
              <Layout>
                <EventForm />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/events/:id" element={
            <PrivateRoute>
              <Layout>
                <EventForm />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/events/:id/edit" element={
            <PrivateRoute>
              <Layout>
                <EventForm />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/health-intervals" element={
            <PrivateRoute>
              <Layout>
                <HealthIntervals />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

// Hauptkomponente, die den AuthProvider und ThemeProvider umschließt
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
