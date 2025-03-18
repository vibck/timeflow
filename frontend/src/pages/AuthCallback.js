import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        // Token aus der URL extrahieren
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          setError('Kein Authentifizierungstoken gefunden');
          setLoading(false);
          return;
        }

        // Mit dem erhaltenen Token einloggen
        await login(token);
        
        // Loading-State beenden (obwohl wir sofort redirecten werden)
        setLoading(false);
      } catch (err) {
        console.error('Fehler bei der Authentifizierung:', err);
        setError('Fehler bei der Authentifizierung. Bitte versuche es erneut.');
        setLoading(false);
      }
    };

    processAuthCallback();
  }, [location, login]);

  if (!loading && !error) {
    // Weiterleitung zum Dashboard bei Erfolg
    return <Navigate to="/" />;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        textAlign: 'center',
        p: 2
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Authentifizierung wird abgeschlossen...
          </Typography>
        </>
      ) : (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default AuthCallback; 