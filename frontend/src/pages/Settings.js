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
  Switch,
  useTheme
} from '@mui/material';
import api from '../utils/api';
import TelegramConnect from '../components/Settings/TelegramConnect';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const [settings, setSettings] = useState({
    state: 'BY',
    showHolidays: true,
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
          showHolidays: settingsResponse.data.showHolidays !== undefined ? settingsResponse.data.showHolidays : true,
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

  // Behandle Änderungen an den Formularfeldern
  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };

  // Behandle Änderungen an den Schaltern
  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: checked
    }));
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
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4">Einstellungen</Typography>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: 1, 
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
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
              Wähle dein Bundesland für die korrekte Anzeige von Feiertagen.
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showHolidays}
                  onChange={handleSwitchChange}
                />
              }
              label="Feiertage anzeigen"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Zeige Feiertage im Kalender an.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: 1, 
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>Benachrichtigungen</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notificationPreferences.email}
                  onChange={handleNotificationPreferenceChange}
                />
              }
              label="E-Mail-Benachrichtigungen"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Erhalte Erinnerungen per E-Mail.
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notificationPreferences.telegram}
                  onChange={handleNotificationPreferenceChange}
                  disabled={!telegramConnected}
                />
              }
              label="Telegram-Benachrichtigungen"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Erhalte Erinnerungen über Telegram.
            </Typography>
            
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 1
            }}>
              <TelegramConnect 
                onConnected={(connected, botName) => {
                  setTelegramConnected(connected);
                  setTelegramBotName(botName);
                  
                  if (connected && !settings.notificationPreferences.telegram) {
                    // Aktiviere Telegram-Benachrichtigungen automatisch, wenn verbunden
                    handleNotificationPreferenceChange({ target: { checked: true } });
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleSaveSettings}
          disabled={loading}
        >
          Einstellungen speichern
        </Button>
      </Box>
      
      {/* Snackbar für Feedback-Meldungen */}
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
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default Settings;
