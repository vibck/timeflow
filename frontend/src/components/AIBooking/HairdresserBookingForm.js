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

const HairdresserBookingForm = () => {
  // Formularfelder
  const [salonName, setSalonName] = useState('');
  const [salonPhone, setSalonPhone] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('vormittag');
  const [serviceType, setServiceType] = useState('haarschnitt');
  const [specialRequests, setSpecialRequests] = useState('');
  const [preferredStaff, setPreferredStaff] = useState('');
  
  // UI-Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Validierungsfehler
  const [dateError, setDateError] = useState('');
  
  // Formularvalidierung
  const validateForm = () => {
    let isValid = true;
    
    if (!salonName.trim()) {
      setError('Bitte geben Sie den Namen des Friseursalons an');
      isValid = false;
    } else if (!salonPhone.trim()) {
      setError('Bitte geben Sie die Telefonnummer des Friseursalons an');
      isValid = false;
    } else if (!serviceType.trim()) {
      setError('Bitte wählen Sie einen Servicetyp aus');
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
      
      setSuccess('Ihre Buchungsanfrage wurde erfolgreich gesendet! Wir werden Sie kontaktieren, sobald der Termin bestätigt ist.');
      resetForm();
    } catch (error) {
      setError('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setSalonName('');
    setSalonPhone('');
    setServiceType('haarschnitt');
    setDate(new Date());
    setTime('vormittag');
    setSpecialRequests('');
    setPreferredStaff('');
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
          Friseurtermin buchen
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#64748b',
            fontSize: '0.875rem'
          }}
        >
          Geben Sie die Daten für Ihren gewünschten Friseurtermin ein.
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
        {/* Friseurdaten */}
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
            Friseurdaten
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Name des Friseursalons"
                value={salonName}
                onChange={e => setSalonName(e.target.value)}
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
                value={salonPhone}
                onChange={e => setSalonPhone(e.target.value)}
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
                <InputLabel>Gewünschter Service</InputLabel>
                <Select
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value)}
                  label="Gewünschter Service"
                >
                  <MenuItem value="haarschnitt">Haarschnitt</MenuItem>
                  <MenuItem value="farbung">Färbung</MenuItem>
                  <MenuItem value="styling">Styling</MenuItem>
                  <MenuItem value="waschen_schneiden">Waschen & Schneiden</MenuItem>
                  <MenuItem value="komplett">Komplettbehandlung</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Bevorzugte(r) Friseur(in) (optional)"
                value={preferredStaff}
                onChange={e => setPreferredStaff(e.target.value)}
                placeholder="z.B. Martin oder Sarah"
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
        
        {/* Terminwünsche */}
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
            Terminwünsche
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
              <TextField
                fullWidth
                size="small"
                label="Zusätzliche Wünsche (optional)"
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                multiline
                rows={2}
                placeholder="z.B. bestimmte Länge, spezielle Haarfarbe"
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
              'Termin anfragen'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default HairdresserBookingForm;
