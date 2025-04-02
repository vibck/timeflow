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
  DialogTitle,
  useTheme
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

// Benutzerdefinierter DatePicker-Input, angepasst an unser Design
const CustomDatePickerInput = forwardRef(({ value, onClick, error }, ref) => (
  <div 
    className="custom-datepicker-input"
    onClick={onClick}
    ref={ref}
    style={{
      height: '40px',
      borderRadius: '0.375rem',
      backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(42, 47, 78, 1)' : 'white',
      border: document.documentElement.classList.contains('dark') ? '1px solid rgba(58, 63, 94, 1)' : '1px solid rgba(209, 213, 219, 1)',
      color: document.documentElement.classList.contains('dark') ? 'white' : 'rgba(17, 24, 39, 1)',
      padding: '8px 12px',
      width: '100%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem'
    }}
  >
    {value}
  </div>
));

const EventForm = ({ open, onClose, initialData, isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Bestimme, ob der Popup-Modus oder der Seitenmodus verwendet wird
  const isPopupMode = Boolean(open !== undefined && onClose);
  
  // Hole ID entweder aus Params oder initialData
  const [eventId, setEventId] = useState(initialData?.id || id || null);
  
  // Überprüfe, ob es sich um einen neuen oder bestehenden Termin handelt
  // Ein Termin gilt als neu, wenn keine ID vorhanden ist oder wenn isEdit explizit als false übergeben wurde
  const [isEditMode, setIsEditMode] = useState(Boolean(isEdit && eventId));
  
  // Hole Standardwerte aus dem Location-State oder initialData
  const defaultStart = initialData?.start_time ? new Date(initialData.start_time) : 
                     (location.state?.defaultStart ? new Date(location.state.defaultStart) : new Date());
  const defaultEnd = initialData?.end_time ? new Date(initialData.end_time) : 
                   (location.state?.defaultEnd ? new Date(location.state.defaultEnd) : addMinutes(new Date(), 60));
  
  // Formularstatus
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [location_, setLocation] = useState(initialData?.location || '');
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [eventType, setEventType] = useState(initialData?.event_type || 'personal');
  const [reminders, setReminders] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(true);
  const [originalStartTime, setOriginalStartTime] = useState(null);
  
  // UI-Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Stil der Eingabefelder
  const inputStyle = {
    height: '40px',
    borderRadius: '0.375rem',
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(42, 47, 78, 1)' : 'white',
    border: theme.palette.mode === 'dark' ? '1px solid rgba(58, 63, 94, 1)' : '1px solid rgba(209, 213, 219, 1)',
    color: theme.palette.mode === 'dark' ? 'white' : 'rgba(17, 24, 39, 1)',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    }
  };
  
  // Lade Termindaten und Erinnerungen, wenn im Bearbeitungsmodus
  useEffect(() => {
    const fetchEventAndReminders = async () => {
      if (!isEditMode || !eventId) return;
      
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
  }, [isEditMode, eventId]);
  
  // Schließe das Formular, wenn es ein Popup ist
  const handleClose = () => {
    if (isPopupMode && onClose) {
      onClose();
    } else {
      navigate('/calendar');
    }
  };
  
  // Behandle erfolgreiche Terminerstellung
  const handleSuccessfulCreate = async createdEvent => {
    setSuccess('Termin erfolgreich erstellt!');
    
    // Setze die Event-ID und aktualisiere den Modus
    setEventId(createdEvent.id);
    setIsEditMode(true);
    
    // Lade Erinnerungen für den neuen Termin
    try {
      const remindersResponse = await api.get(`/api/reminders/event/${createdEvent.id}`);
      setReminders(remindersResponse.data);
    } catch (err) {
      console.error('Fehler beim Laden der Erinnerungen:', err);
      // Setze einen leeren Array für Erinnerungen, wenn keine gefunden wurden
      setReminders([]);
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
  
  // Hilfsfunktion für ISO-String ohne Zeitzonen-Verschiebung
  function getCorrectISOString(date) {
    if (!date || isNaN(date.getTime())) {
      console.error('Ungültiges Datum für ISO-String:', date);
      return new Date().toISOString();
    }
    
    // Erhalte die lokale Zeitzone Offset in Minuten
    const tzOffset = date.getTimezoneOffset();
    
    // Erstelle ein neues Date-Objekt und füge den Timezone-Offset hinzu,
    // damit nach Konvertierung zu ISO die lokale Zeit korrekt ist
    const correctedDate = new Date(date.getTime() - tzOffset * 60000);
    
    // Ersetze den 'Z' am Ende mit dem expliziten +00:00 für UTC-Zeit
    const isoString = correctedDate.toISOString().replace('Z', '+00:00');
    
    return isoString;
  }
  
  // Formular absenden
  const handleSubmit = async e => {
    if (e) e.preventDefault();
    
    // Validierung mit validateForm-Funktion
    if (!validateForm()) {
      return;
    }
    
    const eventData = {
      title,
      description,
      location: location_,
      start_time: getCorrectISOString(startTime),
      end_time: getCorrectISOString(endTime),
      event_type: eventType
    };
    
    try {
      setLoading(true);
      setError(null);
      
      // Benutze isEditMode UND eventId, um zu entscheiden, ob aktualisiert oder erstellt wird
      if (isEditMode && eventId) {
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
        
        // Aktualisiere Calendar-Events
        if (window.refreshCalendarEvents) {
          window.refreshCalendarEvents();
        }
        
        // Aktualisiere auch die Termine in der Seitenleiste
        if (window.refreshSidebarEvents) {
          window.refreshSidebarEvents();
        }
        
        // Refresh dashboard events
        if (window.refreshDashboardEvents) {
          window.refreshDashboardEvents();
        }
      } else {
        // Neuen Termin erstellen
        const response = await api.post('/api/events', eventData);
        if (response.data && response.data.id) {
          // Speichere temporäre Erinnerungen, wenn vorhanden
          const tempReminders = reminders.filter(r => r.is_temp || (r.id && r.id.toString().startsWith('temp-')));
          
          if (tempReminders.length > 0) {
            try {
              await Promise.all(tempReminders.map(reminder => {
                return api.post('/api/reminders', {
                  event_id: response.data.id,
                  reminder_time: reminder.reminder_time
                });
              }));
              setSuccess('Termin und Erinnerungen erfolgreich erstellt!');
            } catch (reminderErr) {
              console.error('Fehler beim Erstellen der Erinnerungen:', reminderErr);
              setSuccess('Termin erstellt, aber Erinnerungen konnten nicht gespeichert werden.');
            }
          } else {
            setSuccess('Termin erfolgreich erstellt!');
          }
          
          handleSuccessfulCreate(response.data);
          
          // Aktualisiere Calendar-Events
          if (window.refreshCalendarEvents) {
            window.refreshCalendarEvents();
          }
          
          // Aktualisiere auch die Termine in der Seitenleiste
          if (window.refreshSidebarEvents) {
            window.refreshSidebarEvents();
          }
          
          // Refresh dashboard events
          if (window.refreshDashboardEvents) {
            window.refreshDashboardEvents();
          }
        } else {
          throw new Error('Keine gültige Event-ID erhalten');
        }
      }
      
      // Schließe das Formular nach erfolgreicher Speicherung
      setTimeout(() => {
        handleClose();
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
  
  // Aktualisiere die Erinnerungen für die neue Terminzeit
  const updateRemindersForNewEventTime = async newEventStartTime => {
    try {
      // Lade die aktuellen Erinnerungen neu
      const remindersResponse = await api.get(`/api/reminders/event/${eventId}`);
      const currentReminders = remindersResponse.data;
      
      // Speichere die alte und neue Startzeit als Date-Objekte
      const oldEventStart = originalStartTime;
      const newEventStart = new Date(newEventStartTime);
      
      // Berechne die Zeitdifferenz zwischen alter und neuer Startzeit in Minuten
      const timeDiffMinutes = Math.round(
        (newEventStart.getTime() - oldEventStart.getTime()) / (1000 * 60)
      );
      
      // Nur fortfahren, wenn es eine tatsächliche Zeitdifferenz gibt
      if (timeDiffMinutes === 0) {
        return;
      }
      
      // Aktualisiere jede Erinnerung
      const updatedReminders = await Promise.all(
        currentReminders.map(async reminder => {
          if (reminder.is_sent) {
            return reminder;
          }
          
          // Konvertiere die Erinnerungszeit zu einem Date-Objekt
          const oldReminderTime = new Date(reminder.reminder_time);
          
          // Ermittle den Zeitunterschied zwischen Event und Erinnerung in Minuten
          const minutesBeforeEvent = Math.round((oldEventStart.getTime() - oldReminderTime.getTime()) / (1000 * 60));
          
          // Berechne die neue Erinnerungszeit durch Anwendung des gleichen Zeitabstands zur neuen Startzeit
          // Erstelle ein neues Datum basierend auf der neuen Startzeit
          const newReminderDate = new Date(newEventStart);
          // Subtrahiere die gleiche Anzahl von Minuten wie zuvor
          newReminderDate.setMinutes(newReminderDate.getMinutes() - minutesBeforeEvent);
          
          // Aktualisiere die Erinnerung in der Datenbank
          try {
            // Verwende die Hilfsfunktion für korrekte ISO-Strings
            const reminderData = {
              reminder_time: getCorrectISOString(newReminderDate)
            };
            
            const updatedReminder = await api.put(`/api/reminders/${reminder.id}`, reminderData);
            return updatedReminder.data;
          } catch (err) {
            return reminder;
          }
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
      
      // Aktualisiere Calendar-Events
      if (window.refreshCalendarEvents) {
        window.refreshCalendarEvents();
      }
      
      // Aktualisiere auch die Termine in der Seitenleiste
      if (window.refreshSidebarEvents) {
        window.refreshSidebarEvents();
      }
      
      // Refresh dashboard events
      if (window.refreshDashboardEvents) {
        window.refreshDashboardEvents();
      }
      
      // Nach erfolgreicher Löschung Dialog schließen
      setTimeout(() => {
        if (onClose) onClose();
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

  // Rendere die Komponente im Dialog oder als Seite, je nach Modus
  const renderFormContent = () => (
    <>
      <DialogTitle sx={{ 
        fontSize: '1.1rem', 
        fontWeight: 500,
        py: 1.5,
        color: theme => theme.palette.mode === 'dark' ? 'white' : '#1f2937'
      }}>
        {isEditMode ? 'Termin bearbeiten' : 'Neuer Termin'}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1, pb: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Box sx={{ mt: 0.5 }}>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ 
              display: 'block', 
              fontSize: '0.8rem', 
              fontWeight: 500, 
              mb: 0.5,
              color: theme => theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 1)' : 'rgba(55, 65, 81, 1)'
            }}>
              Titel
            </Typography>
            <TextField
              fullWidth
              placeholder="Titel eingeben"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={loading}
              variant="outlined"
              size="small"
              InputProps={{
                sx: inputStyle
              }}
            />
          </Box>
          
          <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ 
                display: 'block', 
                fontSize: '0.8rem', 
                fontWeight: 500, 
                mb: 0.5,
                color: theme => theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 1)' : 'rgba(55, 65, 81, 1)'
              }}>
                Startzeit
              </Typography>
              <div style={{ height: '40px' }}>
                <DatePicker
                  selected={startTime}
                  onChange={handleStartTimeChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd.MM.yyyy HH:mm"
                  locale="de"
                  minDate={new Date()}
                  disabled={loading}
                  customInput={<CustomDatePickerInput />}
                  wrapperClassName="datepicker-wrapper"
                />
              </div>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ 
                display: 'block', 
                fontSize: '0.8rem', 
                fontWeight: 500, 
                mb: 0.5,
                color: theme => theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 1)' : 'rgba(55, 65, 81, 1)'
              }}>
                Endzeit
              </Typography>
              <div style={{ height: '40px' }}>
                <DatePicker
                  selected={endTime}
                  onChange={newValue => setEndTime(newValue)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd.MM.yyyy HH:mm"
                  locale="de"
                  minDate={startTime}
                  disabled={loading}
                  customInput={<CustomDatePickerInput />}
                  wrapperClassName="datepicker-wrapper"
                />
              </div>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ 
                display: 'block', 
                fontSize: '0.8rem', 
                fontWeight: 500, 
                mb: 0.5,
                color: theme => theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 1)' : 'rgba(55, 65, 81, 1)'
              }}>
                Termintyp
              </Typography>
              <Select
                fullWidth
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                disabled={loading}
                size="small"
                sx={{
                  height: '40px',
                  ...inputStyle
                }}
              >
                <MenuItem value="personal">Persönlich</MenuItem>
                <MenuItem value="work">Arbeit</MenuItem>
                <MenuItem value="health">Gesundheit</MenuItem>
                <MenuItem value="other">Sonstiges</MenuItem>
              </Select>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ 
                display: 'block', 
                fontSize: '0.8rem', 
                fontWeight: 500, 
                mb: 0.5,
                color: theme => theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 1)' : 'rgba(55, 65, 81, 1)'
              }}>
                Ort
              </Typography>
              <TextField
                fullWidth
                placeholder="Ort eingeben"
                value={location_}
                onChange={e => setLocation(e.target.value)}
                disabled={loading}
                size="small"
                InputProps={{
                  sx: inputStyle
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ 
              display: 'block', 
              fontSize: '0.8rem', 
              fontWeight: 500, 
              mb: 0.5,
              color: theme => theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 1)' : 'rgba(55, 65, 81, 1)'
            }}>
              Beschreibung
            </Typography>
            <TextField
              fullWidth
              placeholder="Beschreibung eingeben"
              value={description}
              onChange={e => setDescription(e.target.value)}
              multiline
              rows={2}
              disabled={loading}
              size="small"
              InputProps={{
                sx: {
                  borderRadius: '0.375rem',
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(42, 47, 78, 1)' : 'white',
                  border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(58, 63, 94, 1)' : '1px solid rgba(209, 213, 219, 1)',
                  color: theme => theme.palette.mode === 'dark' ? 'white' : 'rgba(17, 24, 39, 1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
            />
          </Box>
        </Box>
        
        {/* CSS für DatePicker-Wrapper */}
        <style jsx="true">{`
          .datepicker-wrapper {
            width: 100%;
          }
          .react-datepicker-wrapper {
            width: 100%;
          }
          .react-datepicker__input-container {
            width: 100%;
          }
        `}</style>
        
        {/* Erinnerungsformular hinzufügen (nur wenn der Termin bereits existiert) */}
        {showReminderForm && (
          <Box sx={{ mt: 2 }}>
            <ReminderForm 
              eventId={eventId}
              eventStartTime={startTime}
              existingReminders={reminders}
              onReminderChange={setReminders}
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="text"
          sx={{
            px: 2,
            py: 1,
            mr: 1,
            borderRadius: '0.375rem',
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(42, 47, 78, 1)' : 'rgba(243, 244, 246, 1)',
            color: theme => theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 1)' : 'rgba(75, 85, 99, 1)',
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(42, 47, 78, 0.9)' : 'rgba(229, 231, 235, 1)',
              color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 1)' : 'rgba(31, 41, 55, 1)',
            }
          }}
        >
          Abbrechen
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          sx={{
            px: 2,
            py: 1,
            borderRadius: '0.375rem',
            background: 'linear-gradient(to right, #ff0066, #3399ff)',
            color: 'white',
            fontSize: '0.875rem',
            '&:hover': {
              opacity: 0.9
            }
          }}
        >
          {loading ? 'Wird gespeichert...' : (isEditMode ? 'Speichern' : 'Erstellen')}
        </Button>
      </DialogActions>
      
      {/* Löschen-Button in einem separaten Abschnitt */}
      {isEditMode && (
        <Box sx={{ position: 'absolute', left: 16, bottom: 14 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={loading}
            size="small"
            sx={{
              px: 2,
              py: 1,
              fontSize: '0.875rem',
              borderColor: '#f43f5e',
              color: '#f43f5e',
              '&:hover': {
                borderColor: '#e11d48',
                backgroundColor: 'rgba(244, 63, 94, 0.04)'
              }
            }}
          >
            Löschen
          </Button>
        </Box>
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
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{
              px: 2,
              py: 1,
              mr: 1,
              borderRadius: '0.375rem',
              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(42, 47, 78, 1)' : 'rgba(243, 244, 246, 1)',
              color: theme => theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 1)' : 'rgba(75, 85, 99, 1)',
              '&:hover': {
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(42, 47, 78, 0.9)' : 'rgba(229, 231, 235, 1)',
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 1)' : 'rgba(31, 41, 55, 1)',
              }
            }}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleDelete} 
            sx={{
              px: 2,
              py: 1,
              borderRadius: '0.375rem',
              background: 'linear-gradient(to right, #f43f5e, #e11d48)',
              color: 'white',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
  
  // Rendere Dialog für Popup-Modus oder Paper für Seitenmodus
  return isPopupMode ? (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '0.75rem',
          bgcolor: theme => theme.palette.mode === 'dark' ? '#1a1f3e' : 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }
      }}
    >
      {renderFormContent()}
    </Dialog>
  ) : (
    <Paper 
      sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 4, 
        borderRadius: '0.75rem',
        bgcolor: theme => theme.palette.mode === 'dark' ? '#1a1f3e' : 'white',
        overflow: 'hidden'
      }}
    >
      {renderFormContent()}
    </Paper>
  );
};

export default EventForm;
