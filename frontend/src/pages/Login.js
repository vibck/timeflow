import React, { useState, useEffect } from 'react'; // Changed to single quotes
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
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Paper
} from '@mui/material';
import {
  Google as GoogleIcon,
  // Facebook as FacebookIcon, // Removed as unused
  // GitHub as GitHubIcon, // Removed as unused
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

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

const Login = () => {
  const theme = useTheme();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
  
  // Placeholder for other social logins (commented out as unused)
  // const handleFacebookLogin = () => { console.warn('Facebook login not implemented'); };
  // const handleGitHubLogin = () => { console.warn('GitHub login not implemented'); };


  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setSuccess('');
    setIsLoading(true);

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address'); 
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.token) {
        // TODO: Handle "Remember Me" functionality (e.g., store token differently)
        await login(response.data.token);
      } else {
        setError('Login failed. Please check your credentials.'); 
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Anmeldung fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.');
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
      // Using a dark background similar to the image
      background: 'linear-gradient(to bottom right, #1a1a2e, #16213e)', // Example gradient
      p: 2
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={5} alignItems="center" justifyContent="center">
          
          {/* Left Side */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    color: theme.palette.common.white, 
                    fontWeight: 'bold',
                    fontSize: '3rem', // Restored size
                    textAlign: { xs: 'center', md: 'left' }
                  }}

              >
                  Welcome Back to TimeFlow




              </Typography>
            </motion.div>
          </Grid>
          {/* Right Side - Login Form */}
                <Grid item xs={12} md={6}>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <Paper 
                elevation={12} // More pronounced shadow
                sx={{
                  p: { xs: 3, sm: 5 }, // Responsive padding
                  borderRadius: 4, // Rounded corners like the image
                  // Background with subtle gradient/effect matching the image's form
                  background: 'rgba(20, 20, 40, 0.8)', // Dark semi-transparent background
                  backdropFilter: 'blur(10px)', // Blur effect for the background
                  border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
                  color: theme.palette.common.white // Ensure text inside is white
                }}
              >
                <motion.div variants={itemVariants}>
                  <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                    Login
                  </Typography>
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" mb={4}>
                    Glad you're back!
                  </Typography>
                </motion.div>

                {success && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="success" sx={{ mb: 3, bgcolor: 'success.dark', color: '#fff' }}>{success}</Alert>
                  </motion.div>
                )}

                {error && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="error" sx={{ mb: 3, bgcolor: 'error.dark', color: '#fff' }}>{error}</Alert>
                  </motion.div>
                )}

                <Box component="form" onSubmit={handleLogin} noValidate>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="E-Mail-Adresse" // Keeping Email as backend expects it
                      variant="outlined" // Changed variant to outlined
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      margin="normal"
                      required
                      error={!!emailError}
                      helperText={emailError ? <span style={{ color: theme.palette.error.light }}>{emailError}</span> : ''}
                      InputLabelProps={{
                        shrink: true, // Ensure label is always shrunk
                        style: { color: 'rgba(255, 255, 255, 0.7)' }
                      }}
                      InputProps={{
                        style: {
                          color: theme.palette.common.white,
                          borderRadius: '8px'
                          // backgroundColor is handled by MuiOutlinedInput-root below for consistency
                        },
                        // Add autofill styles here
                        sx: {
                          // Target the input element itself for autofill styles
                          '& input:-webkit-autofill': {
                            WebkitBoxShadow: '0 0 0 100px rgba(20, 20, 40, 0.9) inset', // Use a background similar to the form paper
                            WebkitTextFillColor: theme.palette.common.white, // Ensure text color is white
                            caretColor: theme.palette.common.white, // Ensure cursor color is white
                            borderRadius: 'inherit', // Inherit border radius from the root element
                            transition: 'background-color 5000s ease-in-out 0s' // Delay background color change
                          },
                          '& input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                            WebkitBoxShadow: '0 0 0 100px rgba(20, 20, 40, 0.9) inset', // Keep the same shadow on interaction
                            WebkitTextFillColor: theme.palette.common.white,
                            borderRadius: 'inherit'
                          }
                        }
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)', // Set background color here
                          borderRadius: '8px', // Keep border radius
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.6)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main
                          },
                          '&.Mui-error fieldset': { // Style for error state border
                            borderColor: theme.palette.error.light
                          },
                          // Ensure background doesn't change on hover/focus if not desired
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          },
                          '&.Mui-error': { // Style for error state background
                            // Keep background consistent or slightly indicate error
                            backgroundColor: 'rgba(255, 82, 82, 0.1)'
                          }
                        },
                        '& .MuiInputLabel-root': { // Ensure label color is correct
                          color: 'rgba(255, 255, 255, 0.7)'
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: theme.palette.primary.main // Focused label color
                        },
                        '& .MuiInputLabel-root.Mui-error': { // Error label color
                          color: theme.palette.error.light
                        },
                        '& .MuiFormHelperText-root': {
                          color: theme.palette.error.light // Helper text color
                        }
                      }}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Password"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      margin="normal"
                      required
                      InputLabelProps={{
                        shrink: true, // Ensure label is always shrunk
                        style: { color: 'rgba(255, 255, 255, 0.7)' }
                      }}
                      InputProps={{
                        style: {
                          color: theme.palette.common.white,
                          borderRadius: '8px'
                          // backgroundColor is handled by MuiOutlinedInput-root below for consistency
                        },
                        // Add autofill styles here
                        sx: {
                          // Target the input element itself for autofill styles
                          '& input:-webkit-autofill': {
                            WebkitBoxShadow: '0 0 0 100px rgba(20, 20, 40, 0.9) inset', // Use a background similar to the form paper
                            WebkitTextFillColor: theme.palette.common.white, // Ensure text color is white
                            caretColor: theme.palette.common.white, // Ensure cursor color is white
                            borderRadius: 'inherit', // Inherit border radius from the root element
                            transition: 'background-color 5000s ease-in-out 0s' // Delay background color change
                          },
                          '& input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                            WebkitBoxShadow: '0 0 0 100px rgba(20, 20, 40, 0.9) inset', // Keep the same shadow on interaction
                            WebkitTextFillColor: theme.palette.common.white,
                            borderRadius: 'inherit'
                          }
                        },
                        // removed notched: false
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.6)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: theme.palette.primary.main // Label color on focus
                        }
                      }}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={rememberMe} 
                            onChange={e => setRememberMe(e.target.checked)} 
                            name="rememberMe" 
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              '&.Mui-checked': {
                                color: theme.palette.primary.main // Use primary color when checked
                              }
                            }}
                          />
                        }
                        label={<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Remember me</Typography>}
                      />
                      <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: theme.palette.primary.light } }}>
                           Forgot password?
                        </Typography>
                      </Link>
                    </Box>
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
                      {isLoading ? 'Logging in...' : 'Login'} 
                    </Button>

                  </motion.div>
                </Box>

                <motion.div variants={itemVariants}>
                  <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Or
                    </Typography>
                  </Divider>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
                    <IconButton onClick={handleGoogleLogin} sx={{ color: '#DB4437', backgroundColor: 'rgba(255,255,255,0.9)', '&:hover': { backgroundColor: '#fff' } }}>
                      <GoogleIcon />
                    </IconButton>
                  </Stack>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography variant="body2" textAlign="center" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ textDecoration: 'none', color: theme.palette.primary.light, fontWeight: 'medium' }}>
                      Signup
                    </Link>
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
                    <Link to="/terms" style={{ textDecoration: 'none' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: theme.palette.primary.light } }}>
                            Terms & Conditions
                      </Typography>
                    </Link>
                    <Link to="/support" style={{ textDecoration: 'none' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: theme.palette.primary.light } }}>
                            Support
                      </Typography>
                    </Link>
                    <Link to="/customer-care" style={{ textDecoration: 'none' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: theme.palette.primary.light } }}>
                            Customer Care
                      </Typography>
                    </Link>
                  </Stack>
                </motion.div>

              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
