import React, { useState, useEffect, useCallback, useMemo, forwardRef } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  IconButton,
  List,
  ListItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Tooltip,
  TextField,
  useTheme
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import de from 'date-fns/locale/de';
import { format, addMinutes, isAfter, isBefore } from 'date-fns';
import { Add as AddIcon, Delete as DeleteIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import api from '../../utils/api';

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

const ReminderForm = ({ eventId, eventStartTime, existingReminders, onReminderChange, readOnly = false }) => {
  const theme = useTheme();
  const [reminderTime, setReminderTime] = useState(addMinutes(new Date(eventStartTime), -30));
  const [presetOption, setPresetOption] = useState('30min');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  // Temporärer Speicher für neue Erinnerungen, wenn noch kein Event-ID existiert
  const [tempReminders, setTempReminders] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Voreingestellte Erinnerungsoptionen mit useMemo
  const presetOptions = useMemo(() => [
    { value: '15min', label: '15 Minuten vorher', minutes: 15 },
    { value: '30min', label: '30 Minuten vorher', minutes: 30 },
    { value: '1hour', label: '1 Stunde vorher', minutes: 60 },
    { value: '3hours', label: '3 Stunden vorher', minutes: 3 * 60 },
    { value: '1day', label: '1 Tag vorher', minutes: 24 * 60 },
    { value: '2days', label: '2 Tage vorher', minutes: 2 * 24 * 60 },
    { value: '1week', label: '1 Woche vorher', minutes: 7 * 24 * 60 },
    { value: 'custom', label: 'Benutzerdefiniert', minutes: 0 }
  ], []);

  // Behandle Änderung der Voreinstellung
  const handlePresetChange = event => {
    const selectedOption = event.target.value;
    setPresetOption(selectedOption);
    
    if (selectedOption !== 'custom') {
      const option = presetOptions.find(opt => opt.value === selectedOption);
      setReminderTime(addMinutes(new Date(eventStartTime), -option.minutes));
    }
  };

  // Validiere die Erinnerungszeit
  const validateReminderTime = () => {
    // Prüfe, ob die Erinnerungszeit vor der Startzeit des Termins liegt
    if (isAfter(reminderTime, new Date(eventStartTime))) {
      setError('Die Erinnerungszeit muss vor der Startzeit des Termins liegen.');
      return false;
    }
    
    // Prüfe, ob die Erinnerungszeit in der Zukunft liegt
    if (isBefore(reminderTime, new Date())) {
      setError('Die Erinnerungszeit muss in der Zukunft liegen.');
      return false;
    }
    
    // Prüfe, ob bereits eine Erinnerung mit der gleichen Zeit existiert
    const remindersList = eventId ? existingReminders : tempReminders;
    const duplicateReminder = remindersList.find(
      reminder => {
        const reminderTimeStr = reminderTime.toISOString();
        return reminder.reminder_time === reminderTimeStr;
      }
    );
    
    if (duplicateReminder) {
      setError('Es existiert bereits eine Erinnerung zu diesem Zeitpunkt.');
      return false;
    }
    
    setError(null);
    return true;
  };

  // Füge eine neue Erinnerung hinzu
  const handleAddReminder = async () => {
    if (!reminderTime) return;
    
    // Validiere die Erinnerungszeit
    if (!validateReminderTime()) {
      return;
    }
    
    // Bei neuen Terminen (ohne eventId) fügen wir Erinnerungen temporär hinzu
    if (!eventId) {
      const tempReminder = {
        id: 'temp-' + Date.now(),
        event_id: null,
        reminder_time: reminderTime.toISOString(),
        is_sent: false,
        is_temp: true
      };
      
      setTempReminders([...tempReminders, tempReminder]);
      
      // Aktualisiere die Liste der Erinnerungen im Eltern-Component
      if (onReminderChange) {
        onReminderChange([...existingReminders, tempReminder]);
      }
      
      // Zeige Erfolgsmeldung
      setSnackbar({
        open: true,
        message: 'Erinnerung wird erstellt, wenn der Termin gespeichert wird',
        severity: 'success'
      });
      
      // Setze die Erinnerungszeit zurück
      const defaultOption = presetOptions.find(opt => opt.value === '30min');
      setPresetOption('30min');
      setReminderTime(addMinutes(new Date(eventStartTime), -defaultOption.minutes));
      
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/api/reminders', {
        event_id: eventId,
        reminder_time: reminderTime.toISOString()
      });
      
      // Aktualisiere die Liste der Erinnerungen
      if (onReminderChange) {
        onReminderChange([...existingReminders, response.data]);
      }
      
      // Zeige Erfolgsmeldung
      setSnackbar({
        open: true,
        message: 'Erinnerung erfolgreich erstellt',
        severity: 'success'
      });
      
      // Setze die Erinnerungszeit zurück
      const defaultOption = presetOptions.find(opt => opt.value === '30min');
      setPresetOption('30min');
      setReminderTime(addMinutes(new Date(eventStartTime), -defaultOption.minutes));
      
    } catch (err) {
      console.error('Fehler beim Erstellen der Erinnerung:', err);
      setError('Die Erinnerung konnte nicht erstellt werden. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Öffne den Bestätigungsdialog zum Löschen einer Erinnerung
  const openDeleteDialog = reminder => {
    setReminderToDelete(reminder);
    setDeleteDialogOpen(true);
  };

  // Schließe den Bestätigungsdialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReminderToDelete(null);
  };

  // Lösche eine Erinnerung
  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return;
    
    // Wenn es eine temporäre Erinnerung ist (bei neuen Terminen)
    if (reminderToDelete.is_temp || reminderToDelete.id.toString().startsWith('temp-')) {
      setTempReminders(tempReminders.filter(r => r.id !== reminderToDelete.id));
      onReminderChange(existingReminders.filter(r => r.id !== reminderToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Erinnerung entfernt',
        severity: 'success'
      });
      
      closeDeleteDialog();
      return;
    }
    
    try {
      setLoading(true);
      
      await api.delete(`/api/reminders/${reminderToDelete.id}`);
      
      // Aktualisiere die Liste der Erinnerungen
      if (onReminderChange) {
        onReminderChange(existingReminders.filter(reminder => reminder.id !== reminderToDelete.id));
      }
      
      // Zeige Erfolgsmeldung
      setSnackbar({
        open: true,
        message: 'Erinnerung erfolgreich gelöscht',
        severity: 'success'
      });
      
      // Schließe den Dialog
      closeDeleteDialog();
      
    } catch (err) {
      console.error('Fehler beim Löschen der Erinnerung:', err);
      setError('Die Erinnerung konnte nicht gelöscht werden. Bitte versuche es später erneut.');
      closeDeleteDialog();
    } finally {
      setLoading(false);
    }
  };

  // Schließe die Snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prevState => ({
      ...prevState,
      open: false
    }));
  }, []);

  // Automatische Ausblendung der Benachrichtigung
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        handleCloseSnackbar();
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [snackbar.open, handleCloseSnackbar]);

  // Aktualisiere die Erinnerungszeit, wenn sich die Startzeit des Termins ändert
  useEffect(() => {
    // Setze die Standard-Erinnerungszeit basierend auf der aktuellen Voreinstellung
    if (presetOption !== 'custom') {
      const option = presetOptions.find(opt => opt.value === presetOption);
      if (option) {
        setReminderTime(addMinutes(new Date(eventStartTime), -option.minutes));
      }
    }
  }, [eventStartTime, presetOption, presetOptions]);

  // Formatiere das Datum für die Anzeige
  const formatReminderTime = time => {
    // Stelle sicher, dass das Datum ein Date-Objekt ist
    const dateObj = typeof time === 'string' ? new Date(time) : time;
    return format(dateObj, 'dd.MM.yyyy HH:mm');
  };

  // Berechne den relativen Zeitpunkt für die Anzeige
  const getRelativeTime = (reminderTime, eventTime) => {
    // Konvertiere zu Date-Objekten, falls sie es noch nicht sind
    const reminderDate = typeof reminderTime === 'string' ? new Date(reminderTime) : reminderTime;
    const eventDate = typeof eventTime === 'string' ? new Date(eventTime) : eventTime;
    
    // Berechne die Differenz in Minuten
    const diffMs = eventDate.getTime() - reminderDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 0) {
      return 'Nach dem Termin';
    } else if (diffMinutes < 60) {
      return `${Math.round(diffMinutes)} Minuten vor dem Termin`;
    } else if (diffMinutes < 24 * 60) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} Stunde${hours !== 1 ? 'n' : ''} vor dem Termin`;
    } else {
      const days = Math.floor(diffMinutes / (24 * 60));
      return `${days} Tag${days !== 1 ? 'e' : ''} vor dem Termin`;
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 2, borderTop: '1px solid #e0e0e0', pt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <NotificationsIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Erinnerungen
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!readOnly && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Erinnerung</InputLabel>
            <Select
              value={presetOption}
              onChange={handlePresetChange}
              label="Erinnerung"
              disabled={loading}
            >
              {presetOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {presetOption === 'custom' && (
            <DatePicker
              selected={reminderTime}
              onChange={newValue => setReminderTime(newValue)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              locale="de"
              disabled={loading}
              customInput={
                <CustomDateTimePickerInput 
                  label="Erinnerungszeit"
                  size="small"
                  sx={{ minWidth: 250 }}
                />
              }
            />
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddReminder}
            disabled={loading}
            sx={{ 
              ml: 2, 
              mt: presetOption === 'custom' ? 0 : 1,
              px: 2,
              py: 1,
              borderRadius: '0.375rem',
              background: 'linear-gradient(to right, #ff0066, #3399ff)',
              color: 'white',
              fontSize: '0.875rem',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                opacity: 0.9,
                boxShadow: 'none'
              }
            }}
          >
            Hinzufügen
          </Button>
        </Box>
      )}
      
      {existingReminders && existingReminders.length > 0 ? (
        <List sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5', 
          borderRadius: 1, 
          mb: 2 
        }}>
          {existingReminders
            .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time))
            .map(reminder => (
              <ListItem key={reminder.id} divider>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    {formatReminderTime(new Date(reminder.reminder_time))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getRelativeTime(new Date(reminder.reminder_time), new Date(eventStartTime))}
                  </Typography>
                  {reminder.is_sent && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                      Bereits gesendet
                    </Typography>
                  )}
                </Box>
                
                {!readOnly && !reminder.is_sent && (
                  <Tooltip title="Erinnerung löschen">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => openDeleteDialog(reminder)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItem>
            ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Noch keine Erinnerungen vorhanden. Füge eine Erinnerung hinzu, um eine Benachrichtigung zu erhalten.
        </Typography>
      )}
      
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Erinnerung löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchtest du diese Erinnerung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
          {reminderToDelete && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5', 
              borderRadius: 1 
            }}>
              <Typography variant="subtitle2">
                Erinnerungszeit: {formatReminderTime(new Date(reminderToDelete.reminder_time))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getRelativeTime(new Date(reminderToDelete.reminder_time), new Date(eventStartTime))}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Abbrechen
          </Button>
          <Button onClick={handleDeleteReminder} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar für Feedback-Meldungen */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: 300
          }}
          onClose={handleCloseSnackbar}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default ReminderForm; 