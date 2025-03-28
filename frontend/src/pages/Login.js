import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Alert,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Google as GoogleIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

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

const Login = () => {
  const theme = useTheme();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setSuccess('');
    setIsLoading(true);
    
    if (!validateEmail(email)) {
      setEmailError('Bitte gib eine gültige E-Mail-Adresse ein');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/api/auth/login', { 
        email,
        password 
      });
      
      if (response.data.token) {
        await login(response.data.token);
      } else {
        setError('Anmeldung fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Anmeldung fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.');
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
                  Willkommen zurück
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Melde dich an, um auf deine Termine zuzugreifen
                </Typography>
              </Box>

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                </motion.div>
              )}

              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1.5,
                  mb: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: 16
                }}
              >
                Mit Google fortfahren
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Oder mit E-Mail
                </Typography>
              </Divider>

              <Box component="form" onSubmit={handleLogin} noValidate>
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
                  sx={{ mb: 2 }}
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

                <Box textAlign="right" mb={3}>
                  <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Passwort vergessen?
                    </Typography>
                  </Link>
                </Box>

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
                    {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
                  </Button>
                </motion.div>
              </Box>

              <Box textAlign="center" mt={3}>
                <Typography variant="body2" color="textSecondary">
                  Noch kein Konto?{' '}
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <Typography 
                      component="span" 
                      variant="body2" 
                      color="primary"
                      fontWeight="medium"
                    >
                      Registrieren
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login;
