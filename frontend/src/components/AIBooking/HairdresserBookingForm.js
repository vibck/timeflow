import React, { useState, forwardRef } from 'react';
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
  CircularProgress,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import de from 'date-fns/locale/de';
import format from 'date-fns/format';
import api from '../../utils/api';

// Deutsche Sprache für Datepicker registrieren
registerLocale('de', de);
setDefaultLocale('de');

const HairdresserBookingForm = () => {
  // Formularfelder
  const [salonName, setSalonName] = useState('');
  const [salonPhone, setSalonPhone] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateInput, setDateInput] = useState(null);
  const [timePreferences, setTimePreferences] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    custom: false
  });
  const [customTimePreference, setCustomTimePreference] = useState('');
  const [serviceType, setServiceType] = useState('');
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
    } else if (selectedDates.length === 0) {
      setDateError('Bitte wählen Sie mindestens ein Datum aus');
      isValid = false;
    } else if (!timePreferences.morning && !timePreferences.afternoon && 
               !timePreferences.evening && !timePreferences.custom) {
      setError('Bitte wählen Sie mindestens eine Zeitpräferenz aus');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Datum zum Array hinzufügen
  const handleAddDate = () => {
    if (!dateInput) {
      setDateError('Bitte wählen Sie ein Datum aus');
      return;
    }
    
    setDateError('');
    
    // Datum formatieren
    const formattedDate = format(dateInput, 'dd.MM.yyyy');
    
    // Prüfe, ob das Datum bereits ausgewählt ist
    if (selectedDates.some(date => date.dateObj && date.dateObj.getTime() === dateInput.getTime())) {
      setDateError('Dieses Datum wurde bereits hinzugefügt');
      return;
    }
    
    // Datum hinzufügen
    setSelectedDates([
      ...selectedDates,
      {
        id: Date.now(),
        dateObj: dateInput,
        formatted: formattedDate
      }
    ]);
    
    // Input zurücksetzen
    setDateInput(null);
  };
  
  // Datum entfernen
  const handleRemoveDate = id => {
    setSelectedDates(selectedDates.filter(date => date.id !== id));
  };
  
  // Zeitpräferenzen ändern
  const handleTimePreferenceChange = e => {
    setTimePreferences({
      ...timePreferences,
      [e.target.name]: e.target.checked
    });
  };
  
  // Formular absenden
  const handleSubmit = async event => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Bereite die Daten für die API vor
      const bookingData = {
        type: 'hairdresser',
        businessName: salonName,
        phoneNumber: salonPhone,
        address: '',
        service: serviceType,
        preferredDate: selectedDates[0].dateObj.toISOString(),
        preferredTime: timePreferences,
        customTimePreference,
        customerName: '',
        customerPhone: '',
        notes: specialRequests,
        userId: null // Optional: Wenn Benutzer eingeloggt ist
      };

      // Sende die Anfrage an die API
      const _response = await api.post('/api/bookings/hairdresser', bookingData);
      
      // Erfolgreiche Buchung
      setSuccess('Ihre Buchungsanfrage wurde erfolgreich gesendet! Wir werden Sie kontaktieren, sobald der Termin bestätigt ist.');
      
      // Setze das Formular zurück
      setSalonName('');
      setSalonPhone('');
      setServiceType('');
      setSelectedDates([]);
      setDateInput(null);
      setTimePreferences({
        morning: false,
        afternoon: false,
        evening: false,
        custom: false
      });
      setCustomTimePreference('');
      setSpecialRequests('');
      setPreferredStaff('');
    } catch (err) {
      console.error('Fehler beim Erstellen der Terminanfrage:', err);
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Benutzerdefinierte Eingabe für den DatePicker
  const CustomDatePickerInput = forwardRef(({ value, onClick, placeholder /* , error, helperText */ }, ref) => (
    <TextField
      fullWidth
      label="Datum auswählen"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      error={!!dateError}
      helperText={dateError}
      InputProps={{
        readOnly: true
      }}
      ref={ref}
    />
  ));

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Friseurtermin buchen
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Geben Sie die Daten für Ihren gewünschten Friseurtermin ein. Unsere KI wird automatisch anrufen und einen Termin für Sie vereinbaren.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* Salondaten */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Salondaten</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name des Friseursalons"
              value={salonName}
              onChange={e => setSalonName(e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefonnummer des Salons"
              value={salonPhone}
              onChange={e => setSalonPhone(e.target.value)}
              placeholder="+49 123 4567890"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
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
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bevorzugte(r) Friseur(in) (optional)"
              value={preferredStaff}
              onChange={e => setPreferredStaff(e.target.value)}
            />
          </Grid>
          
          {/* Terminwünsche */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Terminwünsche</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <DatePicker
                selected={dateInput}
                onChange={date => setDateInput(date)}
                minDate={new Date()}
                locale="de"
                dateFormat="dd.MM.yyyy"
                customInput={<CustomDatePickerInput />}
              />
            </Box>
            <Button 
              variant="outlined" 
              onClick={handleAddDate}
              disabled={!dateInput}
              sx={{ mb: 2 }}
            >
              Datum hinzufügen
            </Button>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedDates.map(date => (
                <Chip
                  key={date.id}
                  label={date.formatted}
                  onDelete={() => handleRemoveDate(date.id)}
                  color="primary"
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Zeitpräferenzen</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={timePreferences.morning} 
                    onChange={handleTimePreferenceChange} 
                    name="morning" 
                  />
                }
                label="Vormittag (8-12 Uhr)"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={timePreferences.afternoon} 
                    onChange={handleTimePreferenceChange} 
                    name="afternoon" 
                  />
                }
                label="Nachmittag (12-16 Uhr)"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={timePreferences.evening} 
                    onChange={handleTimePreferenceChange} 
                    name="evening" 
                  />
                }
                label="Abend (16-20 Uhr)"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={timePreferences.custom} 
                    onChange={handleTimePreferenceChange} 
                    name="custom" 
                  />
                }
                label="Spezifische Zeit"
              />
              
              {timePreferences.custom && (
                <TextField
                  label="Gewünschte Uhrzeit"
                  value={customTimePreference}
                  onChange={e => setCustomTimePreference(e.target.value)}
                  placeholder="z.B. 14:30 Uhr"
                  fullWidth
                  sx={{ mt: 1 }}
                />
              )}
            </FormGroup>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Spezielle Anforderungen oder Notizen (optional)"
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              multiline
              rows={3}
            />
          </Grid>
          
          {/* Submit Button */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Termin anfragen'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default HairdresserBookingForm; 