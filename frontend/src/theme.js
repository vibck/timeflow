import { createTheme } from '@mui/material/styles';

// Annäherung der Farben aus dem Bild
const primaryBlue = '#3B82F6'; // Ein Blauton für den Gradientenstart
const primaryPurple = '#8B5CF6'; // Ein Lilaton für den Gradientenendpunkt und Akzente
const darkBackground = '#121212'; // Sehr dunkler Hintergrund
const paperBackground = '#1E1E1E'; // Etwas hellerer Hintergrund für die Karte
const textColor = '#FFFFFF';
const secondaryTextColor = '#B0B0B0';

// Helle Modus Farben (Beispiel - können angepasst werden)
const lightBackground = '#FFFFFF';
const lightPaperBackground = '#F5F5F5';
const lightTextColor = '#000000';
const lightSecondaryTextColor = '#555555';

// Funktion zur Erstellung des Themes
const createAppTheme = (mode) => {
  const isDarkMode = mode === 'dark';

  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: primaryBlue,
      },
      secondary: {
        main: primaryPurple,
      },
      background: {
        default: isDarkMode ? darkBackground : lightBackground,
        paper: isDarkMode ? paperBackground : lightPaperBackground,
      },
      text: {
        primary: isDarkMode ? textColor : lightTextColor,
        secondary: isDarkMode ? secondaryTextColor : lightSecondaryTextColor,
      },
      // Gradient entfernt - MUI unterstützt keine Gradienten direkt in der Palette.
      // Gradienten müssen bei Bedarf direkt in Komponenten gestylt werden.
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderColor: isDarkMode ? secondaryTextColor : lightSecondaryTextColor,
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? textColor : lightTextColor,
              },
              '&.Mui-focused fieldset': {
                borderColor: primaryPurple,
              },
            },
            '& .MuiInputLabel-root': {
              color: isDarkMode ? secondaryTextColor : lightSecondaryTextColor,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: primaryPurple,
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            padding: '10px 20px',
          },
          containedPrimary: {
            color: isDarkMode ? textColor : lightTextColor, // Textfarbe an Modus anpassen
            // Gradient muss weiterhin separat angewendet werden, falls gewünscht
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', // Divider-Farbe an Modus anpassen
          }
        }
      }
    },
  });
};

export default createAppTheme;