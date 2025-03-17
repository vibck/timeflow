import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Paper, 
  Grid,
  Alert,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import api from '../utils/api';
import TelegramConnect from '../components/Settings/TelegramConnect';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { mode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    state: 'BY',
    notificationPreferences: {
      email: true,
      telegram: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [telegramConnected, setTelegramConnected] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [telegramBotName, setTelegramBotName] = useState('');

  // Liste der deutschen Bundesländer
  const states = [
    { code: 'BW', name: 'Baden-Württemberg' },
    { code: 'BY', name: 'Bayern' },
    { code: 'BE', name: 'Berlin' },
    { code: 'BB', name: 'Brandenburg' },
    { code: 'HB', name: 'Bremen' },
    { code: 'HH', name: 'Hamburg' },
    { code: 'HE', name: 'Hessen' },
    { code: 'MV', name: 'Mecklenburg-Vorpommern' },
    { code: 'NI', name: 'Niedersachsen' },
    { code: 'NW', name: 'Nordrhein-Westfalen' },
    { code: 'RP', name: 'Rheinland-Pfalz' },
    { code: 'SL', name: 'Saarland' },
    { code: 'SN', name: 'Sachsen' },
    { code: 'ST', name: 'Sachsen-Anhalt' },
    { code: 'SH', name: 'Schleswig-Holstein' },
    { code: 'TH', name: 'Thüringen' }
  ];

  // Lade Benutzereinstellungen und Telegram-Status beim Seitenaufruf
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Lade Benutzereinstellungen
        const settingsResponse = await api.get('/api/users/settings');
        
        // Wenn keine Benachrichtigungspräferenzen in den Einstellungen vorhanden sind, verwende die Standardwerte
        const loadedSettings = {
          ...settingsResponse.data,
          notificationPreferences: settingsResponse.data.notificationPreferences || {
            email: true,
            telegram: false
          }
        };
        
        setSettings(loadedSettings);
        
        // Prüfe Telegram-Verbindung
        try {
          const telegramResponse = await api.get('/api/telegram/status');
          setTelegramConnected(telegramResponse.data.connected);
          setTelegramBotName(telegramResponse.data.botName || 'TimeFlow_bot');
        } catch (telegramError) {
          console.error('Fehler beim Laden des Telegram-Status:', telegramError);
          setTelegramConnected(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
        setSnackbar({
          open: true,
          message: 'Fehler beim Laden der Einstellungen',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Aktualisiere Einstellungen
  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Nicht angemeldet',
          severity: 'error'
        });
        return;
      }

      await api.put('/api/users/settings', settings);

      // Aktualisiere den lokalen Speicher für die Kalenderansicht
      const oldState = localStorage.getItem('userState');
      localStorage.setItem('userState', settings.state);
      
      // Löse ein benutzerdefiniertes Event aus, um andere Komponenten zu benachrichtigen
      const stateChangeEvent = new CustomEvent('stateChange', {
        detail: {
          oldState,
          newState: settings.state
        }
      });
      window.dispatchEvent(stateChangeEvent);

      setSnackbar({
        open: true,
        message: 'Einstellungen erfolgreich gespeichert',
        severity: 'success'
      });
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Speichern der Einstellungen',
        severity: 'error'
      });
    }
  };

  // Behandle Änderungen an den Einstellungen
  const handleChange = (event) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.value
    });
  };
  
  // Behandle Änderungen an den Benachrichtigungspräferenzen
  const handleNotificationPreferenceChange = (event) => {
    setSettings({
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [event.target.name]: event.target.checked
      }
    });
  };

  // Schließe Snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prevState => ({
      ...prevState,
      open: false
    }));
  }, []);

  // Automatische Ausblendung der Benachrichtigung
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        handleCloseSnackbar();
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [snackbar.open, handleCloseSnackbar]);

  if (loading) {
    return <Typography>Lade Einstellungen...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Einstellungen</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Erscheinungsbild</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                />
              }
              label={mode === 'dark' ? 'Dunkelmodus' : 'Hellmodus'}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Wähle zwischen Hell- und Dunkelmodus für die Benutzeroberfläche.
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>Allgemeine Einstellungen</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="state-label">Bundesland</InputLabel>
              <Select
                labelId="state-label"
                id="state"
                name="state"
                value={settings.state}
                label="Bundesland"
                onChange={handleChange}
              >
                {states.map((state) => (
                  <MenuItem key={state.code} value={state.code}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Das ausgewählte Bundesland wird für die Anzeige von Feiertagen im Kalender verwendet.
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>Benachrichtigungseinstellungen</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notificationPreferences.email}
                  onChange={handleNotificationPreferenceChange}
                  name="email"
                />
              }
              label="E-Mail-Benachrichtigungen"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notificationPreferences.telegram}
                  onChange={handleNotificationPreferenceChange}
                  name="telegram"
                  disabled={!telegramConnected}
                />
              }
              label="Telegram-Benachrichtigungen"
            />
            
            {!telegramConnected && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Um Telegram-Benachrichtigungen zu erhalten, verbinde deinen Account mit Telegram.
              </Typography>
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveSettings}
          >
            Einstellungen speichern
          </Button>
        </Box>
      </Paper>
      
      {/* Telegram-Verbindung Komponente */}
      <TelegramConnect />
      
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: 300
          }}
          onClose={handleCloseSnackbar}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default Settings;
