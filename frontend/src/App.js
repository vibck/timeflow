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

// App-Komponente mit Theme
const AppWithTheme = () => {
  const { mode } = useTheme();

  // Erstelle ein Theme basierend auf dem ausgewählten Modus
  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#3a86ff', // Moderneres Blau
        light: '#60a5fa',
        dark: '#2563eb',
      },
      secondary: {
        main: '#f72585', // Lebendiges Pink
        light: '#ff4d8d',
        dark: '#d61f69',
      },
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
      info: {
        main: '#3b82f6',
      },
      success: {
        main: '#10b981',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
      text: {
        primary: mode === 'light' ? '#334155' : '#e2e8f0',
        secondary: mode === 'light' ? '#64748b' : '#94a3b8',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12, // Abgerundete Ecken für alle Komponenten
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#3a86ff' : '#1e293b',
            boxShadow: mode === 'light' 
              ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' 
              : '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            boxShadow: mode === 'light' 
              ? '0 1px 2px rgba(0,0,0,0.05)' 
              : '0 1px 3px rgba(0,0,0,0.2)',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
            },
          },
          containedPrimary: {
            background: mode === 'light' 
              ? 'linear-gradient(145deg, #3a86ff, #2563eb)' 
              : 'linear-gradient(145deg, #3a86ff, #1d4ed8)',
          },
          containedSecondary: {
            background: mode === 'light' 
              ? 'linear-gradient(145deg, #f72585, #d61f69)' 
              : 'linear-gradient(145deg, #f72585, #be185d)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' 
              : '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
          },
          elevation1: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
          },
          elevation2: {
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          },
          elevation3: {
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            overflow: 'hidden',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
            '& .MuiSwitch-switchBase': {
              padding: 1,
              '&.Mui-checked': {
                transform: 'translateX(16px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                  opacity: 1,
                  backgroundColor: mode === 'light' ? '#3a86ff' : '#2563eb',
                },
              },
            },
            '& .MuiSwitch-thumb': {
              width: 24,
              height: 24,
            },
            '& .MuiSwitch-track': {
              borderRadius: 13,
              opacity: 1,
              backgroundColor: mode === 'light' ? '#e9e9ea' : '#39393D',
            },
          },
        },
      },
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

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
