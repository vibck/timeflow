import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import axios from 'axios';
import api from '../../utils/api';

const TelegramConnect = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [telegramStatus, setTelegramStatus] = useState({
    connected: false,
    botName: ''
  });
  const [qrCode, setQrCode] = useState(null);
  const [telegramLink, setTelegramLink] = useState('');

  // Lade den Telegram-Status beim Laden der Komponente
  useEffect(() => {
    fetchTelegramStatus();
  }, []);

  // Hole den Telegram-Status vom Backend
  const fetchTelegramStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/telegram/status');
      
      setTelegramStatus({
        connected: response.data.connected,
        botName: response.data.botName
      });
      
      // Wenn nicht verbunden, hole den QR-Code
      if (!response.data.connected) {
        fetchQrCode();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Fehler beim Laden des Telegram-Status:', err);
      setError('Fehler beim Laden des Telegram-Status. Bitte versuche es später erneut.');
      setLoading(false);
    }
  };

  // Hole den QR-Code vom Backend
  const fetchQrCode = async () => {
    try {
      const response = await api.get('/api/telegram/qrcode');
      
      setQrCode(response.data.qrCode);
      setTelegramLink(response.data.telegramLink);
      setTelegramStatus(prev => ({
        ...prev,
        botName: response.data.botName
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Fehler beim Laden des QR-Codes:', err);
      setError('Fehler beim Laden des QR-Codes. Bitte versuche es später erneut.');
      setLoading(false);
    }
  };

  // Trenne die Telegram-Verbindung
  const disconnectTelegram = async () => {
    setLoading(true);
    try {
      await api.delete('/api/telegram/disconnect');
      
      // Aktualisiere den Status und hole einen neuen QR-Code
      setTelegramStatus({
        connected: false,
        botName: telegramStatus.botName
      });
      
      fetchQrCode();
    } catch (err) {
      console.error('Fehler beim Trennen der Telegram-Verbindung:', err);
      setError('Fehler beim Trennen der Telegram-Verbindung. Bitte versuche es später erneut.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchTelegramStatus} 
          sx={{ mt: 2 }}
        >
          Erneut versuchen
        </Button>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Telegram-Verbindung
      </Typography>
      
      {telegramStatus.connected ? (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Dein Account ist mit Telegram verbunden. Du erhältst Benachrichtigungen über den Bot <strong>@{telegramStatus.botName}</strong>.
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={disconnectTelegram}
          >
            Telegram-Verbindung trennen
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Verbinde deinen Account mit Telegram, um Benachrichtigungen zu erhalten.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Scanne den QR-Code mit deiner Telegram-App oder klicke auf den Link unten:
            </Typography>
            
            {qrCode && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  border: '1px solid #eee',
                  p: 2,
                  borderRadius: 1
                }}
              >
                <img 
                  src={qrCode} 
                  alt="Telegram QR-Code" 
                  style={{ maxWidth: '200px', maxHeight: '200px' }} 
                />
              </Box>
            )}
            
            <Button 
              variant="contained" 
              color="primary" 
              href={telegramLink} 
              target="_blank" 
              rel="noopener noreferrer"
              fullWidth
              sx={{ mb: 1 }}
            >
              Mit @{telegramStatus.botName} verbinden
            </Button>
            
            <Typography variant="body2" color="textSecondary">
              Nach dem Öffnen des Links, starte den Bot mit dem Befehl, der automatisch angezeigt wird.
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TelegramConnect; 