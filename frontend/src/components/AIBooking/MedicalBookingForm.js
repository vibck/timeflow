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

const MedicalBookingForm = () => {
  // Formularfelder
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorAddress, setDoctorAddress] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [insuranceType, setInsuranceType] = useState('gesetzlich');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [customTimePreference, setCustomTimePreference] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI-Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Validierungsfehler
  const [dateError, setDateError] = useState('');
  
  // Formularvalidierung
  const validateForm = () => {
    let isValid = true;
    
    if (!doctorName.trim()) {
      setError('Bitte geben Sie den Namen des Arztes an');
      isValid = false;
    } else if (!doctorPhone.trim()) {
      setError('Bitte geben Sie die Telefonnummer des Arztes an');
      isValid = false;
    } else if (!appointmentReason.trim()) {
      setError('Bitte geben Sie den Grund des Termins an');
      isValid = false;
    } else if (!selectedDate) {
      setDateError('Bitte wählen Sie ein Datum aus');
      isValid = false;
    } else if (!selectedTime && !customTimePreference) {
      setError('Bitte wählen Sie eine Uhrzeit aus');
      isValid = false;
    }
    
    return isValid;
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
        type: 'medical',
        businessName: doctorName,
        phoneNumber: doctorPhone,
        address: doctorAddress,
        service: appointmentReason,
        preferredDate: selectedDate.toISOString(),
        preferredTime: selectedTime,
        customTimePreference,
        customerName: patientName,
        customerPhone: patientPhone,
        notes,
        userId: null // Optional: Wenn Benutzer eingeloggt ist
      };

      // Sende die Anfrage an die API
      const _response = await api.post('/api/bookings/medical', bookingData);
      
      // Erfolgreiche Buchung
      setSuccess('Ihre Terminanfrage wurde erfolgreich gesendet! Wir werden Sie kontaktieren, sobald der Termin bestätigt ist.');
      
      // Setze das Formular zurück
      setDoctorName('');
      setDoctorPhone('');
      setDoctorAddress('');
      setAppointmentReason('');
      setSelectedDate(new Date());
      setSelectedTime('');
      setPatientName('');
      setPatientPhone('');
      setInsuranceType('');
      setInsuranceNumber('');
      setCustomTimePreference('');
      setNotes('');
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
        Arzttermin buchen
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Geben Sie die Daten für Ihren gewünschten Arzttermin ein. Unsere KI wird automatisch anrufen und einen Termin für Sie vereinbaren.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* Arztdaten */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Arztdaten</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name des Arztes/der Praxis"
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefonnummer"
              value={doctorPhone}
              onChange={e => setDoctorPhone(e.target.value)}
              placeholder="+49 123 4567890"
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Adresse der Praxis (optional)"
              value={doctorAddress}
              onChange={e => setDoctorAddress(e.target.value)}
              placeholder="Straße, Hausnummer, PLZ, Ort"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Grund des Termins"
              value={appointmentReason}
              onChange={e => setAppointmentReason(e.target.value)}
              required
            />
          </Grid>
          
          {/* Patientendaten */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Patientendaten</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name des Patienten"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              placeholder="Vor- und Nachname"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefonnummer des Patienten"
              value={patientPhone}
              onChange={e => setPatientPhone(e.target.value)}
              placeholder="+49 123 4567890"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Versicherungsart</InputLabel>
              <Select
                value={insuranceType}
                onChange={e => setInsuranceType(e.target.value)}
                label="Versicherungsart"
              >
                <MenuItem value="gesetzlich">Gesetzlich versichert</MenuItem>
                <MenuItem value="privat">Privat versichert</MenuItem>
                <MenuItem value="selbstzahler">Selbstzahler</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Versicherungsnummer (optional)"
              value={insuranceNumber}
              onChange={e => setInsuranceNumber(e.target.value)}
            />
          </Grid>
          
          {/* Terminwünsche */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Terminwünsche</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                minDate={new Date()}
                locale="de"
                dateFormat="dd.MM.yyyy"
                customInput={<CustomDatePickerInput />}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Uhrzeit</InputLabel>
              <Select
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
                label="Uhrzeit"
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
            
            {selectedTime === 'custom' && (
              <TextField
                fullWidth
                label="Gewünschte Uhrzeit"
                value={customTimePreference}
                onChange={e => setCustomTimePreference(e.target.value)}
                placeholder="z.B. 14:30 Uhr"
                sx={{ mt: 2 }}
              />
            )}
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Zusätzliche Anmerkungen (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
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

export default MedicalBookingForm; 