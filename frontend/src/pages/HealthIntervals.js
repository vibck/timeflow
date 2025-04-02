"use client"

import React, { useState, useEffect, forwardRef } from 'react';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import de from 'date-fns/locale/de';
import { DateTime } from 'luxon';
import api from '../utils/api';
import { Plus, Edit, Trash2, Search, Filter, X, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

// Deutsche Sprache für Datepicker registrieren
registerLocale('de', de);
setDefaultLocale('de');

const HealthIntervals = () => {
  const { currentUser } = useAuth();
  const { mode } = useThemeContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInterval, setEditingInterval] = useState(null);
  const [formData, setFormData] = useState({
    interval_type: '',
    interval_months: 6,
    last_appointment: new Date()
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInterval, setNewInterval] = useState({
    title: '',
    interval: 6,
    lastVisit: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [showAllIntervals, setShowAllIntervals] = useState(false);

  // Lade Gesundheitsintervalle beim Seitenaufruf
  useEffect(() => {
    fetchIntervals();
  }, []);

  // Funktion zum Laden der Gesundheitsintervalle
  const fetchIntervals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/health-intervals');
      
      // Konvertiere die API-Daten in das richtige Format
      const formattedIntervals = response.data.map(interval => {
        // Stelle sicher, dass die Datumsformate korrekt sind
        const lastVisitDate = interval.last_appointment ? new Date(interval.last_appointment) : new Date();
        const nextVisitDate = interval.next_appointment ? new Date(interval.next_appointment) : new Date();
        
        // Berechne das nächste Besuchsdatum neu, falls es nicht vorhanden ist
        if (!interval.next_appointment) {
          nextVisitDate.setMonth(lastVisitDate.getMonth() + Number(interval.interval_months));
        }
        
        return {
          id: interval.id,
          title: interval.interval_type,
          interval: interval.interval_months,
          lastVisit: lastVisitDate.toISOString(),
          nextVisit: nextVisitDate.toISOString(),
          notes: interval.notes || ''
        };
      });
      
      setIntervals(formattedIntervals);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Gesundheitsintervalle');
      // Keine Fallback-Daten mehr
      setIntervals([]);
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
        last_appointment: new Date(interval.last_appointment)
      });
    } else {
      // Neues Intervall erstellen
      setEditingInterval(null);
      setFormData({
        interval_type: '',
        interval_months: 6,
        last_appointment: new Date()
      });
    }
    setOpenDialog(true);
  };

  // Dialog schließen
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Formularänderungen verarbeiten
  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Benutzerdefinierte Eingabe für den DatePicker
  const CustomDatePickerInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <TextField
      fullWidth
      label="Letzter Termin"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      InputProps={{
        readOnly: true
      }}
      ref={ref}
      required
    />
  ));

  // Berechne das nächste Besuchsdatum basierend auf dem letzten Besuch und dem Intervall
  const calculateNextVisit = (lastVisit, intervalMonths) => {
    try {
      const lastVisitDate = new Date(lastVisit);
      const nextVisitDate = new Date(lastVisitDate);
      nextVisitDate.setMonth(lastVisitDate.getMonth() + Number(intervalMonths));
      return nextVisitDate.toISOString();
    } catch (error) {
      return new Date().toISOString(); // Fallback zum aktuellen Datum
    }
  };

  // Formular absenden über den Modal-Dialog
  const handleSubmit = async () => {
    try {
      // Berechne das nächste Besuchsdatum
      const nextVisitDate = calculateNextVisit(formData.last_appointment, formData.interval_months);
      
      const data = {
        ...formData,
        last_appointment: DateTime.fromJSDate(formData.last_appointment).toISO(),
        next_appointment: nextVisitDate
      };

      let response;
      if (editingInterval) {
        // Aktualisiere bestehendes Intervall
        response = await api.put(`/api/health-intervals/${editingInterval.id}`, data);
        
        // Aktualisiere die Liste der Intervalle
        setIntervals(intervals.map(interval => 
          interval.id === editingInterval.id ? {
            id: response.data.id,
            title: response.data.interval_type,
            interval: response.data.interval_months,
            lastVisit: response.data.last_appointment,
            nextVisit: response.data.next_appointment,
            notes: response.data.notes || ''
          } : interval
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
        setIntervals([...intervals, {
          id: response.data.id,
          title: response.data.interval_type,
          interval: response.data.interval_months,
          lastVisit: response.data.last_appointment,
          nextVisit: response.data.next_appointment,
          notes: response.data.notes || ''
        }]);
        
        setSnackbar({
          open: true,
          message: 'Gesundheitsintervall erfolgreich erstellt',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Fehler beim Speichern des Gesundheitsintervalls',
        severity: 'error'
      });
    }
  };

  // Intervall löschen
  const handleDelete = async id => {
      try {
        await api.delete(`/api/health-intervals/${id}`);
        // Entferne das gelöschte Intervall aus der Liste
        setIntervals(intervals.filter(interval => interval.id !== id));
      } catch (err) {
        alert('Fehler beim Löschen des Intervalls');
    }
  };

  // Formatiere Datum für die Anzeige
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ungültiges Datum';
      }
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  // Berechne Status (überfällig, bald fällig, ok)
  const getStatus = nextDate => {
    if (!nextDate || nextDate === 'Nicht definiert') return 'OK';
    
    const currentDate = DateTime.now();
    const nextAppointment = DateTime.fromISO(nextDate);
    const diffDays = nextAppointment.diff(currentDate, 'days').days;
    
    if (diffDays < 0) return 'Überfällig';
    if (diffDays < 30) return 'Bald fällig';
    return 'OK';
  };

  // Edit-Funktion
  const handleEdit = (interval) => {
    setEditingInterval(interval);
    setNewInterval({
      title: interval.title,
      interval: interval.interval,
      lastVisit: new Date(interval.lastVisit).toISOString().split('T')[0],
      notes: interval.notes || ''
    });
    setShowAddModal(true);
  };

  // Event-Handler für den Modal-Dialog
  const handleAddOrEditInterval = () => {
    if (editingInterval) {
      handleAddInterval(); // Verwende die bestehende Funktion für beide Fälle
    } else {
      handleAddInterval();
    }
  };

  // Öffne den Modal-Dialog für ein neues Intervall
  const handleOpenAddModal = () => {
    setEditingInterval(null);
    setNewInterval({
      title: '',
      interval: 6,
      lastVisit: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddModal(true);
  };

  // Anpassen der handleAddInterval Funktion für das Editieren
  const handleAddInterval = async () => {
    try {
      // Überprüfe, ob ein Titel eingegeben wurde
      if (!newInterval.title || newInterval.title.trim() === '') {
        alert('Bitte geben Sie einen Titel ein.');
        return;
      }
      
      // Stelle sicher, dass das Intervall eine positive Zahl ist
      if (Number(newInterval.interval) <= 0) {
        alert('Das Intervall muss größer als 0 sein.');
        return;
      }
      
      // Berechne das nächste Besuchsdatum basierend auf dem letzten Besuch und dem Intervall
      const lastVisitDate = new Date(newInterval.lastVisit);
      const nextVisitDate = new Date(lastVisitDate);
      nextVisitDate.setMonth(lastVisitDate.getMonth() + Number(newInterval.interval));
      
      const intervalData = {
        interval_type: newInterval.title,
        interval_months: Number(newInterval.interval),
        last_appointment: lastVisitDate.toISOString(),
        next_appointment: nextVisitDate.toISOString(),
        notes: newInterval.notes
      };

      let response;
      if (editingInterval) {
        // Update existierendes Intervall
        response = await api.put(`/api/health-intervals/${editingInterval.id}`, intervalData);
        
        // Umwandlung der Antwortdaten
        const updatedInterval = {
          id: response.data.id,
          title: response.data.interval_type,
          interval: response.data.interval_months,
          lastVisit: response.data.last_appointment,
          nextVisit: response.data.next_appointment,
          notes: response.data.notes || ''
        };
        
        // Aktualisierung im State mit konsistenten Daten
        setIntervals(intervals.map(interval => 
          interval.id === editingInterval.id ? updatedInterval : interval
        ));
      } else {
        // Erstelle neues Intervall
        response = await api.post('/api/health-intervals', intervalData);
        
        // Umwandlung der Antwortdaten
        const newIntervalData = {
          id: response.data.id,
          title: response.data.interval_type,
          interval: response.data.interval_months,
          lastVisit: response.data.last_appointment,
          nextVisit: response.data.next_appointment,
          notes: response.data.notes || ''
        };
        
        // Hinzufügen zum State mit konsistenten Daten
        setIntervals([...intervals, newIntervalData]);
      }

      // Zurücksetzen des Formulars
      setNewInterval({
        title: '',
        interval: 6,
        lastVisit: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setEditingInterval(null);
      setShowAddModal(false);
      
      // Aktualisiere die Daten nach dem Speichern
      fetchIntervals();
    } catch (err) {
      alert('Fehler beim Speichern des Intervalls. Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.');
    }
  };

  const calculateProgress = (lastVisit, nextVisit) => {
    try {
      const now = new Date();
      // Stelle sicher, dass wir Date-Objekte haben
      const last = lastVisit instanceof Date ? lastVisit : new Date(lastVisit);
      const next = nextVisit instanceof Date ? nextVisit : new Date(nextVisit);
      
      // Prüfe, ob die Daten gültig sind
      if (isNaN(last.getTime()) || isNaN(next.getTime())) {
        return 0;
      }
      
      // Setze Uhrzeit auf Mitternacht für konsistente Berechnungen
      const lastDate = new Date(last);
      lastDate.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(next);
      nextDate.setHours(0, 0, 0, 0);
      
      const nowDate = new Date(now);
      nowDate.setHours(0, 0, 0, 0);
      
      // Gesamt Zeitspanne
      const total = nextDate - lastDate;
      
      // Wenn das Intervall ungültig ist oder 0, gib 0% zurück
      if (total <= 0) {
        return 0;
      }
      
      // Vergangene Zeit
      const elapsed = nowDate - lastDate;
      
      // Fortschritt berechnen und auf 0-100% begrenzen
      const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
      
      return progress;
    } catch (error) {
      return 0;
    }
  };

  const isOverdue = (nextVisit) => {
    try {
      // Stelle sicher, dass wir ein Date-Objekt haben
      const nextDate = nextVisit instanceof Date ? nextVisit : new Date(nextVisit);
      
      // Prüfe, ob das Datum gültig ist
      if (isNaN(nextDate.getTime())) {
        return false;
      }
      
      // Vergleiche nur Datum ohne Uhrzeit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextDateOnly = new Date(nextDate);
      nextDateOnly.setHours(0, 0, 0, 0);
      
      return nextDateOnly < today;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1120]" style={{
      color: mode === 'dark' ? "#ffffff" : "#1e293b",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif",
    }}>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-8">
          <div className="mb-4 md:mb-0">
            <h1 style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              background: "linear-gradient(90deg, #ff0066, #3399ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Gesundheitsintervalle
            </h1>
            <p style={{
              fontSize: "1rem",
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
            }}>
              Verwalte deine regelmäßigen Gesundheitstermine
            </p>
          </div>
          
          <button
            onClick={handleOpenAddModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 2rem",
              background: "linear-gradient(90deg, #ff0066, #3399ff)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            <Plus size={20} />
          Neues Intervall
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 pb-8">
          {intervals
            .slice(0, showAllIntervals ? intervals.length : 6)
            .map((interval) => (
            <div
              key={interval.id}
              className="bg-[#1a1f3e] border-[#2a2f4e] rounded-lg border overflow-hidden"
            >
              <div className="p-4 border-b border-[#2a2f4e]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-lg font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {interval.title}
                    </h3>
                    <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Alle {interval.interval} Monate
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(interval)}
                      className={`${mode === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(interval.id)}
                      className={`${mode === 'dark' ? 'text-gray-400 hover:text-[#ff0066]' : 'text-gray-400 hover:text-[#ff0066]'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Letzter Besuch
                      </span>
                      <span className={`text-sm ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(interval.lastVisit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Nächster Besuch
                      </span>
                      <span className={`text-sm ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(interval.nextVisit)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className={`w-full ${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-100'} h-2 rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${
                          isOverdue(interval.nextVisit)
                            ? 'bg-gradient-to-r from-[#ff0066] to-[#ff3366]'
                            : 'bg-gradient-to-r from-[#66cc66] to-[#88ee88]'
                        }`}
                        style={{ width: `${calculateProgress(interval.lastVisit, interval.nextVisit)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className={`text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {Math.round(calculateProgress(interval.lastVisit, interval.nextVisit))}%
                      </span>
                      {isOverdue(interval.nextVisit) && (
                        <span className="text-xs text-[#ff0066] flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Überfällig
                        </span>
                      )}
                    </div>
                  </div>

                  {interval.notes && (
                    <div className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {interval.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show more button */}
        {intervals.length > 6 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAllIntervals(!showAllIntervals)}
              className={`flex items-center text-sm ${
                mode === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              } transition-colors`}
            >
              {showAllIntervals ? "Weniger anzeigen" : "Alle anzeigen"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || editingInterval) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className={`${mode === 'dark' ? 'bg-[#1a1f3e]' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <h2 className={`text-xl font-medium mb-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {showAddModal ? 'Neues Intervall' : 'Intervall bearbeiten'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                    Titel
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? (newInterval?.title || '') : (editingInterval?.title || '')}
                    onChange={(e) => {
                      if (showAddModal) {
                        setNewInterval(prev => ({ ...prev, title: e.target.value }));
                      } else {
                        setEditingInterval(prev => ({ ...prev, title: e.target.value }));
                      }
                    }}
                    className={`w-full p-2 rounded ${
                      mode === 'dark' ? 'bg-[#2a2f4e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                    Intervall (Monate)
                  </label>
                  <input
              type="number"
                    value={showAddModal ? (newInterval?.interval || 6) : (editingInterval?.interval || 6)}
                    onChange={(e) => {
                      if (showAddModal) {
                        setNewInterval(prev => ({ ...prev, interval: parseInt(e.target.value) || 6 }));
                      } else {
                        setEditingInterval(prev => ({ ...prev, interval: parseInt(e.target.value) || 6 }));
                      }
                    }}
                    className={`w-full p-2 rounded ${
                      mode === 'dark' ? 'bg-[#2a2f4e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                    Letzter Besuch
                  </label>
                  <input
                    type="date"
                    value={showAddModal ? (newInterval?.lastVisit?.split('T')[0] || new Date().toISOString().split('T')[0]) : (editingInterval?.lastVisit?.split('T')[0] || new Date().toISOString().split('T')[0])}
                    onChange={(e) => {
                      if (showAddModal) {
                        setNewInterval(prev => ({ ...prev, lastVisit: e.target.value }));
                      } else {
                        setEditingInterval(prev => ({ ...prev, lastVisit: e.target.value }));
                      }
                    }}
                    className={`w-full p-2 rounded ${
                      mode === 'dark' ? 'bg-[#2a2f4e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                    Notizen
                  </label>
                  <textarea
                    value={showAddModal ? (newInterval?.notes || '') : (editingInterval?.notes || '')}
                    onChange={(e) => {
                      if (showAddModal) {
                        setNewInterval(prev => ({ ...prev, notes: e.target.value }));
                      } else {
                        setEditingInterval(prev => ({ ...prev, notes: e.target.value }));
                      }
                    }}
                    className={`w-full p-2 rounded ${
                      mode === 'dark' ? 'bg-[#2a2f4e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingInterval(null);
                    setNewInterval({
                      title: '',
                      interval: 6,
                      lastVisit: new Date().toISOString().split('T')[0],
                      notes: ''
                    });
                  }}
                  className={`px-4 py-2 rounded ${
                    mode === 'dark' ? 'bg-[#2a2f4e] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddOrEditInterval}
                  className="px-4 py-2 rounded bg-gradient-to-r from-[#ff0066] to-[#3399ff] text-white"
                >
                  {editingInterval ? 'Speichern' : 'Hinzufügen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthIntervals;
