import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Grid,
  Paper,
  Stack
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Animation variants (optional, can be kept or removed based on preference)
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

const validateEmail = email => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const passwordStrength = password => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return Math.min(strength, 5);
};

const Register = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    setIsLoading(true);

    if (!name) {
      setError('Bitte gib deinen Namen ein.');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Bitte gib eine gültige E-Mail-Adresse ein');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setPasswordError('Das Passwort muss mindestens 8 Zeichen lang sein');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      navigate('/login', {
        state: {
          message: 'Registrierung erfolgreich! Du kannst dich jetzt anmelden.'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message ||
        'Bei der Registrierung ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength >= 4) return theme.palette.success.main;
    if (strength >= 2) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const commonTextFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.6)',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-error fieldset': {
        borderColor: theme.palette.error.light,
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      '&.Mui-error': {
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '& .MuiInputLabel-root.Mui-error': {
      color: theme.palette.error.light,
    },
    '& .MuiFormHelperText-root': {
      color: theme.palette.error.light,
    }
  };

  const commonInputPropsStyles = {
    style: {
      color: theme.palette.common.white,
      borderRadius: '8px',
    },
    sx: {
      '& input:-webkit-autofill': {
        WebkitBoxShadow: `0 0 0 100px rgba(20, 20, 40, 0.9) inset`,
        WebkitTextFillColor: theme.palette.common.white,
        caretColor: theme.palette.common.white,
        borderRadius: 'inherit',
        transition: 'background-color 5000s ease-in-out 0s',
      },
      '& input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
        WebkitBoxShadow: `0 0 0 100px rgba(20, 20, 40, 0.9) inset`,
        WebkitTextFillColor: theme.palette.common.white,
        borderRadius: 'inherit',
      },
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
      <Container maxWidth="lg">
        <Grid container spacing={5} alignItems="center" justifyContent="center">

          {/* Left Side - Optional Title/Info */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  color: theme.palette.common.white,
                  fontWeight: 'bold',
                  textAlign: 'left'
                }}
              >
                Join TimeFlow Today
              </Typography>
              <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Start organizing your time efficiently.
              </Typography>
            </motion.div>
          </Grid>

          {/* Right Side - Register Form */}
          <Grid item xs={12} md={6}>
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
                  color: theme.palette.common.white,
                }}
              >
                <motion.div variants={itemVariants}>
                  <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                    Konto erstellen
                  </Typography>
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" mb={4}>
                    Erstelle ein Konto, um mit TimeFlow zu starten.
                  </Typography>
                </motion.div>

                {error && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="error" sx={{ mb: 3, bgcolor: 'error.dark', color: '#fff' }}>{error}</Alert>
                  </motion.div>
                )}

                <Box component="form" onSubmit={handleRegister} noValidate>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Name"
                      variant="outlined"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      margin="normal"
                      required
                      InputLabelProps={{ shrink: true, style: { color: 'rgba(255, 255, 255, 0.7)' } }}
                      InputProps={commonInputPropsStyles}
                      sx={{ ...commonTextFieldStyles, mb: 2 }}
                    />
                  </motion.div>

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
                      error={!!emailError}
                      helperText={emailError ? <span style={{color: theme.palette.error.light}}>{emailError}</span> : ''}
                      InputLabelProps={{ shrink: true, style: { color: 'rgba(255, 255, 255, 0.7)' } }}
                      InputProps={commonInputPropsStyles}
                      sx={{ ...commonTextFieldStyles, mb: 2 }}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Passwort"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      margin="normal"
                      required
                      error={!!passwordError && passwordError !== 'Die Passwörter stimmen nicht überein'} // Only show length error here
                      InputLabelProps={{ shrink: true, style: { color: 'rgba(255, 255, 255, 0.7)' } }}
                      InputProps={{
                        ...commonInputPropsStyles,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ ...commonTextFieldStyles, mb: 1 }} // Reduced margin bottom
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                     <Box mb={2} mt={0.5}> {/* Adjusted margin top */}
                       <LinearProgress
                         variant="determinate"
                         value={passwordStrength(password) * 20}
                         sx={{
                           height: 6, // Slightly thicker
                           borderRadius: 3,
                           backgroundColor: 'rgba(255, 255, 255, 0.1)', // Darker background
                           '& .MuiLinearProgress-bar': {
                             backgroundColor: getPasswordStrengthColor(passwordStrength(password)),
                             borderRadius: 3,
                           }
                         }}
                       />
                       <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5, display: 'block' }}>
                         Passwortstärke: {['Sehr schwach', 'Schwach', 'Mäßig', 'Gut', 'Stark', 'Sehr stark'][passwordStrength(password)]}
                       </Typography>
                     </Box>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Passwort bestätigen"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      margin="normal"
                      required
                      error={!!passwordError}
                      helperText={passwordError ? <span style={{color: theme.palette.error.light}}>{passwordError}</span> : ''}
                      InputLabelProps={{ shrink: true, style: { color: 'rgba(255, 255, 255, 0.7)' } }}
                      InputProps={commonInputPropsStyles}
                      sx={{ ...commonTextFieldStyles, mb: 3 }}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading}
                      sx={{
                        py: 1.5,
                        borderRadius: '8px',
                        fontSize: 16,
                        fontWeight: 'medium',
                        color: theme.palette.common.white,
                        background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.primary.dark} 90%)`,
                        },
                        '&.Mui-disabled': {
                           background: theme.palette.action.disabledBackground,
                           color: theme.palette.action.disabled,
                           cursor: 'not-allowed',
                           pointerEvents: 'auto'
                        }
                      }}
                    >
                      {isLoading ? 'Registrierung läuft...' : 'Registrieren'}
                    </Button>
                  </motion.div>
                </Box>

                <motion.div variants={itemVariants}>
                  <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Bereits ein Konto?
                    </Typography>
                  </Divider>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box textAlign="center">
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="large" // Match size
                        sx={{
                          py: 1.5, // Match padding
                          borderRadius: '8px', // Match border radius
                          fontSize: 16, // Match font size
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          color: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            borderColor: theme.palette.primary.light,
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: theme.palette.primary.light,
                          }
                        }}
                      >
                        Zur Anmeldung
                      </Button>
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

export default Register;