import React, { useState, useEffect, forwardRef } from 'react';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import de from 'date-fns/locale/de';
import { addMinutes, _addDays, _isBefore, _isAfter } from 'date-fns';
import api from '../utils/api';
import ReminderForm from '../components/Reminders/ReminderForm';

// Deutsche Sprache für Datepicker registrieren
registerLocale('de', de);
setDefaultLocale('de');

// Benutzerdefinierte Eingabe für den DateTimePicker
const CustomDateTimePickerInput = forwardRef(({ value, onClick, placeholder, label, error, helperText, isReadOnly, size, sx }, ref) => (
  <TextField
    fullWidth
    label={label}
    onClick={isReadOnly ? undefined : onClick}
    value={value}
    placeholder={placeholder}
    error={!!error}
    helperText={helperText}
    InputProps={{
      readOnly: true
    }}
    size={size}
    sx={sx}
    ref={ref}
  />
));

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(!!id);
  const [isViewMode, setIsViewMode] = useState(false);
  const [eventId, setEventId] = useState(id);
  
  // Bestimme den Modus basierend auf der URL
  useEffect(() => {
    if (id) {
      // Wenn die URL /events/:id/edit ist, sind wir im Bearbeitungsmodus
      const isEditUrl = location.pathname.endsWith('/edit');
      setIsEditMode(true);
      setIsViewMode(!isEditUrl);
      setEventId(id);
    } else {
      // Wenn keine ID vorhanden ist, sind wir im Erstellungsmodus
      setIsEditMode(false);
      setIsViewMode(false);
      setEventId(null);
    }
  }, [id, location.pathname]);
  
  // Hole Standardwerte aus dem Location-State (wenn von Kalender-Slot ausgewählt)
  const defaultStart = location.state?.defaultStart ? new Date(location.state.defaultStart) : new Date();
  const defaultEnd = location.state?.defaultEnd ? new Date(location.state.defaultEnd) : addMinutes(new Date(), 60);
  
  // Formularstatus
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location_, setLocation] = useState('');
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [eventType, setEventType] = useState('personal');
  const [reminders, setReminders] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [originalStartTime, setOriginalStartTime] = useState(null);
  
  // UI-Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Lade Termindaten und Erinnerungen, wenn im Bearbeitungsmodus
  useEffect(() => {
    const fetchEventAndReminders = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        
        // Lade Termindaten
        const eventResponse = await api.get(`/api/events/${eventId}`);
        const event = eventResponse.data;
        
        setTitle(event.title);
        setDescription(event.description || '');
        setLocation(event.location || '');
        const eventStartTime = new Date(event.start_time);
        setStartTime(eventStartTime);
        setOriginalStartTime(eventStartTime);
        setEndTime(new Date(event.end_time));
        setEventType(event.event_type || 'personal');
        
        // Lade Erinnerungen für diesen Termin
        const remindersResponse = await api.get(`/api/reminders/event/${eventId}`);
        setReminders(remindersResponse.data);
        
        // Zeige das Erinnerungsformular an, wenn der Termin bereits existiert
        setShowReminderForm(true);
        
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
    
    fetchEventAndReminders();
  }, [id, isEditMode, eventId]);
  
  // Behandle erfolgreiche Terminerstellung
  const handleSuccessfulCreate = async createdEvent => {
    setSuccess('Termin erfolgreich erstellt!');
    
    // Zeige das Erinnerungsformular an, nachdem der Termin erstellt wurde
    setEventId(createdEvent.id);
    setShowReminderForm(true);
    setIsEditMode(true);
    
    // Lade Erinnerungen für den neuen Termin (sollten keine sein, aber für die Konsistenz)
    try {
      const remindersResponse = await api.get(`/api/reminders/event/${createdEvent.id}`);
      setReminders(remindersResponse.data);
    } catch (err) {
      console.error('Fehler beim Laden der Erinnerungen:', err);
    }
  };
  
  // Aktualisiere die Startzeit für die Erinnerungen
  const handleStartTimeChange = newValue => {
    setStartTime(newValue);
    
    // Wenn es Erinnerungen gibt und wir im Bearbeitungsmodus sind,
    // zeige einen Hinweis an, dass die Erinnerungen angepasst werden müssen
    if (isEditMode && reminders.length > 0) {
      setSuccess('Hinweis: Bestehende Erinnerungen werden automatisch an die neue Startzeit angepasst, wenn du den Termin speicherst.');
    }
  };
  
  // Formular absenden
  const handleSubmit = async e => {
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
        if (!eventId) {
          setError('Termin-ID fehlt. Bitte lade die Seite neu oder kehre zum Kalender zurück.');
          setLoading(false);
          return;
        }
        const response = await api.put(`/api/events/${eventId}`, eventData);
        setSuccess('Termin erfolgreich aktualisiert!');
        
        // Aktualisiere die Startzeit für die Erinnerungen
        const updatedStartTime = new Date(response.data.start_time);
        setStartTime(updatedStartTime);
        setOriginalStartTime(updatedStartTime);
        
        // Wenn es Erinnerungen gibt, aktualisiere sie entsprechend der neuen Startzeit
        if (reminders.length > 0) {
          await updateRemindersForNewEventTime(response.data.start_time);
        }
      } else {
        // Neuen Termin erstellen
        const response = await api.post('/api/events', eventData);
        handleSuccessfulCreate(response.data);
      }
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
  
  // Aktualisiere die Erinnerungen für die neue Terminzeit
  const updateRemindersForNewEventTime = async newEventStartTime => {
    try {
      // Lade die aktuellen Erinnerungen neu
      const remindersResponse = await api.get(`/api/reminders/event/${eventId}`);
      const currentReminders = remindersResponse.data;
      
      // Speichere die alte und neue Startzeit als Date-Objekte
      const oldEventStart = originalStartTime;
      const newEventStart = new Date(newEventStartTime);
      
      // Berechne die Zeitdifferenz zwischen alter und neuer Startzeit in Millisekunden
      const timeDiff = newEventStart.getTime() - oldEventStart.getTime();
      
      // Nur fortfahren, wenn es eine tatsächliche Zeitdifferenz gibt
      if (timeDiff === 0) {
        return;
      }
      
      // Aktualisiere jede Erinnerung
      const updatedReminders = await Promise.all(
        currentReminders.map(async reminder => {
          // Konvertiere die Erinnerungszeit zu einem Date-Objekt
          const oldReminderTime = new Date(reminder.reminder_time);
          
          // Berechne die neue Erinnerungszeit, indem die gleiche Zeitdifferenz hinzugefügt wird
          const newReminderTime = new Date(oldReminderTime.getTime() + timeDiff);
          
          // Aktualisiere die Erinnerung in der Datenbank
          if (!reminder.is_sent) {
            try {
              const updatedReminder = await api.put(`/api/reminders/${reminder.id}`, {
                reminder_time: newReminderTime.toISOString()
              });
              return updatedReminder.data;
            } catch (err) {
              console.error(`Fehler beim Aktualisieren der Erinnerung ${reminder.id}:`, err);
              return reminder;
            }
          }
          
          // Wenn die Erinnerung bereits gesendet wurde, nicht aktualisieren
          return reminder;
        })
      );
      
      // Aktualisiere den State mit den neuen Erinnerungen
      setReminders(updatedReminders);
      
      setSuccess('Termin und Erinnerungen erfolgreich aktualisiert!');
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Erinnerungen:', err);
      setError('Die Erinnerungen konnten nicht aktualisiert werden. Bitte versuche es später erneut.');
    }
  };
  
  // Termin löschen
  const handleDelete = async () => {
    try {
      setLoading(true);
      
      if (!eventId) {
        setError('Termin-ID fehlt. Bitte lade die Seite neu oder kehre zum Kalender zurück.');
        setLoading(false);
        setDeleteDialogOpen(false);
        return;
      }
      
      await api.delete(`/api/events/${eventId}`);
      
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
    
    if (startTime.getTime() > endTime.getTime()) {
      errors.time = 'Startzeit muss vor der Endzeit liegen';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2">
          {isViewMode ? 'Termin anzeigen' : (isEditMode ? 'Termin bearbeiten' : 'Neuer Termin')}
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component={isViewMode ? 'div' : 'form'} onSubmit={!isViewMode ? handleSubmit : undefined}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Titel"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={loading || isViewMode}
              InputProps={{
                readOnly: isViewMode
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              selected={startTime}
              onChange={handleStartTimeChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              locale="de"
              minDate={new Date()}
              disabled={loading || isViewMode}
              customInput={
                <CustomDateTimePickerInput 
                  label="Startzeit" 
                  error={validationErrors.time}
                  isReadOnly={isViewMode}
                />
              }
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              selected={endTime}
              onChange={newValue => setEndTime(newValue)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              locale="de"
              minDate={startTime}
              disabled={loading || isViewMode}
              customInput={
                <CustomDateTimePickerInput 
                  label="Endzeit" 
                  error={validationErrors.time}
                  helperText={validationErrors.time || ''}
                  isReadOnly={isViewMode}
                />
              }
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Termintyp</InputLabel>
              <Select
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                label="Termintyp"
                disabled={loading || isViewMode}
                inputProps={{
                  readOnly: isViewMode
                }}
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
              onChange={e => setLocation(e.target.value)}
              disabled={loading || isViewMode}
              InputProps={{
                readOnly: isViewMode
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Beschreibung"
              value={description}
              onChange={e => setDescription(e.target.value)}
              multiline
              rows={4}
              disabled={loading || isViewMode}
              InputProps={{
                readOnly: isViewMode
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/calendar')}
                disabled={loading}
              >
                {isViewMode ? 'Zurück zum Kalender' : 'Abbrechen'}
              </Button>
              
              <Box>
                {isViewMode ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/events/${eventId}/edit`)}
                    disabled={loading}
                  >
                    Bearbeiten
                  </Button>
                ) : (
                  <>
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
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Erinnerungsformular hinzufügen (nur wenn der Termin bereits existiert) */}
      {showReminderForm && (
        <ReminderForm 
          eventId={eventId}
          eventStartTime={startTime}
          existingReminders={reminders}
          onReminderChange={setReminders}
          readOnly={isViewMode}
        />
      )}
      
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
