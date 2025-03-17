import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import Holidays from 'date-holidays';
import FullScreenCalendar from '../components/Calendar/FullScreenCalendar';
import api from '../utils/api';

// Initialisiere Feiertage für Deutschland (Bundesland wird dynamisch geladen)
const hd = new Holidays();

const Calendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regularEvents, setRegularEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showHolidays, setShowHolidays] = useState(true);
  const [calendarData, setCalendarData] = useState([]);
  const [userState, setUserState] = useState('BY'); // Default: Bayern
  const [lastStateChange, setLastStateChange] = useState(Date.now());

  // Lade Benutzereinstellungen
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await api.get('/api/settings');
        if (response.data) {
          // Bundesland-Einstellung laden
          if (response.data.state) {
            setUserState(response.data.state);
            setLastStateChange(Date.now());
          }
          
          // Feiertage-Einstellung laden
          if (response.data.showHolidays !== undefined) {
            setShowHolidays(response.data.showHolidays);
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzereinstellungen:', error);
      }
    };
    
    fetchUserSettings();
  }, []);

  // Lade Feiertage basierend auf dem Bundesland
  useEffect(() => {
    // Verhindere mehrfache Ausführungen in kurzer Zeit
    const debounceTimeout = setTimeout(() => {
      // Konfiguriere Feiertage für das ausgewählte Bundesland
      hd.init('DE', userState);
      
      const loadHolidays = () => {
        const currentYear = new Date().getFullYear();
        let allHolidays = [];
        
        // Lade Feiertage für das aktuelle Jahr und die nächsten 3 Jahre
        for (let year = currentYear; year <= currentYear + 3; year++) {
          const holidaysList = hd.getHolidays(year);
          
          // Formatiere Feiertage für den Kalender
          const formattedHolidays = holidaysList.map((holiday, index) => ({
            id: `holiday-${holiday.name.replace(/\s+/g, '-')}-${holiday.date}-${index}`,
            title: holiday.name,
            start: new Date(holiday.start),
            end: new Date(holiday.end),
            allDay: true,
            isHoliday: true,
            holidayType: holiday.type
          }));
          
          allHolidays = [...allHolidays, ...formattedHolidays];
        }
        
        setHolidays(allHolidays);
      };
      
      loadHolidays();
    }, 300); // 300ms Verzögerung, um mehrfache Ausführungen zu reduzieren
    
    // Bereinige den Timeout beim Unmount oder bei Änderungen
    return () => clearTimeout(debounceTimeout);
  }, [userState, lastStateChange]);

  // Lade Termine vom Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/events');
        
        // Konvertiere Datumsstrings in Date-Objekte
        const formattedEvents = response.data.map(event => ({
          ...event,
          start: new Date(event.start_time),
          end: new Date(event.end_time)
        }));
        
        // Speichere reguläre Termine separat
        setRegularEvents(formattedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
        setError('Fehler beim Laden der Termine. Bitte versuche es später erneut.');
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Konvertiere Termine in das Format für den FullScreenCalendar
  useEffect(() => {
    // Kombiniere reguläre Termine und Feiertage, wenn showHolidays aktiviert ist
    const allEvents = showHolidays ? [...regularEvents, ...holidays] : [...regularEvents];
    
    // Gruppiere Termine nach Tagen
    const eventsByDay = {};
    
    allEvents.forEach(event => {
      const eventDate = new Date(event.start);
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      
      if (!eventsByDay[dateKey]) {
        eventsByDay[dateKey] = {
          day: new Date(eventDate.setHours(0, 0, 0, 0)),
          events: []
        };
      }
      
      // Formatiere das Event für den FullScreenCalendar
      eventsByDay[dateKey].events.push({
        id: event.id || `holiday-${event.title.replace(/\s+/g, '-')}-${dateKey}`,
        name: event.title,
        time: event.allDay ? 'Ganztägig' : `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')} Uhr`,
        datetime: event.start.toISOString(),
        originalEvent: event // Speichere das ursprüngliche Event für die Weiterverarbeitung
      });
    });
    
    // Konvertiere das Objekt in ein Array
    const calendarDataArray = Object.values(eventsByDay);
    
    setCalendarData(calendarDataArray);
  }, [regularEvents, holidays, showHolidays]);

  // Navigiere zur Termin-Erstellungsseite
  const handleAddEvent = (day) => {
    // Erstelle Start- und Endzeit für den neuen Termin (9:00 - 10:00 Uhr am ausgewählten Tag)
    const startTime = new Date(day);
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(day);
    endTime.setHours(10, 0, 0, 0);
    
    navigate('/events/new', { 
      state: { 
        defaultStart: startTime.toISOString(),
        defaultEnd: endTime.toISOString()
      } 
    });
  };

  // Navigiere zur Termin-Bearbeitungsseite, wenn ein Termin angeklickt wird
  const handleSelectEvent = (event) => {
    // Hole das ursprüngliche Event aus dem originalEvent-Feld
    const originalEvent = event.originalEvent;
    
    // Ignoriere Klicks auf Feiertage
    if (originalEvent.isHoliday) return;
    
    navigate(`/events/${originalEvent.id}/edit`);
  };

  // Behandle Klick auf einen Tag im Kalender
  const handleSelectDay = (day) => {
    // Prüfe, ob es bereits Termine an diesem Tag gibt
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayEvents = calendarData.find(item => format(item.day, 'yyyy-MM-dd') === dateKey);
    
    // Wenn es keine Termine gibt oder nur Feiertage, erstelle einen neuen Termin
    if (!dayEvents || dayEvents.events.every(event => event.originalEvent.isHoliday)) {
      handleAddEvent(day);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Typography>Termine werden geladen...</Typography>
      ) : (
        <Box sx={{ height: '100%', width: '100%' }}>
          <FullScreenCalendar 
            data={calendarData}
            onAddEvent={handleAddEvent}
            onSelectEvent={handleSelectEvent}
            onSelectDay={handleSelectDay}
          />
        </Box>
      )}
    </Box>
  );
};

export default Calendar;
