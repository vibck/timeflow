import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/de';
import { DateTime } from 'luxon';
import Holidays from 'date-holidays';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert, 
  IconButton, 
  Tooltip,
  ButtonGroup,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Add as AddIcon, 
  ChevronLeft, 
  ChevronRight, 
  Today
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css'; // Importiere benutzerdefinierte CSS-Datei

// Setze die Sprache auf Deutsch
// eslint-disable-next-line no-unused-vars
const locale = 'de';

// Initialisiere Feiertage für Deutschland (Bundesland wird dynamisch geladen)
const hd = new Holidays();

// Lokalisierung für den Kalender
const messages = {
  allDay: 'Ganztägig',
  previous: 'Zurück',
  next: 'Weiter',
  today: 'Heute',
  month: 'Monat',
  week: 'Woche',
  day: 'Tag',
  agenda: 'Agenda',
  date: 'Datum',
  time: 'Zeit',
  event: 'Termin',
  noEventsInRange: 'Keine Termine in diesem Zeitraum.',
};

// Benutzerdefinierte Formatierungen für die Zeitanzeige
const formats = {
  timeGutterFormat: 'HH:mm',
  eventTimeRangeFormat: ({ start, end }) => {
    return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')} Uhr`;
  },
  agendaTimeRangeFormat: ({ start, end }) => {
    return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')} Uhr`;
  },
  dayRangeHeaderFormat: ({ start, end }) => {
    return `${moment(start).format('DD.MM.YYYY')} - ${moment(end).format('DD.MM.YYYY')}`;
  },
};

// Formatiere Datum für Tooltips
const eventTooltipAccessor = (event) => {
  const start = DateTime.fromISO(event.start).toLocaleString(DateTime.DATETIME_MED);
  const end = DateTime.fromISO(event.end).toLocaleString(DateTime.DATETIME_MED);
  return `${event.title}\n${start} - ${end}${event.location ? `\nOrt: ${event.location}` : ''}`;
};

