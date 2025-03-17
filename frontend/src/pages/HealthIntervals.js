import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import api from '../utils/api';

// Setze die Sprache auf Deutsch
const locale = 'de';

const HealthIntervals = () => {
  const theme = useTheme();
  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInterval, setEditingInterval] = useState(null);
  const [formData, setFormData] = useState({
    interval_type: '',
    interval_months: 6,
    last_appointment: DateTime.now()
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Intervalltypen
  const intervalTypes = [
    { value: 'Zahnarzt', label: 'Zahnarzt' },
    { value: 'Hausarzt', label: 'Hausarzt' },
    { value: 'Augenarzt', label: 'Augenarzt' },
    { value: 'Gynäkologe', label: 'Gynäkologe' },
    { value: 'Hautarzt', label: 'Hautarzt' },
    { value: 'Orthopäde', label: 'Orthopäde' },
    { value: 'Sonstiges', label: 'Sonstiges' }
  ];

  // Intervalloptionen in Monaten
  const intervalOptions = [
    { value: 1, label: '1 Monat' },
    { value: 3, label: '3 Monate' },
    { value: 6, label: '6 Monate' },
    { value: 12, label: '1 Jahr' },
    { value: 24, label: '2 Jahre' }
  ];

  // Lade Gesundheitsintervalle beim Seitenaufruf
  useEffect(() => {
    fetchIntervals();
  }, []);

  // Funktion zum Laden der Gesundheitsintervalle
  const fetchIntervals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/health-intervals');
      setIntervals(response.data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Gesundheitsintervalle:', err);
      setError('Fehler beim Laden der Gesundheitsintervalle. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Dialog öffnen zum Erstellen/Bearbeiten
  const handleOpenDialog = (interval = null) => {
    if (interval) {
      // Bearbeiten eines bestehenden Intervalls
      setEditingInterval(interval);
      setFormData({
        interval_type: interval.interval_type,
        interval_months: interval.interval_months,
        last_appointment: DateTime.fromISO(interval.last_appointment)
      });
    } else {
      // Neues Intervall erstellen
      setEditingInterval(null);
      setFormData({
        interval_type: '',
        interval_months: 6,
        last_appointment: DateTime.now()
      });
    }
    setOpenDialog(true);
  };

  // Dialog schließen
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Formularänderungen verarbeiten
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Datumsänderungen verarbeiten
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      last_appointment: date
    });
  };

  // Formular absenden
  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        last_appointment: formData.last_appointment.toISO()
      };

      let response;
      if (editingInterval) {
        // Aktualisiere bestehendes Intervall
        response = await api.put(`/api/health-intervals/${editingInterval.id}`, data);
        
        // Aktualisiere die Liste der Intervalle
        setIntervals(intervals.map(interval => 
          interval.id === editingInterval.id ? response.data : interval
        ));
        
        setSnackbar({
          open: true,
          message: 'Gesundheitsintervall erfolgreich aktualisiert',
          severity: 'success'
        });
      } else {
        // Erstelle neues Intervall
        response = await api.post('/api/health-intervals', data);
        
        // Füge das neue Intervall zur Liste hinzu
        setIntervals([...intervals, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Gesundheitsintervall erfolgreich erstellt',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Fehler beim Speichern des Gesundheitsintervalls:', err);
      setSnackbar({
        open: true,
        message: 'Fehler beim Speichern des Gesundheitsintervalls',
        severity: 'error'
      });
    }
  };

  // Intervall löschen
  const handleDelete = async (id) => {
    if (window.confirm('Möchtest du dieses Gesundheitsintervall wirklich löschen?')) {
      try {
        await api.delete(`/api/health-intervals/${id}`);
        
        // Entferne das gelöschte Intervall aus der Liste
        setIntervals(intervals.filter(interval => interval.id !== id));
        
        setSnackbar({
          open: true,
          message: 'Gesundheitsintervall erfolgreich gelöscht',
          severity: 'success'
        });
      } catch (err) {
        console.error('Fehler beim Löschen des Gesundheitsintervalls:', err);
        setSnackbar({
          open: true,
          message: 'Fehler beim Löschen des Gesundheitsintervalls',
          severity: 'error'
        });
      }
    }
  };

  // Formatiere Datum für die Anzeige
  const formatDate = (date) => {
    // Prüfe, ob das Datum definiert ist
    if (!date) return 'Nicht definiert';
    
    // Stelle sicher, dass das Datum ein Luxon DateTime-Objekt ist
    const dateTime = typeof date === 'string' ? DateTime.fromISO(date) : date;
    
    // Prüfe, ob das DateTime-Objekt gültig ist
    if (!dateTime.isValid) return 'Ungültiges Datum';
    
    return dateTime.toFormat('dd.MM.yyyy');
  };

  // Berechne Status (überfällig, bald fällig, ok)
  const getStatus = (nextDate) => {
    const currentDate = DateTime.now();
    const nextAppointment = DateTime.fromISO(nextDate);
    const diffDays = nextAppointment.diff(currentDate, 'day').days;
    
    if (diffDays < 0) {
      return { text: 'Überfällig', color: 'error' };
    } else if (diffDays < 30) {
      return { text: 'Bald fällig', color: 'warning' };
    } else {
      return { text: 'OK', color: 'success' };
    }
  };

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4">Gesundheitsintervalle</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Neues Intervall
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            border: 1, 
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {intervals.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }}>
                  <TableRow>
                    <TableCell>Typ</TableCell>
                    <TableCell>Intervall</TableCell>
                    <TableCell>Letzter Termin</TableCell>
                    <TableCell>Nächster Termin</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {intervals.map((interval) => {
                    const status = getStatus(interval.next_appointment);
                    return (
                      <TableRow 
                        key={interval.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                          }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {interval.interval_type}
                        </TableCell>
                        <TableCell>{interval.interval_months} Monate</TableCell>
                        <TableCell>{formatDate(interval.last_appointment)}</TableCell>
                        <TableCell>{formatDate(interval.next_appointment)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={status.text} 
                            color={status.color} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            aria-label="bearbeiten" 
                            onClick={() => handleOpenDialog(interval)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            aria-label="löschen" 
                            onClick={() => handleDelete(interval.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
            }}>
              <Typography variant="body1" color="text.secondary">
                Keine Gesundheitsintervalle definiert. Klicke auf "Neues Intervall", um ein Intervall hinzuzufügen.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Neues Intervall
              </Button>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Dialog zum Hinzufügen/Bearbeiten eines Intervalls */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingInterval ? 'Intervall bearbeiten' : 'Neues Intervall hinzufügen'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Typ des Intervalls"
              variant="outlined"
              fullWidth
              value={formData.interval_type}
              onChange={handleFormChange}
              name="interval_type"
              placeholder="z.B. Zahnarzt, Augenarzt, Bluttest"
              required
            />
            
            <TextField
              label="Intervall in Monaten"
              variant="outlined"
              fullWidth
              type="number"
              value={formData.interval_months}
              onChange={handleFormChange}
              name="interval_months"
              InputProps={{ inputProps: { min: 1, max: 60 } }}
              required
            />
            
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={locale}>
              <DatePicker
                label="Letzter Termin"
                value={formData.last_appointment}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                disableFuture
              />
            </LocalizationProvider>
            
            {formData.last_appointment && formData.interval_months && (
              <Box sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 1
              }}>
                <Typography variant="body2">
                  Nächster empfohlener Termin: <strong>{formatDate(DateTime.fromISO(formData.last_appointment.toISO()).plus({ months: formData.interval_months }))}</strong>
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.interval_type || !formData.interval_months || !formData.last_appointment}
          >
            {editingInterval ? 'Speichern' : 'Hinzufügen'}
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
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default HealthIntervals;
