import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Fade,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { de } from 'date-fns/locale';

const MedicalBookingForm = () => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('vormittag');
  const [insurance, setInsurance] = useState('gesetzlich');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form validation
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!doctorName) newErrors.doctorName = 'Bitte geben Sie einen Arzt an';
    if (!specialty) newErrors.specialty = 'Bitte geben Sie eine Fachrichtung an';
    if (!selectedDate) newErrors.selectedDate = 'Bitte wählen Sie ein Datum';
    if (!selectedTime) newErrors.selectedTime = 'Bitte wählen Sie eine Uhrzeit';
    if (!phoneNumber) newErrors.phoneNumber = 'Bitte geben Sie eine Telefonnummer an';
    if (!email) newErrors.email = 'Bitte geben Sie eine E-Mail-Adresse an';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Ungültige E-Mail-Adresse';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Simulieren einer API-Anfrage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      resetForm();
    } catch (error) {
      setSubmitError('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDoctorName('');
    setSpecialty('');
    setSelectedDate(null);
    setSelectedTime('vormittag');
    setInsurance('gesetzlich');
    setPhoneNumber('');
    setEmail('');
    setNotes('');
    setErrors({});
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Arzttermin buchen
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Füllen Sie das Formular aus, um einen Arzttermin zu buchen
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name des Arztes"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              error={!!errors.doctorName}
              helperText={errors.doctorName}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Fachrichtung"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              error={!!errors.specialty}
              helperText={errors.specialty}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker 
              label="Datum"
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  error: !!errors.selectedDate,
                  helperText: errors.selectedDate
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!errors.selectedTime}
            >
              <InputLabel>Uhrzeit auswählen</InputLabel>
              <Select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                label="Uhrzeit auswählen"
                sx={{ height: 56 }}
              >
                <MenuItem value="vormittag">
                  <Stack>
                    <Typography variant="body2">Vormittag</Typography>
                    <Typography variant="caption" color="text.secondary">8:00 - 12:00 Uhr</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="nachmittag">
                  <Stack>
                    <Typography variant="body2">Nachmittag</Typography>
                    <Typography variant="caption" color="text.secondary">13:00 - 17:00 Uhr</Typography>
                  </Stack>
                </MenuItem>
              </Select>
              {errors.selectedTime && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.selectedTime}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Versicherungsart</InputLabel>
              <Select
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                label="Versicherungsart"
              >
                <MenuItem value="gesetzlich">Gesetzlich</MenuItem>
                <MenuItem value="privat">Privat</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefonnummer"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Anmerkungen (optional)"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              disabled={isSubmitting}
              sx={{ mt: 2, py: 1.5 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Termin buchen'}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      {submitSuccess && (
        <Fade in={submitSuccess} timeout={500}>
          <Alert 
            severity="success" 
            sx={{ mt: 2 }}
            onClose={() => setSubmitSuccess(false)}
          >
            Ihr Termin wurde erfolgreich gebucht!
          </Alert>
        </Fade>
      )}
      
      {submitError && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          onClose={() => setSubmitError('')}
        >
          {submitError}
        </Alert>
      )}
    </Paper>
  );
};

export default MedicalBookingForm;
