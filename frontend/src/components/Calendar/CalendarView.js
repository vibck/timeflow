import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/de';
import dayjs from 'dayjs';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

// Formatiere Datum für Tooltips
const eventTooltipAccessor = (event) => {
  const start = dayjs(event.start).format('DD.MM.YYYY HH:mm');
  const end = dayjs(event.end).format('DD.MM.YYYY HH:mm');
  return `${event.title}\n${start} - ${end}${event.location ? `\nOrt: ${event.location}` : ''}`;
};

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lade Termine vom Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/events`);
        
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
        setError('Termine konnten nicht geladen werden. Bitte versuche es später erneut.');
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
      
      {loading ? (
        <Typography>Termine werden geladen...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
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
          views={['month', 'week', 'day', 'agenda']}
          popup
        />
      )}
    </Paper>
  );
};

export default CalendarView; 