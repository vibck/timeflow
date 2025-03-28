import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import api from '../utils/api';

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess('Wenn ein Konto mit dieser E-Mail existiert, wurde ein Reset-Link versendet');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Anfordern des Passwort-Resets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 500 }}
        >
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Passwort vergessen
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3 }}>
              Gib deine E-Mail-Adresse ein, um einen Reset-Link zu erhalten
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="E-Mail-Adresse"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: 16,
                  fontWeight: 'medium'
                }}
              >
                {isLoading ? 'Wird gesendet...' : 'Reset-Link anfordern'}
              </Button>
            </Box>

            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="textSecondary">
                Zurück zur{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography 
                    component="span" 
                    variant="body2" 
                    color="primary"
                    fontWeight="medium"
                  >
                    Anmeldung
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default ForgotPassword;