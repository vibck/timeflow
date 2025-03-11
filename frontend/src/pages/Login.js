import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleTestLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email });
      login(response.data.token);
    } catch (error) {
      console.error('Login error:', error);
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
          <Typography component="h2" variant="h6" gutterBottom>
            Dein Kalender für Gesundheit und Wohlbefinden
          </Typography>
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
              Oder für Testzwecke:
            </Typography>
            
            <form onSubmit={handleTestLogin}>
              <TextField
                fullWidth
                label="E-Mail-Adresse"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Test-Login
              </Button>
            </form>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
