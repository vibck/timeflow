import React, { useState, useEffect, useCallback } from 'react';
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
  TextField
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { Add as AddIcon, Delete as DeleteIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { DateTime } from 'luxon';
import api from '../../utils/api';

// Setze die Sprache auf Deutsch
const locale = 'de';

const ReminderForm = ({ eventId, eventStartTime, existingReminders, onReminderChange, readOnly = false, eventType = 'personal' }) => {
  const [reminderTime, setReminderTime] = useState(DateTime.fromISO(eventStartTime).minus({ minutes: 30 }));
  const [presetOption, setPresetOption] = useState('30min');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Voreingestellte Erinnerungsoptionen
  const presetOptions = [
    { value: '15min', label: '15 Minuten vorher', minutes: 15 },
    { value: '30min', label: '30 Minuten vorher', minutes: 30 },
    { value: '1hour', label: '1 Stunde vorher', minutes: 60 },
    { value: '3hours', label: '3 Stunden vorher', minutes: 3 * 60 },
    { value: '1day', label: '1 Tag vorher', minutes: 24 * 60 },
    { value: '2days', label: '2 Tage vorher', minutes: 2 * 24 * 60 },
    { value: '1week', label: '1 Woche vorher', minutes: 7 * 24 * 60 },
    { value: 'custom', label: 'Benutzerdefiniert', minutes: 0 }
  ];

  // Behandle Änderung der Voreinstellung
  const handlePresetChange = (event) => {
    const selectedOption = event.target.value;
    setPresetOption(selectedOption);
    
    if (selectedOption !== 'custom') {
      const option = presetOptions.find(opt => opt.value === selectedOption);
      setReminderTime(DateTime.fromISO(eventStartTime).minus({ minutes: option.minutes }));
    }
  };

  // Validiere die Erinnerungszeit
  const validateReminderTime = () => {
    // Prüfe, ob die Erinnerungszeit vor der Startzeit des Termins liegt
    if (reminderTime > DateTime.fromISO(eventStartTime)) {
      setError('Die Erinnerungszeit muss vor der Startzeit des Termins liegen.');
      return false;
    }
    
    // Prüfe, ob die Erinnerungszeit in der Zukunft liegt
    if (reminderTime < DateTime.local()) {
      setError('Die Erinnerungszeit muss in der Zukunft liegen.');
      return false;
    }
    
    // Prüfe, ob bereits eine Erinnerung mit der gleichen Zeit existiert
    const duplicateReminder = existingReminders.find(
      reminder => reminder.reminder_time === reminderTime.toISO()
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
    if (!reminderTime || !eventId) return;
    
    // Validiere die Erinnerungszeit
    if (!validateReminderTime()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/api/reminders', {
        event_id: eventId,
        reminder_time: reminderTime.toISO()
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
      setReminderTime(DateTime.fromISO(eventStartTime).minus({ minutes: defaultOption.minutes }));
      
    } catch (err) {
      console.error('Fehler beim Erstellen der Erinnerung:', err);
      setError('Die Erinnerung konnte nicht erstellt werden. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Öffne den Bestätigungsdialog zum Löschen einer Erinnerung
  const openDeleteDialog = (reminder) => {
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
        setReminderTime(DateTime.fromISO(eventStartTime).minus({ minutes: option.minutes }));
      }
    }
  }, [eventStartTime, presetOption]);

  // Formatiere das Datum für die Anzeige
  const formatReminderTime = (time) => {
    // Stelle sicher, dass das Datum ein Luxon DateTime-Objekt ist
    const dateTime = typeof time === 'string' ? DateTime.fromISO(time) : time;
    return dateTime.toFormat('dd.MM.yyyy HH:mm');
  };

  // Berechne den relativen Zeitpunkt für die Anzeige
  const getRelativeTime = (reminderTime, eventTime) => {
    // Konvertiere zu DateTime-Objekten, falls sie es noch nicht sind
    const reminderDateTime = typeof reminderTime === 'string' ? DateTime.fromISO(reminderTime) : reminderTime;
    const eventDateTime = typeof eventTime === 'string' ? DateTime.fromISO(eventTime) : eventTime;
    
    // Berechne die Differenz in Minuten
    const diff = eventDateTime.diff(reminderDateTime, 'minutes').minutes;
    
    if (diff < 0) {
      return "Nach dem Termin";
    } else if (diff < 60) {
      return `${Math.round(diff)} Minuten vor dem Termin`;
    } else if (diff < 24 * 60) {
      const hours = Math.floor(diff / 60);
      return `${hours} Stunde${hours !== 1 ? 'n' : ''} vor dem Termin`;
    } else {
      const days = Math.floor(diff / (24 * 60));
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
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={locale}>
              <DateTimePicker
                label="Erinnerungszeit"
                value={reminderTime}
                onChange={(newValue) => setReminderTime(newValue)}
                disabled={loading}
                disableMaskedInput
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    size="small"
                    sx={{ minWidth: 250 }}
                  />
                )}
              />
            </LocalizationProvider>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddReminder}
            disabled={loading}
            sx={{ ml: 2, mt: presetOption === 'custom' ? 0 : 1 }}
          >
            Hinzufügen
          </Button>
        </Box>
      )}
      
      {existingReminders && existingReminders.length > 0 ? (
        <List sx={{ bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
          {existingReminders
            .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time))
            .map(reminder => (
              <ListItem key={reminder.id} divider>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    {formatReminderTime(DateTime.fromISO(reminder.reminder_time))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getRelativeTime(DateTime.fromISO(reminder.reminder_time), DateTime.fromISO(eventStartTime))}
                  </Typography>
                  {reminder.is_sent && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                      Bereits gesendet
                    </Typography>
                  )}
                </Box>
                {!readOnly && (
                  <Tooltip title={reminder.is_sent ? "Bereits gesendete Erinnerungen können nicht gelöscht werden" : "Erinnerung löschen"}>
                    <span>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => openDeleteDialog(reminder)}
                        disabled={loading || reminder.is_sent}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </ListItem>
            ))}
        </List>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Keine Erinnerungen für diesen Termin. {!readOnly && 'Füge eine Erinnerung hinzu, um per E-Mail oder Telegram benachrichtigt zu werden.'}
        </Alert>
      )}
      
      {/* Bestätigungsdialog zum Löschen einer Erinnerung */}
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
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                Erinnerungszeit: {formatReminderTime(DateTime.fromISO(reminderToDelete.reminder_time))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getRelativeTime(DateTime.fromISO(reminderToDelete.reminder_time), DateTime.fromISO(eventStartTime))}
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