import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setError('Kein Token erhalten. Bitte versuche es erneut.');
      return;
    }

    login(token)
      .then(() => {
        navigate('/');
      })
      .catch(err => {
        console.error('Login error:', err);
        setError('Fehler bei der Anmeldung. Bitte versuche es erneut.');
      });
  }, [location, login, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Anmeldung wird abgeschlossen...</Typography>
        </>
      )}
    </Box>
  );
};

export default AuthCallback;
