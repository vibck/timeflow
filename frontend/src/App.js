import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Seiten importieren (werden später erstellt)
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
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

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#f5f5f5',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
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
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
