import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import api from '../utils/api';

// Setze die Sprache auf Deutsch
dayjs.locale('de');

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Hole Standardwerte aus dem Location-State (wenn von Kalender-Slot ausgewählt)
  const defaultStart = location.state?.defaultStart ? dayjs(location.state.defaultStart) : dayjs();
  const defaultEnd = location.state?.defaultEnd ? dayjs(location.state.defaultEnd) : dayjs().add(1, 'hour');
  
  // Formularstatus
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location_, setLocation] = useState('');
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [eventType, setEventType] = useState('personal');
  
  // UI-Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Lade Termindaten, wenn im Bearbeitungsmodus
  useEffect(() => {
    const fetchEvent = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        
        const response = await api.get(`/api/events/${id}`);
        const event = response.data;
        
        setTitle(event.title);
        setDescription(event.description || '');
        setLocation(event.location || '');
        setStartTime(dayjs(event.start_time));
        setEndTime(dayjs(event.end_time));
        setEventType(event.event_type || 'personal');
        
      } catch (err) {
        console.error('Fehler beim Laden des Termins:', err);
        if (err.response && err.response.status === 401) {
          setError('Du bist nicht angemeldet oder deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
        } else if (err.response && err.response.status === 404) {
          setError('Termin nicht gefunden.');
        } else {
          setError('Termin konnte nicht geladen werden. Bitte versuche es später erneut.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id, isEditMode]);
  
  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validierung mit validateForm-Funktion
    if (!validateForm()) {
      return;
    }
    
    const eventData = {
      title,
      description,
      location: location_,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      event_type: eventType
    };
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode) {
        // Termin aktualisieren
        await api.put(`/api/events/${id}`, eventData);
        setSuccess('Termin erfolgreich aktualisiert!');
      } else {
        // Neuen Termin erstellen
        await api.post('/api/events', eventData);
        setSuccess('Termin erfolgreich erstellt!');
      }
      
      // Nach erfolgreicher Aktion zur Kalenderansicht zurückkehren
      setTimeout(() => {
        navigate('/calendar');
      }, 1500);
    } catch (err) {
      console.error('Fehler beim Speichern des Termins:', err);
      if (err.response && err.response.status === 401) {
        setError('Du bist nicht angemeldet oder deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
      } else {
        setError('Der Termin konnte nicht gespeichert werden. Bitte versuche es später erneut.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Termin löschen
  const handleDelete = async () => {
    try {
      setLoading(true);
      
      await api.delete(`/api/events/${id}`);
      
      setSuccess('Termin erfolgreich gelöscht!');
      setDeleteDialogOpen(false);
      
      // Nach erfolgreicher Löschung zur Kalenderansicht zurückkehren
      setTimeout(() => {
        navigate('/calendar');
      }, 1500);
    } catch (err) {
      console.error('Fehler beim Löschen des Termins:', err);
      if (err.response && err.response.status === 401) {
        setError('Du bist nicht angemeldet oder deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
      } else {
        setError('Der Termin konnte nicht gelöscht werden. Bitte versuche es später erneut.');
      }
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Validiere das Formular
  const validateForm = () => {
    const errors = {};
    
    if (!title.trim()) {
      errors.title = 'Titel ist erforderlich';
    }
    
    if (startTime.isAfter(endTime)) {
      errors.time = 'Startzeit muss vor der Endzeit liegen';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2">
          {isEditMode ? 'Termin bearbeiten' : 'Neuer Termin'}
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Titel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
              <DateTimePicker
                label="Startzeit"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={validationErrors.time ? true : false}
                  />
                )}
                disabled={loading}
                ampm={false}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
              <DateTimePicker
                label="Endzeit"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={validationErrors.time ? true : false}
                    helperText={validationErrors.time || ''}
                  />
                )}
                disabled={loading}
                ampm={false}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Termintyp</InputLabel>
              <Select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                label="Termintyp"
                disabled={loading}
              >
                <MenuItem value="personal">Persönlich</MenuItem>
                <MenuItem value="work">Arbeit</MenuItem>
                <MenuItem value="health">Gesundheit</MenuItem>
                <MenuItem value="other">Sonstiges</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ort"
              value={location_}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Beschreibung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/calendar')}
                disabled={loading}
              >
                Abbrechen
              </Button>
              
              <Box>
                {isEditMode && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    Löschen
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Wird gespeichert...' : (isEditMode ? 'Aktualisieren' : 'Erstellen')}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Bestätigungsdialog für das Löschen */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Termin löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bist du sicher, dass du diesen Termin löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Abbrechen
          </Button>
          <Button onClick={handleDelete} color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EventForm;