// Benutzerdefinierte Agenda-Komponente
const CustomAgendaView = ({ events, date, onSelectEvent, showHolidays }) => {
  // Filtere Feiertage immer aus der Agenda heraus, unabhängig von showHolidays
  const filteredEvents = events.filter(event => !event.isHoliday);
  
  // Sortiere Termine nach Startdatum
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start) - new Date(b.start));
  
  // Gruppiere Termine nach Monat
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const monthYear = DateTime.fromJSDate(new Date(event.start)).toLocaleString({ month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(event);
    return groups;
  }, {});

  return (
    <Box sx={{ p: 2, overflowY: 'auto', height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Terminübersicht
      </Typography>
      
      {Object.keys(groupedEvents).length === 0 ? (
        <Typography>Keine Termine gefunden.</Typography>
      ) : (
        Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
          <Box key={monthYear} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
              {monthYear}
            </Typography>
            
            {monthEvents.map((event, index) => {
              // Erstelle einen eindeutigen Schlüssel für jeden Termin
              const eventKey = event.id 
                ? `event-${event.id}` 
                : `holiday-${event.title.replace(/\s+/g, '-')}-${DateTime.fromISO(event.start).toISODate()}-${index}`;
              
              return (
                <Box 
                  key={eventKey}
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderLeft: event.isHoliday ? '4px solid #8e24aa' : '4px solid #3174ad',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    cursor: event.isHoliday ? 'default' : 'pointer',
                    '&:hover': {
                      backgroundColor: event.isHoliday ? '#f5f5f5' : '#e0e0e0'
                    }
                  }}
                  onClick={() => !event.isHoliday && onSelectEvent(event)}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {event.title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {event.isHoliday ? (
                      'Ganztägig'
                    ) : (
                      `${DateTime.fromISO(event.start).toLocaleString({ month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} - ${DateTime.fromISO(event.end).toLocaleString({ hour: '2-digit', minute: '2-digit' })} Uhr`
                    )}
                  </Typography>
                  
                  {event.location && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Ort:</strong> {event.location}
                    </Typography>
                  )}
                  
                  {event.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Beschreibung:</strong> {event.description}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ))
      )}
    </Box>
  );
};

const CalendarView = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [view, setView] = useState('month');
  const navigate = useNavigate();
  const [userState, setUserState] = useState(localStorage.getItem('userState') || 'BY');
  const [regularEvents, setRegularEvents] = useState([]);
  const [showHolidays, setShowHolidays] = useState(false);
  const [lastStateChange, setLastStateChange] = useState(Date.now()); // Zeitstempel der letzten Änderung

  // Überwache Änderungen am Bundesland im lokalen Speicher
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e && e.key === 'userState') {
        const newState = e.newValue || 'BY';
        if (newState !== userState) {
          setUserState(newState);
          setLastStateChange(Date.now());
        }
      }
    };

    // Reagiere auf das benutzerdefinierte Event für Bundeslandänderungen
    const handleStateChange = (e) => {
      const newState = e.detail.newState || 'BY';
      if (newState !== userState) {
        setUserState(newState);
        setLastStateChange(Date.now());
      }
    };

    // Füge Event-Listener für Änderungen im lokalen Speicher hinzu
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('stateChange', handleStateChange);

    // Bereinige die Event-Listener beim Unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('stateChange', handleStateChange);
    };
  }, [userState]);

  // Funktion zum Aktualisieren der angezeigten Termine
  const updateEventsDisplay = useCallback(() => {
    if (showHolidays) {
      setEvents([...regularEvents, ...holidays]);
    } else {
      setEvents([...regularEvents]);
    }
  }, [showHolidays, regularEvents, holidays]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState, lastStateChange]);

  // Aktualisiere die Termine, wenn sich showHolidays, regularEvents oder holidays ändern
  useEffect(() => {
    updateEventsDisplay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateEventsDisplay]);

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
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []); // Nur beim Mounten ausführen

  // Navigiere zur Termin-Erstellungsseite
  const handleAddEvent = () => {
    navigate('/events/new');
  };

  // Navigiere zur Termin-Bearbeitungsseite, wenn ein Termin angeklickt wird
  const handleSelectEvent = useCallback((event) => {
    // Ignoriere Klicks auf Feiertage
    if (event.isHoliday) return;
    
    navigate(`/events/${event.id}/edit`);
  }, [navigate]);

  // Navigiere zur Termin-Erstellungsseite mit vorausgewähltem Datum, wenn ein leerer Zeitraum angeklickt wird
  const handleSelectSlot = useCallback(({ start, end }) => {
    navigate('/events/new', { 
      state: { 
        defaultStart: start.toISOString(),
        defaultEnd: end.toISOString()
      } 
    });
  }, [navigate]);

  // Anpassen der Darstellung von Terminen
  const eventStyleGetter = (event) => {
    // Spezielle Darstellung für Feiertage
    if (event.isHoliday) {
      // Verschiedene Farben je nach Feiertagstyp
      let holidayColor = '#8e24aa'; // Standard-Lila für Feiertage
      
      if (event.holidayType === 'public') {
        holidayColor = '#8e24aa'; // Lila für öffentliche Feiertage
      } else if (event.holidayType === 'bank') {
        holidayColor = '#6a1b9a'; // Dunkleres Lila für Bankfeiertage
      } else if (event.holidayType === 'observance') {
        holidayColor = '#ba68c8'; // Helleres Lila für Gedenktage
      }
      
      return {
        style: {
          backgroundColor: holidayColor,
          borderRadius: '4px',
          opacity: 0.7,
          color: 'white',
          border: '0px',
          display: 'block',
          textAlign: 'center',
          fontStyle: 'italic'
        },
        className: 'holiday'
      };
    }
    
    // Normale Termine
    let backgroundColor = '#3174ad'; // Standard-Blau
    
    // Verschiedene Farben je nach Termintyp
    switch(event.event_type) {
      case 'health':
        backgroundColor = '#28a745'; // Grün für Gesundheitstermine
        break;
      case 'work':
        backgroundColor = '#dc3545'; // Rot für Arbeitstermine
        break;
      case 'personal':
        backgroundColor = '#fd7e14'; // Orange für persönliche Termine
        break;
      default:
        break;
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Behandle Änderungen der Ansicht oder des Datums
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Lösche einen Termin
  // eslint-disable-next-line no-unused-vars
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      try {
        await api.delete(`/api/events/${eventId}`);
        
        // Aktualisiere die Terminliste
        setRegularEvents(regularEvents.filter(event => event.id !== eventId));
        
        // Zeige Erfolgsmeldung
        alert('Termin erfolgreich gelöscht');
      } catch (error) {
        console.error('Fehler beim Löschen des Termins:', error);
        alert('Fehler beim Löschen des Termins');
      }
    }
  };

  // Toggle für Feiertage
  const handleToggleHolidays = () => {
    setShowHolidays(!showHolidays);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: 'calc(100vh - 180px)', mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Kalender
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showHolidays}
                onChange={handleToggleHolidays}
                color="primary"
              />
            }
            label="Feiertage anzeigen"
            sx={{ mr: 2 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddEvent}
          >
            Neuer Termin
          </Button>
        </Box>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Typography>Termine werden geladen...</Typography>
      ) : (
        <Box sx={{ height: 'calc(100% - 50px)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Heute">
                <IconButton onClick={() => handleNavigate(new Date())}>
                  <Today />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zurück">
                <IconButton onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(date.getMonth() - 1);
                  } else if (view === 'week') {
                    newDate.setDate(date.getDate() - 7);
                  } else if (view === 'day') {
                    newDate.setDate(date.getDate() - 1);
                  }
                  handleNavigate(newDate);
                }}>
                  <ChevronLeft />
                </IconButton>
              </Tooltip>
              <Tooltip title="Weiter">
                <IconButton onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(date.getMonth() + 1);
                  } else if (view === 'week') {
                    newDate.setDate(date.getDate() + 7);
                  } else if (view === 'day') {
                    newDate.setDate(date.getDate() + 1);
                  }
                  handleNavigate(newDate);
                }}>
                  <ChevronRight />
                </IconButton>
              </Tooltip>
              
              <Typography variant="h6" sx={{ ml: 2 }}>
                {DateTime.fromJSDate(date).toLocaleString({ month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
            <ButtonGroup size="small">
              <Button
                variant={view === 'month' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('month')}
              >
                Monat
              </Button>
              <Button
                variant={view === 'week' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('week')}
              >
                Woche
              </Button>
              <Button
                variant={view === 'day' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('day')}
              >
                Tag
              </Button>
              <Button
                variant={view === 'agenda' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('agenda')}
              >
                Agenda
              </Button>
            </ButtonGroup>
          </Box>
          
          {view === 'agenda' ? (
            <CustomAgendaView 
              events={events} 
              date={date} 
              onSelectEvent={handleSelectEvent} 
              showHolidays={showHolidays}
            />
          ) : (
            <Calendar
              localizer={momentLocalizer(moment)}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 'calc(100% - 50px)' }}
              tooltipAccessor={eventTooltipAccessor}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              messages={messages}
              eventPropGetter={eventStyleGetter}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              view={view}
              onView={handleViewChange}
              date={date}
              onNavigate={handleNavigate}
              popup
              formats={formats}
              components={{
                toolbar: () => null // Verstecke die eingebaute Toolbar
              }}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CalendarView; 