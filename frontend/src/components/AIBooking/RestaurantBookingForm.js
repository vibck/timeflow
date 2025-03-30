import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { de } from 'date-fns/locale';

const RestaurantBookingForm = () => {
  // Formularfelder
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('vormittag');
  const [partySize, setPartySize] = useState(2);
  const [occasion, setOccasion] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // UI-Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Validierungsfehler
  const [dateError, setDateError] = useState('');
  
  // Formularvalidierung
  const validateForm = () => {
    let isValid = true;
    
    if (!restaurantName.trim()) {
      setError('Bitte geben Sie den Namen des Restaurants an');
      isValid = false;
    } else if (!restaurantPhone.trim()) {
      setError('Bitte geben Sie die Telefonnummer des Restaurants an');
      isValid = false;
    } else if (!date) {
      setDateError('Bitte wählen Sie ein Datum aus');
      isValid = false;
    } else if (!time) {
      setError('Bitte wählen Sie eine Uhrzeit aus');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulieren einer API-Anfrage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Ihre Restaurantreservierung wurde erfolgreich angefragt! Wir werden Sie kontaktieren, sobald der Termin bestätigt ist.');
      resetForm();
    } catch (error) {
      setError('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setRestaurantName('');
    setRestaurantPhone('');
    setDate(new Date());
    setTime('vormittag');
    setPartySize(2);
    setOccasion('');
    setSpecialRequests('');
  };
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        maxWidth: '800px',
        width: '100%',
        mx: 'auto',
        p: { xs: 2, sm: 2.5 },
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        borderRadius: 2,
        border: '1px solid #e2e8f0'
      }}
    >
      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1e293b',
            mb: 1
          }}
        >
          Restaurant reservieren
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#64748b',
            fontSize: '0.875rem'
          }}
        >
          Geben Sie die Daten für Ihre gewünschte Restaurantreservierung ein.
        </Typography>
      </Box>
      
      {(error || success) && (
        <Box sx={{ mb: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                py: 0.5,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success"
              sx={{ 
                py: 0.5,
                borderRadius: 1
              }}
            >
              {success}
            </Alert>
          )}
        </Box>
      )}
      
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        {/* Restaurantdaten */}
        <Box>
          <Typography 
            variant="subtitle2"
            sx={{ 
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#1e293b',
              mb: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Restaurantdaten
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Name des Restaurants"
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    '&:hover': {
                      bgcolor: '#f1f5f9'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b'
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Telefonnummer"
                value={restaurantPhone}
                onChange={e => setRestaurantPhone(e.target.value)}
                placeholder="+49 123 4567890"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    '&:hover': {
                      bgcolor: '#f1f5f9'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b'
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Reservierungsdetails */}
        <Box>
          <Typography 
            variant="subtitle2"
            sx={{ 
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#1e293b',
              mb: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Reservierungsdetails
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                value={date}
                onChange={newDate => setDate(newDate)}
                minDate={new Date()}
                format="dd.MM.yyyy"
                label="Datum auswählen"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: !!dateError,
                    helperText: dateError,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8fafc',
                        '&:hover': {
                          bgcolor: '#f1f5f9'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748b'
                      },
                      '& .MuiOutlinedInput-input': {
                        color: '#1e293b'
                      }
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    '&:hover': {
                      bgcolor: '#f1f5f9'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b'
                  },
                  '& .MuiSelect-select': {
                    color: '#1e293b'
                  }
                }}
              >
                <InputLabel>Uhrzeit auswählen</InputLabel>
                <Select
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  label="Uhrzeit auswählen"
                >
                  <MenuItem value="früh">Früh (8-10 Uhr)</MenuItem>
                  <MenuItem value="vormittag">Vormittag (10-12 Uhr)</MenuItem>
                  <MenuItem value="mittag">Mittag (12-14 Uhr)</MenuItem>
                  <MenuItem value="nachmittag">Nachmittag (14-17 Uhr)</MenuItem>
                  <MenuItem value="spät">Spät (17-20 Uhr)</MenuItem>
                  <MenuItem value="egal">Egal / Keine Präferenz</MenuItem>
                  <MenuItem value="custom">Spezifische Zeit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                size="small"
                sx={{
                  minWidth: '240px',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    '&:hover': {
                      bgcolor: '#f1f5f9'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b'
                  },
                  '& .MuiSelect-select': {
                    color: '#1e293b'
                  }
                }}
              >
                <InputLabel id="persons-label">Anzahl der Personen</InputLabel>
                <Select
                  labelId="persons-label"
                  value={partySize}
                  onChange={e => setPartySize(e.target.value)}
                  label="Anzahl der Personen"
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  <MenuItem value={1}>1 Person</MenuItem>
                  <MenuItem value={2}>2 Personen</MenuItem>
                  <MenuItem value={3}>3 Personen</MenuItem>
                  <MenuItem value={4}>4 Personen</MenuItem>
                  <MenuItem value={5}>5 Personen</MenuItem>
                  <MenuItem value={6}>6 Personen</MenuItem>
                  <MenuItem value={7}>7 Personen</MenuItem>
                  <MenuItem value={8}>8 Personen</MenuItem>
                  <MenuItem value={9}>9 Personen</MenuItem>
                  <MenuItem value={10}>10 Personen</MenuItem>
                  <MenuItem value={11}>11 Personen</MenuItem>
                  <MenuItem value={12}>12 Personen</MenuItem>
                  <MenuItem value={13}>Mehr als 12 Personen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Anlass (optional)"
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
                placeholder="z.B. Geburtstag, Jahrestag"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    '&:hover': {
                      bgcolor: '#f1f5f9'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b'
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Besondere Wünsche (optional)"
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                multiline
                rows={2}
                placeholder="z.B. Tisch am Fenster, bestimmte Diätanforderungen"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    '&:hover': {
                      bgcolor: '#f1f5f9'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b'
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Submit Button */}
        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
            sx={{ 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#1976D2',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.12)',
              '&:hover': {
                bgcolor: '#1565C0',
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.16)'
              }
            }}
          >
            {loading ? (
              <CircularProgress 
                size={26} 
                sx={{ color: '#fff' }}
              />
            ) : (
              'Reservierung anfragen'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RestaurantBookingForm;
