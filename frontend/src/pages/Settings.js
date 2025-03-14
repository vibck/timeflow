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
  Alert
} from '@mui/material';
import api from '../utils/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    state: 'BY'
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

  // Lade Benutzereinstellungen beim Seitenaufruf
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get('/api/users/settings');

        setSettings(response.data);
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
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Das ausgewählte Bundesland wird für die Anzeige von Feiertagen im Kalender verwendet.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveSettings}
            >
              Einstellungen speichern
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
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
