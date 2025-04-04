import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode: mode,
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff'
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#fff'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#fff'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    background: {
      default: mode === 'dark' ? '#0f1120' : '#f8fafc',
      paper: mode === 'dark' ? '#1a1f3e' : '#ffffff'
    },
    text: {
      primary: mode === 'dark' ? '#fff' : '#1e293b',
      secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#64748b',
      disabled: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.35
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
      lineHeight: 1.5
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
      lineHeight: 1.57
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
      lineHeight: 1.57
    },
    button: {
      fontSize: '0.95rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.12)',
    '0 6px 12px rgba(0,0,0,0.14)',
    '0 8px 16px rgba(0,0,0,0.16)',
    '0 10px 20px rgba(0,0,0,0.18)',
    '0 12px 24px rgba(0,0,0,0.2)',
    '0 14px 28px rgba(0,0,0,0.22)',
    '0 16px 32px rgba(0,0,0,0.24)',
    '0 18px 36px rgba(0,0,0,0.26)',
    '0 20px 40px rgba(0,0,0,0.28)',
    '0 22px 44px rgba(0,0,0,0.3)',
    '0 24px 48px rgba(0,0,0,0.32)',
    '0 26px 52px rgba(0,0,0,0.34)',
    '0 28px 56px rgba(0,0,0,0.36)',
    '0 30px 60px rgba(0,0,0,0.38)',
    '0 32px 64px rgba(0,0,0,0.4)',
    '0 34px 68px rgba(0,0,0,0.42)',
    '0 36px 72px rgba(0,0,0,0.44)',
    '0 38px 76px rgba(0,0,0,0.46)',
    '0 40px 80px rgba(0,0,0,0.48)',
    '0 42px 84px rgba(0,0,0,0.5)',
    '0 44px 88px rgba(0,0,0,0.52)',
    '0 46px 92px rgba(0,0,0,0.54)',
    '0 48px 96px rgba(0,0,0,0.56)'
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: mode === 'dark' 
            ? 'linear-gradient(to bottom right, #0f1120, #1a1f3e)'
            : '#f8fafc',
          minHeight: '100vh'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.02em',
          padding: '10px 24px'
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' ? '#1a1f3e' : '#ffffff',
          backdropFilter: 'blur(10px)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid #e2e8f0'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: 24,
          backgroundColor: mode === 'dark' ? '#1a1f3e' : '#ffffff',
          backdropFilter: 'blur(10px)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid #e2e8f0',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark'
              ? '0 6px 40px rgba(0, 0, 0, 0.15)'
              : '0 6px 40px rgba(148, 163, 184, 0.1)',
            border: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.15)'
              : '1px solid #e2e8f0'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)'
              : '#ffffff',
            backdropFilter: 'blur(10px)',
            border: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid #e2e8f0',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : '#f8fafc',
              border: mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid #94a3b8'
            },
            '&.Mui-focused': {
              backgroundColor: mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : '#ffffff',
              border: '1px solid rgba(33, 150, 243, 0.5)',
              boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)'
            }
          }
        }
      }
    }
  }
});

export default getTheme;
