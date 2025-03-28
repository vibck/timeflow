import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import api from '../utils/api';

const passwordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return Math.min(strength, 5);
};

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/reset-password', { 
        token, 
        newPassword 
      });
      setSuccess('Passwort erfolgreich aktualisiert! Du kannst dich jetzt anmelden.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Zurücksetzen des Passworts');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Container maxWidth="sm">
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
          <Alert severity="error">
            Ungültiger oder fehlender Reset-Token
          </Alert>
        </Box>
      </Container>
    );
  }

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
              Passwort zurücksetzen
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3 }}>
              Gib ein neues Passwort für dein Konto ein
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
                label="Neues Passwort"
                variant="outlined"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 1 }}
              />

              <Box mb={2}>
                <LinearProgress 
                  variant="determinate" 
                  value={passwordStrength(newPassword) * 20}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: passwordStrength(newPassword) >= 4 ? 
                        theme.palette.success.main : 
                        passwordStrength(newPassword) >= 2 ? 
                        theme.palette.warning.main : 
                        theme.palette.error.main
                    }
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  Passwortstärke: {['Sehr schwach', 'Schwach', 'Mäßig', 'Gut', 'Stark', 'Sehr stark'][passwordStrength(newPassword)]}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Passwort bestätigen"
                variant="outlined"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Wird aktualisiert...' : 'Passwort speichern'}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default ResetPassword;