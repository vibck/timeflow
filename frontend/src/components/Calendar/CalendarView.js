import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/de';
import dayjs from 'dayjs';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert, 
  IconButton, 
  Tooltip,
  ButtonGroup
} from '@mui/material';
import { 
  Add as AddIcon, 
  ChevronLeft, 
  ChevronRight, 
  Today
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css'; // Importiere benutzerdefinierte CSS-Datei

// Setze die Sprache auf Deutsch
moment.locale('de');

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
  const start = dayjs(event.start).format('DD.MM.YYYY HH:mm [Uhr]');
  const end = dayjs(event.end).format('DD.MM.YYYY HH:mm [Uhr]');
  return `${event.title}\n${start} - ${end}${event.location ? `\nOrt: ${event.location}` : ''}`;
};

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  const navigate = useNavigate();

  // Lade Termine vom Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Hole den Token aus dem localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Du bist nicht angemeldet. Bitte melde dich an, um deine Termine zu sehen.');
          setLoading(false);
          return;
        }
        
        // Setze den Authorization-Header
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/events`, config);
        
        // Formatiere die Termine für den Kalender
        const formattedEvents = response.data.map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          location: event.location,
          description: event.description,
          event_type: event.event_type
        }));
        
        setEvents(formattedEvents);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Termine:', err);
        if (err.response && err.response.status === 401) {
          setError('Du bist nicht angemeldet oder deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
        } else {
          setError('Termine konnten nicht geladen werden. Bitte versuche es später erneut.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Navigiere zur Termin-Erstellungsseite
  const handleAddEvent = () => {
    navigate('/events/new');
  };

  // Navigiere zur Termin-Bearbeitungsseite, wenn ein Termin angeklickt wird
  const handleSelectEvent = useCallback((event) => {
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

  return (
    <Paper elevation={3} sx={{ p: 3, height: 'calc(100vh - 180px)', mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Kalender
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddEvent}
        >
          Neuer Termin
        </Button>
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
                {moment(date).format(view === 'month' ? 'MMMM YYYY' : 'DD. MMMM YYYY')}
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
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
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
        </Box>
      )}
    </Paper>
  );
};

export default CalendarView; 