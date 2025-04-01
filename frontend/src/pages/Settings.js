import React, { useState, useEffect, useCallback } from 'react';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import api from '../utils/api';
import TelegramConnect from '../components/Settings/TelegramConnect';
import { Alert } from '@mui/material';

const Settings = () => {
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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const settingsResponse = await api.get('/api/users/settings');
        
        const loadedSettings = {
          ...settingsResponse.data,
          showHolidays: settingsResponse.data.showHolidays !== undefined ? settingsResponse.data.showHolidays : true,
          notificationPreferences: settingsResponse.data.notificationPreferences || {
            email: true,
            telegram: false
          }
        };
        
        setSettings(loadedSettings);
        
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

      const oldState = localStorage.getItem('userState');
      localStorage.setItem('userState', settings.state);
      
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

  const handleChange = event => {
    const { name, value } = event.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };

  const handleSwitchChange = event => {
    const { name, checked } = event.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: checked
    }));
  };
  
  const handleNotificationPreferenceChange = event => {
    setSettings({
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [event.target.name]: event.target.checked
      }
    });
  };

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prevState => ({
      ...prevState,
      open: false
    }));
  }, []);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        handleCloseSnackbar();
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [snackbar.open, handleCloseSnackbar]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#0f1120",
        color: "#ffffff",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Lade Einstellungen...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: mode === 'dark' ? "#0f1120" : "#f8fafc",
      color: mode === 'dark' ? "#ffffff" : "#1e293b",
      padding: "1.5rem",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif",
    }}>
      <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          background: "linear-gradient(90deg, #ff0066, #3399ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Einstellungen
        </h1>

        {/* Erscheinungsbild */}
        <div style={{
          backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
          borderRadius: "1rem",
          padding: "2rem",
          marginBottom: "1.5rem",
          boxShadow: mode === 'dark' 
            ? "0 4px 20px rgba(0, 0, 0, 0.2)" 
            : "0 4px 20px rgba(148, 163, 184, 0.1)",
          border: mode === 'dark' ? "none" : "1px solid #e2e8f0"
        }}>
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "600", 
            marginBottom: "1.5rem",
            color: mode === 'dark' ? "#ffffff" : "#1e293b"
          }}>
            Erscheinungsbild
          </h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: mode === 'dark' ? "#ffffff" : "#1e293b"
            }}>
              <input
                type="checkbox"
                checked={mode === 'dark'}
                onChange={toggleTheme}
                style={{
                  marginRight: "0.75rem",
                  width: "1.25rem",
                  height: "1.25rem",
                }}
              />
              <span>{mode === 'dark' ? 'Dunkelmodus' : 'Hellmodus'}</span>
            </label>
            <p style={{ 
              fontSize: "0.875rem", 
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b", 
              marginTop: "0.5rem" 
            }}>
              Wähle zwischen Hell- und Dunkelmodus für die Benutzeroberfläche.
            </p>
          </div>
        </div>

        {/* Allgemeine Einstellungen */}
        <div style={{
          backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
          borderRadius: "1rem",
          padding: "2rem",
          marginBottom: "1.5rem",
          boxShadow: mode === 'dark' 
            ? "0 4px 20px rgba(0, 0, 0, 0.2)" 
            : "0 4px 20px rgba(148, 163, 184, 0.1)",
          border: mode === 'dark' ? "none" : "1px solid #e2e8f0"
        }}>
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "600", 
            marginBottom: "1.5rem",
            color: mode === 'dark' ? "#ffffff" : "#1e293b"
          }}>
            Allgemeine Einstellungen
          </h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem",
              color: mode === 'dark' ? "#ffffff" : "#1e293b"
            }}>
              Bundesland
            </label>
            <select
              value={settings.state}
              onChange={handleChange}
              name="state"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                color: mode === 'dark' ? "#ffffff" : "#1e293b",
                fontSize: "1rem",
              }}
            >
              {states.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
            <p style={{ 
              fontSize: "0.875rem", 
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
              marginTop: "0.5rem" 
            }}>
              Wähle dein Bundesland für die korrekte Anzeige von Feiertagen.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: mode === 'dark' ? "#ffffff" : "#1e293b"
            }}>
              <input
                type="checkbox"
                checked={settings.showHolidays}
                onChange={handleSwitchChange}
                name="showHolidays"
                style={{
                  marginRight: "0.75rem",
                  width: "1.25rem",
                  height: "1.25rem",
                }}
              />
              <span>Feiertage anzeigen</span>
            </label>
            <p style={{ 
              fontSize: "0.875rem", 
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
              marginTop: "0.5rem" 
            }}>
              Zeige Feiertage im Kalender an.
            </p>
          </div>
        </div>

        {/* Benachrichtigungen */}
        <div style={{
          backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
          borderRadius: "1rem",
          padding: "2rem",
          marginBottom: "1.5rem",
          boxShadow: mode === 'dark' 
            ? "0 4px 20px rgba(0, 0, 0, 0.2)" 
            : "0 4px 20px rgba(148, 163, 184, 0.1)",
          border: mode === 'dark' ? "none" : "1px solid #e2e8f0"
        }}>
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "600", 
            marginBottom: "1.5rem",
            color: mode === 'dark' ? "#ffffff" : "#1e293b"
          }}>
            Benachrichtigungen
          </h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: mode === 'dark' ? "#ffffff" : "#1e293b"
            }}>
              <input
                type="checkbox"
                checked={settings.notificationPreferences.email}
                onChange={handleNotificationPreferenceChange}
                name="email"
                style={{
                  marginRight: "0.75rem",
                  width: "1.25rem",
                  height: "1.25rem",
                }}
              />
              <span>E-Mail-Benachrichtigungen</span>
            </label>
            <p style={{ 
              fontSize: "0.875rem", 
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
              marginTop: "0.5rem" 
            }}>
              Erhalte Erinnerungen per E-Mail.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: telegramConnected ? "pointer" : "not-allowed",
              opacity: telegramConnected ? 1 : 0.5,
              color: mode === 'dark' ? "#ffffff" : "#1e293b"
            }}>
              <input
                type="checkbox"
                checked={settings.notificationPreferences.telegram}
                onChange={handleNotificationPreferenceChange}
                name="telegram"
                disabled={!telegramConnected}
                style={{
                  marginRight: "0.75rem",
                  width: "1.25rem",
                  height: "1.25rem",
                }}
              />
              <span>Telegram-Benachrichtigungen</span>
            </label>
            <p style={{ 
              fontSize: "0.875rem", 
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
              marginTop: "0.5rem" 
            }}>
              Erhalte Erinnerungen über Telegram.
            </p>

            <div style={{ marginTop: "1rem" }}>
              <TelegramConnect 
                onConnected={(connected, botName) => {
                  setTelegramConnected(connected);
                  setTelegramBotName(botName);
                  
                  if (connected && !settings.notificationPreferences.telegram) {
                    handleNotificationPreferenceChange({ 
                      target: { 
                        name: 'telegram', 
                        checked: true 
                      } 
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Speichern Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 2rem",
              background: "linear-gradient(90deg, #ff0066, #3399ff)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            Einstellungen speichern
          </button>
        </div>
      </div>

      {/* Snackbar für Feedback-Meldungen */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          style={{ 
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
    </div>
  );
};

export default Settings;
