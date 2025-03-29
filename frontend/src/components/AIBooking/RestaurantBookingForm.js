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
  CircularProgress
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import de from 'date-fns/locale/de';
import api from '../../utils/api';

// Deutsche Sprache für Datepicker registrieren
registerLocale('de', de);
setDefaultLocale('de');

const RestaurantBookingForm = () => {
  // Formularfelder
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [occasion, setOccasion] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [alternativeDate, setAlternativeDate] = useState(null);
  const [alternativeTime, setAlternativeTime] = useState(null);
  const [customTimeNotes, setCustomTimeNotes] = useState('');
  
  // UI-Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Validierungsfehler
  const [phoneError, setPhoneError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  
  // Telefonnummernvalidierung
  const validatePhone = phone => {
    const phoneRegex = /^[+\d\s()-]{6,20}$/;
    return phoneRegex.test(phone);
  };
  
  // Formular absenden
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Zurücksetzen der Fehler und Erfolgsmeldungen
    setError('');
    setPhoneError('');
    setDateError('');
    setTimeError('');
    setSuccess('');
    
    // Validierungen
    if (!restaurantName.trim()) {
      setError('Bitte geben Sie den Namen des Restaurants an');
      return;
    }
    
    if (!restaurantPhone.trim()) {
      setPhoneError('Bitte geben Sie die Telefonnummer des Restaurants an');
      return;
    }
    
    if (!validatePhone(restaurantPhone)) {
      setPhoneError('Bitte geben Sie eine gültige Telefonnummer an');
      return;
    }
    
    if (!date) {
      setDateError('Bitte wählen Sie ein Datum aus');
      return;
    }
    
    if (!time) {
      setTimeError('Bitte wählen Sie eine Uhrzeit aus');
      return;
    }
    
    // Kombiniere Datum und Uhrzeit für primären Termin
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(
      time.getHours(),
      time.getMinutes(),
      0,
      0
    );
    
    // Optional: Kombiniere Datum und Uhrzeit für alternativen Termin
    let combinedAlternativeDateTime = null;
    if (alternativeDate && alternativeTime) {
      combinedAlternativeDateTime = new Date(alternativeDate);
      combinedAlternativeDateTime.setHours(
        alternativeTime.getHours(),
        alternativeTime.getMinutes(),
        0,
        0
      );
    }
    
    // Formatiere die Daten für die API
    const bookingData = {
      booking_type: 'restaurant',
      provider_name: restaurantName,
      provider_phone: restaurantPhone,
      requested_time: {
        primary: {
          date: combinedDateTime.toISOString(),
          customNotes: customTimeNotes || undefined
        },
        alternative: combinedAlternativeDateTime ? {
          date: combinedAlternativeDateTime.toISOString()
        } : null
      },
      specific_details: {
        partySize,
        occasion: occasion || undefined,
        specialRequests: specialRequests || undefined
      }
    };
    
    setLoading(true);
    
    try {
      // Sende die Anfrage an die API
      
      setSuccess('Restaurantreservierung erfolgreich angefragt! Die KI wird einen Tisch für Sie reservieren.');
      
      // Formular zurücksetzen
      setRestaurantName('');
      setRestaurantPhone('');
      setDate(null);
      setTime(null);
      setPartySize(2);
      setOccasion('');
      setSpecialRequests('');
      setAlternativeDate(null);
      setAlternativeTime(null);
      setCustomTimeNotes('');
    } catch (err) {
      console.error('Fehler beim Erstellen der Reservierungsanfrage:', err);
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  // Benutzerdefinierte Eingabe für den DatePicker
  const CustomDatePickerInput = forwardRef(({ value, onClick, placeholder, error, helperText }, ref) => (
    <TextField
      fullWidth
      label="Datum auswählen"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      error={!!error}
      helperText={helperText}
      InputProps={{
        readOnly: true
      }}
      ref={ref}
    />
  ));
  
  // Benutzerdefinierte Eingabe für den TimePicker
  const CustomTimePickerInput = forwardRef(({ value, onClick, placeholder, error, helperText }, ref) => (
    <TextField
      fullWidth
      label="Uhrzeit auswählen"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      error={!!error}
      helperText={helperText}
      InputProps={{
        readOnly: true
      }}
      ref={ref}
    />
  ));
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Restaurant reservieren
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Geben Sie die Daten für Ihre gewünschte Restaurantreservierung ein. Unsere KI wird automatisch anrufen und einen Tisch für Sie reservieren.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* Restaurantdaten */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Restaurantdaten</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name des Restaurants"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefonnummer"
              value={restaurantPhone}
              onChange={e => setRestaurantPhone(e.target.value)}
              error={!!phoneError}
              helperText={phoneError}
              required
            />
          </Grid>
          
          {/* Reservierungsdetails */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Reservierungsdetails</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DatePicker
              selected={date}
              onChange={date => setDate(date)}
              dateFormat="dd.MM.yyyy"
              minDate={new Date()}
              customInput={
                <CustomDatePickerInput 
                  placeholder="Datum auswählen" 
                  error={dateError} 
                  helperText={dateError}
                />
              }
              locale="de"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DatePicker
              selected={time}
              onChange={time => setTime(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Uhrzeit"
              dateFormat="HH:mm"
              customInput={
                <CustomTimePickerInput 
                  placeholder="Uhrzeit auswählen" 
                  error={timeError} 
                  helperText={timeError}
                />
              }
              locale="de"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Besondere Zeithinweise (optional)"
              value={customTimeNotes}
              onChange={e => setCustomTimeNotes(e.target.value)}
              placeholder="z.B. 'Flexibel zwischen 18:00 und 20:00' oder 'Spätestens 19:30 wegen Kindern'"
              margin="normal"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="party-size-label">Anzahl der Personen</InputLabel>
              <Select
                labelId="party-size-label"
                value={partySize}
                onChange={e => setPartySize(e.target.value)}
                label="Anzahl der Personen"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <MenuItem key={num} value={num}>{num} {num === 1 ? 'Person' : 'Personen'}</MenuItem>
                ))}
                <MenuItem value={13}>Mehr als 12 Personen</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Anlass (optional)"
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
              placeholder="z.B. Geburtstag, Jahrestag"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Besondere Wünsche (optional)"
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              multiline
              rows={2}
              placeholder="z.B. Tisch am Fenster, bestimmte Diätanforderungen"
            />
          </Grid>
          
          {/* Alternative Terminwünsche */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Alternativer Termin (optional)</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Falls Ihr Wunschtermin nicht verfügbar ist, können Sie einen alternativen Termin angeben.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DatePicker
              selected={alternativeDate}
              onChange={date => setAlternativeDate(date)}
              dateFormat="dd.MM.yyyy"
              minDate={new Date()}
              customInput={
                <CustomDatePickerInput placeholder="Alternatives Datum" />
              }
              locale="de"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DatePicker
              selected={alternativeTime}
              onChange={time => setAlternativeTime(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Uhrzeit"
              dateFormat="HH:mm"
              customInput={
                <CustomTimePickerInput 
                  placeholder="Alternative Uhrzeit" 
                  disabled={!alternativeDate}
                />
              }
              disabled={!alternativeDate}
              locale="de"
            />
          </Grid>
          
          {/* Absenden */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reservierungsanfrage absenden'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default RestaurantBookingForm;
