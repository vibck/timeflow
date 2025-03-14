import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import api from '../utils/api';

// Setze die Sprache auf Deutsch
dayjs.locale('de');

const HealthIntervals = () => {
  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInterval, setEditingInterval] = useState(null);
  const [formData, setFormData] = useState({
    interval_type: '',
    interval_months: 6,
    last_appointment: dayjs()
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
        last_appointment: dayjs(interval.last_appointment)
      });
    } else {
      // Neues Intervall erstellen
      setEditingInterval(null);
      setFormData({
        interval_type: '',
        interval_months: 6,
        last_appointment: dayjs()
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
        last_appointment: formData.last_appointment.format('YYYY-MM-DD')
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

  // Snackbar schließen
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Formatiere Datum für die Anzeige
  const formatDate = (date) => {
    return dayjs(date).format('DD.MM.YYYY');
  };

  // Berechne Status (überfällig, bald fällig, ok)
  const getStatus = (nextDate) => {
    const now = dayjs();
    const next = dayjs(nextDate);
    const diffDays = next.diff(now, 'day');
    
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Gesundheitsintervalle</Typography>
        <Button 
          variant="contained" 
          color="primary" 
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
      ) : intervals.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            Keine Gesundheitsintervalle gefunden. Erstelle dein erstes Intervall mit dem Button oben.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Typ</TableCell>
                <TableCell>Intervall</TableCell>
                <TableCell>Letzter Termin</TableCell>
                <TableCell>Nächster Termin</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {intervals.map((interval) => {
                const status = getStatus(interval.next_suggested_date);
                return (
                  <TableRow key={interval.id}>
                    <TableCell>{interval.interval_type}</TableCell>
                    <TableCell>
                      {interval.interval_months === 1 
                        ? '1 Monat' 
                        : interval.interval_months === 12 
                          ? '1 Jahr' 
                          : interval.interval_months === 24 
                            ? '2 Jahre' 
                            : `${interval.interval_months} Monate`}
                    </TableCell>
                    <TableCell>{formatDate(interval.last_appointment)}</TableCell>
                    <TableCell>{formatDate(interval.next_suggested_date)}</TableCell>
                    <TableCell>
                      <Typography color={status.color}>{status.text}</Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(interval)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(interval.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Dialog zum Erstellen/Bearbeiten von Intervallen */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {editingInterval ? 'Gesundheitsintervall bearbeiten' : 'Neues Gesundheitsintervall'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Typ"
              name="interval_type"
              value={formData.interval_type}
              onChange={handleFormChange}
              margin="normal"
              required
            >
              {intervalTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              fullWidth
              label="Intervall"
              name="interval_months"
              value={formData.interval_months}
              onChange={handleFormChange}
              margin="normal"
              required
            >
              {intervalOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
              <DatePicker
                label="Letzter Termin"
                value={formData.last_appointment}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                sx={{ width: '100%', mt: 2 }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HealthIntervals;
