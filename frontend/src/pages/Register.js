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
  LinearProgress
} from '@mui/material';
import { 
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Animation variants
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
  
  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Complexity checks
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
    
    // Validierungen
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

  return (
    <Container component="main" maxWidth="sm">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%' }}
      >
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
          <motion.div variants={itemVariants} style={{ width: '100%', maxWidth: 500 }}>
            <Box
              sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: theme.shadows[10],
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box textAlign="center" mb={4}>
                <Typography
                  variant="h3"
                  component="h1"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  Konto erstellen
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Erstelle ein Konto, um mit TimeFlow zu starten
                </Typography>
              </Box>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                </motion.div>
              )}

              <Box component="form" onSubmit={handleRegister} noValidate>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

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
                  helperText={emailError}
                  sx={{ mb: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  fullWidth
                  label="Passwort"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  margin="normal"
                  required
                  error={!!passwordError}
                  sx={{ mb: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Box mb={2}>
                  <LinearProgress 
                    variant="determinate" 
                    value={passwordStrength(password) * 20} 
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: passwordStrength(password) >= 4 ? 
                          theme.palette.success.main : 
                          passwordStrength(password) >= 2 ? 
                          theme.palette.warning.main : 
                          theme.palette.error.main
                      }
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Passwortstärke: {['Sehr schwach', 'Schwach', 'Mäßig', 'Gut', 'Stark', 'Sehr stark'][passwordStrength(password)]}
                  </Typography>
                </Box>

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
                  helperText={passwordError}
                  sx={{ mb: 3 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
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
                    {isLoading ? 'Registrierung läuft...' : 'Registrieren'}
                  </Button>
                </motion.div>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Bereits ein Konto?
                </Typography>
              </Divider>

              <Box textAlign="center">
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: 16
                    }}
                  >
                    Zur Anmeldung
                  </Button>
                </Link>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Register;