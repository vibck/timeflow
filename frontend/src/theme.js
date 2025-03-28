import { createTheme } from '@mui/material/styles';

// Annäherung der Farben aus dem Bild
const primaryBlue = '#3B82F6'; // Ein Blauton für den Gradientenstart
const primaryPurple = '#8B5CF6'; // Ein Lilaton für den Gradientenendpunkt und Akzente
const darkBackground = '#121212'; // Sehr dunkler Hintergrund
const paperBackground = '#1E1E1E'; // Etwas hellerer Hintergrund für die Karte
const textColor = '#FFFFFF';
const secondaryTextColor = '#B0B0B0';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primaryBlue, // Basis-Blau
    },
    secondary: {
      main: primaryPurple, // Basis-Lila
    },
    background: {
      default: darkBackground,
      paper: paperBackground,
    },
    text: {
      primary: textColor,
      secondary: secondaryTextColor,
    },
    // Optional: Definieren Sie einen Gradienten für spätere Verwendung
    gradient: {
      main: `linear-gradient(to right, ${primaryBlue}, ${primaryPurple})`,
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    // Weitere Typografie-Anpassungen nach Bedarf
  },
  shape: {
    borderRadius: 12, // Abgerundete Ecken für viele Elemente
  },
  components: {
    // Standard-Styles für Textfelder
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // Etwas weniger rund als die Hauptkarte
            '& fieldset': {
              borderColor: secondaryTextColor, // Hellerer Rand
            },
            '&:hover fieldset': {
              borderColor: textColor, // Weißer Rand beim Hover
            },
            '&.Mui-focused fieldset': {
              borderColor: primaryPurple, // Lila Rand bei Fokus
            },
          },
          '& .MuiInputLabel-root': { // Label-Farbe
             color: secondaryTextColor,
          },
          '& .MuiInputLabel-root.Mui-focused': { // Label-Farbe bei Fokus
             color: primaryPurple,
          },
        },
      },
    },
    // Standard-Styles für Buttons
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Flachere Buttons
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none', // Keine Großbuchstaben
          padding: '10px 20px',
        },
        // Spezifischer Style für den Haupt-Button (Gradient muss separat angewendet werden)
        containedPrimary: {
           // Hier könnten wir Standard-Fallback-Farben definieren,
           // aber der Gradient wird besser direkt in der Komponente gesetzt.
           color: textColor, // Sicherstellen, dass der Text weiß ist
        },
      },
    },
    // Style für die Login/Register-Karte
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Stärker abgerundet
        },
      },
    },
    // Style für Divider
    MuiDivider: {
        styleOverrides: {
            root: {
                borderColor: 'rgba(255, 255, 255, 0.12)', // Hellerer Divider
            }
        }
    }
  },
});

export default theme;