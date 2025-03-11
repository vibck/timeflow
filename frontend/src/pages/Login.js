import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper, Alert } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Zeige Erfolgsmeldung an, wenn von der Registrierungsseite weitergeleitet
    if (location.state && location.state.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setSuccess('');
    
    // E-Mail-Validierung
    if (!validateEmail(email)) {
      setEmailError('Bitte gib eine gültige E-Mail-Adresse ein');
      return;
    }
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { 
        email,
        password 
      });
      
      if (response.data.token) {
        login(response.data.token);
      } else {
        setError('Anmeldung fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Anmeldung fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            TimeFlow
          </Typography>
          <Typography component="h2" variant="h5" gutterBottom>
            Anmelden
          </Typography>
          
          {success && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
          
          <Box sx={{ mt: 3, width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ mt: 2 }}
            >
              Mit Google anmelden
            </Button>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
              Oder mit E-Mail anmelden:
            </Typography>
            
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="E-Mail-Adresse"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                error={!!emailError}
                helperText={emailError}
              />
              <TextField
                fullWidth
                label="Passwort"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                sx={{ mt: 2 }}
              >
                Anmelden
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Noch kein Konto? Registrieren
                  </Typography>
                </Link>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
