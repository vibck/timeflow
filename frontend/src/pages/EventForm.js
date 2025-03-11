import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Paper,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import axios from 'axios';

// Setze die Sprache auf Deutsch
dayjs.locale('de');

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Formularstatus
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs().add(1, 'hour')); // +1 Stunde
  const [eventType, setEventType] = useState('personal');
  const [location_, setLocation] = useState('');
  
  // UI-Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Lade Termindaten, wenn im Bearbeitungsmodus
  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/events/${id}`);
          const event = response.data;
          
          setTitle(event.title);
          setDescription(event.description || '');
          setStartTime(dayjs(event.start_time));
          setEndTime(dayjs(event.end_time));
          setEventType(event.event_type || 'personal');
          setLocation(event.location || '');
          
          setError(null);
        } catch (err) {
          console.error('Fehler beim Laden des Termins:', err);
          setError('Der Termin konnte nicht geladen werden. Bitte versuche es später erneut.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchEvent();
    } else if (location.state?.defaultStart && location.state?.defaultEnd) {
      // Wenn von der Kalenderansicht mit vorausgewähltem Zeitraum navigiert wurde
      setStartTime(dayjs(location.state.defaultStart));
      setEndTime(dayjs(location.state.defaultEnd));
    }
  }, [id, isEditMode, location.state]);
  
  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validierung
    if (!title.trim()) {
      setError('Bitte gib einen Titel ein.');
      return;
    }
    
    if (startTime.isAfter(endTime)) {
      setError('Die Startzeit muss vor der Endzeit liegen.');
      return;
    }
    
    const eventData = {
      title,
      description,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      event_type: eventType,
      location: location_
    };
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode) {
        // Termin aktualisieren
        await axios.put(`${process.env.REACT_APP_API_URL}/events/${id}`, eventData);
        setSuccess('Termin erfolgreich aktualisiert!');
      } else {
        // Neuen Termin erstellen
        await axios.post(`${process.env.REACT_APP_API_URL}/events`, eventData);
        setSuccess('Termin erfolgreich erstellt!');
      }
      
      // Nach erfolgreicher Aktion zur Kalenderansicht zurückkehren
      setTimeout(() => {
        navigate('/calendar');
      }, 1500);
    } catch (err) {
      console.error('Fehler beim Speichern des Termins:', err);
      setError('Der Termin konnte nicht gespeichert werden. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  // Termin löschen
  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/events/${id}`);
      setDeleteDialogOpen(false);
      setSuccess('Termin erfolgreich gelöscht!');
      
      // Nach erfolgreicher Löschung zur Kalenderansicht zurückkehren
      setTimeout(() => {
        navigate('/calendar');
      }, 1500);
    } catch (err) {
      console.error('Fehler beim Löschen des Termins:', err);
      setError('Der Termin konnte nicht gelöscht werden. Bitte versuche es später erneut.');
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Startzeit"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                disabled={loading}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Endzeit"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                disabled={loading}
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
