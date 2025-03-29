import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    },
    error: {
      main: '#f44336'
    },
    warning: {
      main: '#ff9800'
    },
    info: {
      main: '#2196f3'
    },
    success: {
      main: '#4caf50'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2rem',
      fontWeight: 500
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 500
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 500
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400
    }
  }
});

export default theme;
