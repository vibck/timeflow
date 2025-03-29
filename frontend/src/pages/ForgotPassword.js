import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // useNavigate removed, as it is not used
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Grid // Grid hinzugefügt
  // Stack entfernt, da nicht verwendet
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import api from '../utils/api';

// Animation variants (kopiert von Login/Register)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const ForgotPassword = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Gemeinsame Stile (kopiert von Register)
  const commonTextFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)'
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.6)'
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main
      },
      '&.Mui-error fieldset': {
        borderColor: theme.palette.error.light
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      },
      '&.Mui-error': {
        backgroundColor: 'rgba(255, 82, 82, 0.1)'
      }
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)'
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.primary.main
    },
    '& .MuiInputLabel-root.Mui-error': { // Error label color hinzugefügt
      color: theme.palette.error.light
    },
    '& .MuiFormHelperText-root': { // Helper text color hinzugefügt
      color: theme.palette.error.light
    }
  };

  const commonInputPropsStyles = {
    style: {
      color: theme.palette.common.white,
      borderRadius: '8px'
    },
    sx: {
      '& input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 100px rgba(20, 20, 40, 0.9) inset',
        WebkitTextFillColor: theme.palette.common.white,
        caretColor: theme.palette.common.white,
        borderRadius: 'inherit',
        transition: 'background-color 5000s ease-in-out 0s'
      },
      '& input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
        WebkitBoxShadow: '0 0 0 100px rgba(20, 20, 40, 0.9) inset',
        WebkitTextFillColor: theme.palette.common.white,
        borderRadius: 'inherit'
      }
    }
  };


  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Einfache E-Mail-Validierung hinzugefügt
    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess('If an account with this email exists, a reset link has been sent. Please check your inbox (including the spam folder).');
      setEmail(''); // Feld leeren nach Erfolg
    } catch (err) {
      // Zeige eine generische Fehlermeldung, um E-Mail-Enumeration zu vermeiden
      setError('Anfrage fehlgeschlagen. Bitte versuche es später erneut.');
      console.error('Forgot Password Error:', err); // Logge den tatsächlichen Fehler für Debugging
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #1a1a2e, #16213e)',
      p: 2
    }}>
      <Container maxWidth="sm"> {/* MaxWidth auf sm gesetzt für ein kompakteres Formular */}
        <Grid container spacing={5} alignItems="center" justifyContent="center">
          <Grid item xs={12}> {/* Nur eine Spalte für dieses einfache Formular */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <Paper
                elevation={12}
                sx={{
                  p: { xs: 3, sm: 5 },
                  borderRadius: 4,
                  background: 'rgba(20, 20, 40, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: theme.palette.common.white
                }}
              >
                <motion.div variants={itemVariants}>
                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom align="center">
                    Passwort vergessen
                  </Typography>
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" align="center" mb={4}>
                    Gib deine E-Mail-Adresse ein. Wir senden dir einen Link, um dein Passwort zurückzusetzen.
                  </Typography>
                </motion.div>

                {error && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="error" sx={{ mb: 3, bgcolor: 'error.dark', color: '#fff' }}>{error}</Alert>
                  </motion.div>
                )}

                {success && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="success" sx={{ mb: 3, bgcolor: 'success.dark', color: '#fff' }}>{success}</Alert>
                  </motion.div>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="E-Mail-Adresse"
                      variant="outlined"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      margin="normal"
                      required
                      InputLabelProps={{ shrink: true, style: { color: 'rgba(255, 255, 255, 0.7)' } }}
                      InputProps={commonInputPropsStyles}
                      sx={{ ...commonTextFieldStyles, mb: 3 }} // Angepasster Margin Bottom
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading || !!success} // Button deaktivieren nach Erfolg
                      sx={{
                        py: 1.5,
                        borderRadius: '8px',
                        fontSize: 16,
                        fontWeight: 'medium',
                        color: theme.palette.common.white,
                        background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.primary.dark} 90%)`
                        },
                        '&.Mui-disabled': {
                          background: theme.palette.action.disabledBackground,
                          color: theme.palette.action.disabled,
                          cursor: 'not-allowed',
                          pointerEvents: 'auto'
                        }
                      }}
                    >
                      {isLoading ? 'Wird gesendet...' : 'Reset-Link anfordern'}
                    </Button>
                  </motion.div>
                </Box>

                <motion.div variants={itemVariants}>
                  <Box textAlign="center" mt={4}> {/* Mehr Abstand nach oben */}
                    <Link
                      to="/login"
                      style={{ textDecoration: 'none' }}
                      sx={{
                        display: 'inline-block', // Ensures the link only takes the width of its content
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          color: theme.palette.primary.light
                          // Optional: Add underline on hover if desired
                          // textDecoration: 'underline'
                        }
                      }}
                    >
                      <Typography variant="body2" component="span"> {/* Use component="span" to keep it inline */}
                        Zurück zur Anmeldung
                      </Typography>
                    </Link>
                  </Box>
                </motion.div>

              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
