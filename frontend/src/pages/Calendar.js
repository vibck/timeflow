import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  getDay, 
  isSameDay,
  parseISO,
  addMinutes
} from 'date-fns';
import { de } from 'date-fns/locale';
import { Alert } from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Holidays from 'date-holidays';
import EventForm from '../pages/EventForm';

// Keine Beispiel-Events mehr definieren

const Calendar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showHolidays, setShowHolidays] = useState(true);
  const [userState, setUserState] = useState('BY'); // Default: Bayern

  // Zustand für das EventForm-Popup
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [initialEventData, setInitialEventData] = useState(null);

  // Farben für verschiedene Termintypen
  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case "work":
        return "#3399ff";
      case "personal":
        return "#ff9900";
      case "health":
        return "#66cc66";
      default:
        return "#9966cc";
    }
  };

  // Lade Termine vom Backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events');
      
      // Konvertiere Datumsstrings in Date-Objekte
      const formattedEvents = response.data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        datetime: event.start_time,
        end_time: event.end_time,
        date: new Date(event.start_time),
        time: event.allDay 
          ? 'Ganztägig' 
          : `${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')}`,
        color: getEventTypeColor(event.event_type || 'personal'),
        event_type: event.event_type || 'personal',
        originalEvent: event // Originale Eventdaten für später
      }));
      
      setEvents(formattedEvents);
      
      // Für die Sidebar-Komponente - wir speichern die Events global
      window.calendarEvents = formattedEvents;
    } catch (error) {
      console.error('Fehler beim Laden der Termine:', error);
      setError('Fehler beim Laden der Termine. Bitte versuche es später erneut.');
      // Keine Fallback-Events mehr
      setEvents([]);
      
      // Leere Events für die Sidebar
      window.calendarEvents = [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Lade Benutzereinstellungen
    const fetchUserSettings = async () => {
      try {
        const response = await api.get('/api/settings');
        if (response.data) {
          // Bundesland-Einstellung laden
          if (response.data.state) {
            setUserState(response.data.state);
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
    fetchEvents();
    
    // Cleanup
    return () => {
      window.calendarEvents = null;
    };
  }, []);
  
  // Lade Feiertage, wenn sich das Bundesland, die Anzeige-Einstellung oder das Datum ändert
  useEffect(() => {
    const loadHolidays = () => {
      if (showHolidays) {
        try {
          const hd = new Holidays();
          hd.init('DE', userState);
          
          // Hole Feiertage für das aktuelle Jahr
          const year = currentDate.getFullYear();
          const holidaysData = hd.getHolidays(year);
          
          // Formatiere die Feiertage für die Anzeige im Kalender
          const formattedHolidays = holidaysData.map(holiday => ({
            id: `holiday-${holiday.date}`,
            title: holiday.name,
            date: new Date(holiday.start),
            isHoliday: true,
            color: '#9d7fea' // Elegantere lila Farbe für Feiertage
          }));
          
          setHolidays(formattedHolidays);
        } catch (error) {
          console.error('Fehler beim Laden der Feiertage:', error);
          setHolidays([]);
        }
      } else {
        setHolidays([]);
      }
    };
    
    loadHolidays();
  }, [userState, showHolidays, currentDate.getFullYear()]);

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Berechne die Tage für die aktuelle Monatsansicht (inkl. Tage des vorherigen/nächsten Monats)
  const getDaysForMonthView = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    // Alle Tage im aktuellen Monat
    const daysInMonth = eachDayOfInterval({ start, end });
    
    // Tage vom vorherigen Monat berechnen (europäischer Kalender beginnt mit Montag)
    const dayOfWeekStart = getDay(start) || 7; // Konvertiere Sonntag (0) zu 7 für europäischen Kalender
    const daysFromPrevMonth = dayOfWeekStart > 1 ? dayOfWeekStart - 1 : 0;
    
    // Tage vom vorherigen Monat holen
    const prevMonthDays = eachDayOfInterval({
      start: new Date(start.getFullYear(), start.getMonth(), start.getDate() - daysFromPrevMonth),
      end: new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1)
    });
    
    // Berechne, wie viele Tage wir vom nächsten Monat benötigen, um das Raster zu vervollständigen
    const totalDaysInGrid = Math.ceil((daysInMonth.length + daysFromPrevMonth) / 7) * 7;
    const daysFromNextMonth = totalDaysInGrid - (daysInMonth.length + daysFromPrevMonth);
    
    // Tage vom nächsten Monat holen
    const nextMonthDays = eachDayOfInterval({
      start: new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1),
      end: new Date(end.getFullYear(), end.getMonth(), end.getDate() + daysFromNextMonth)
    });
    
    // Alle Tage kombinieren
    return [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
  };

  // Ereignisse für einen bestimmten Tag abrufen
  const getEventsForDay = (day) => {
    // Normale Events für diesen Tag
    const dayEvents = events.filter(event => isSameDay(event.date, day));
    
    // Feiertage für diesen Tag, wenn angezeigt werden sollen
    const dayHolidays = showHolidays ? 
      holidays.filter(holiday => isSameDay(holiday.date, day)) : 
      [];
    
    // Kombiniere beide Arrays
    return [...dayEvents, ...dayHolidays];
  };

  // Öffne das Termin-Erstellen-Popup
  const handleAddEvent = (day) => {
    // Startzeit für den neuen Termin (default 9:00 - 10:00 Uhr)
    const startTime = new Date(day);
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(day);
    endTime.setHours(10, 0, 0, 0);
    
    setInitialEventData({
      start_time: startTime,
      end_time: endTime
    });
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  // Öffne das Termin-Bearbeiten-Popup
  const handleEditEvent = (event) => {
    // Prüfe, ob wir ein gültiges Event-Objekt haben
    if (event && event.id) {
      try {
        // Sichere Erstellung von Date-Objekten mit Fallbacks
        const createSafeDate = (dateValue) => {
          if (!dateValue) return new Date();
          
          try {
            const date = new Date(dateValue);
            // Überprüfe, ob das Datum gültig ist
            if (isNaN(date.getTime())) {
              console.warn('Ungültiges Datum erkannt:', dateValue);
              return new Date(); // Fallback auf aktuelles Datum
            }
            return date;
          } catch (e) {
            console.error('Fehler beim Erstellen des Date-Objekts:', e);
            return new Date(); // Fallback auf aktuelles Datum
          }
        };
        
        setSelectedEvent(event);
        
        // Überprüfe und parse die Datumswerte sicher
        const possibleDateValue = event.datetime || event.start_time || event.date;
        const startTime = createSafeDate(possibleDateValue);
        
        // Für end_time: Verwende entweder das vorhandene Feld oder berechne es basierend auf startTime
        const endTime = event.end_time 
          ? createSafeDate(event.end_time) 
          : addMinutes(startTime, 60); // Standard: 1 Stunde nach Beginn
        
        // Bereite die Event-Daten vor
        const eventData = {
          id: event.id,
          title: event.title,
          description: event.description || '',
          location: event.location || '',
          start_time: startTime,
          end_time: endTime,
          event_type: event.event_type || 'personal'
        };
        
        setInitialEventData(eventData);
        setShowEventForm(true);
      } catch (error) {
        console.error('Fehler beim Öffnen des Termin-Popups:', error);
        // Trotzdem versuchen, ein Basis-Popup zu öffnen
        setSelectedEvent(event);
        setInitialEventData({
          id: event.id,
          title: event.title,
          description: event.description || '',
          location: event.location || '',
          start_time: new Date(),
          end_time: addMinutes(new Date(), 60),
          event_type: event.event_type || 'personal'
        });
        setShowEventForm(true);
      }
    }
  };

  // Schließe das EventForm-Popup und lade die Termine neu
  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
    setInitialEventData(null);
    
    // Termine neu laden
    fetchEvents();
  };

  // Funktion, die auch für die Sidebar verfügbar gemacht wird, um das Popup zu öffnen
  const openEventFormPopup = (event) => {
    if (event && event.id) {
      try {
        // Sichere Erstellung von Date-Objekten mit Fallbacks
        const createSafeDate = (dateValue) => {
          if (!dateValue) return new Date();
          
          try {
            const date = new Date(dateValue);
            // Überprüfe, ob das Datum gültig ist
            if (isNaN(date.getTime())) {
              console.warn('Ungültiges Datum erkannt:', dateValue);
              return new Date(); // Fallback auf aktuelles Datum
            }
            return date;
          } catch (e) {
            console.error('Fehler beim Erstellen des Date-Objekts:', e);
            return new Date(); // Fallback auf aktuelles Datum
          }
        };
        
        setSelectedEvent(event);
        
        // Überprüfe und parse die Datumswerte sicher
        const possibleDateValue = event.datetime || event.start_time || event.date;
        const startTime = createSafeDate(possibleDateValue);
        
        // Für end_time: Verwende entweder das vorhandene Feld oder berechne es basierend auf startTime
        const endTime = event.end_time 
          ? createSafeDate(event.end_time) 
          : addMinutes(startTime, 60); // Standard: 1 Stunde nach Beginn
        
        setInitialEventData({
          id: event.id,
          title: event.title,
          description: event.description || '',
          location: event.location || '',
          start_time: startTime,
          end_time: endTime,
          event_type: event.event_type || 'personal'
        });
        setShowEventForm(true);
      } catch (error) {
        console.error('Fehler beim Öffnen des Popup-Formulars:', error);
        // Trotzdem versuchen, ein Basis-Popup zu öffnen
        setSelectedEvent(event);
        setInitialEventData({
          id: event.id,
          title: event.title,
          description: event.description || '',
          location: event.location || '',
          start_time: new Date(),
          end_time: addMinutes(new Date(), 60),
          event_type: event.event_type || 'personal'
        });
        setShowEventForm(true);
      }
    }
  };

  // Globale Funktionen zuweisen
  useEffect(() => {
    // Nur zuweisen, wenn nicht bereits definiert (vom App.js)
    if (!window.openEventFormPopup) {
      window.openEventFormPopup = openEventFormPopup;
    }
    
    // Globale Funktion zum Aktualisieren der Kalenderereignisse
    window.refreshCalendarEvents = () => {
      fetchEvents();
    };
    
    // Cleanup - nur löschen, wenn es unsere eigene Instanz ist
    return () => {
      if (window.openEventFormPopup === openEventFormPopup) {
        window.openEventFormPopup = null;
      }
      
      // Entferne die Aktualisierungsfunktion
      window.refreshCalendarEvents = null;
    };
  }, []);

  // Wochentagsüberschriften
  const weekDays = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const days = getDaysForMonthView();

  return (
    <div className="h-full bg-[#0a0f1e] text-white relative overflow-hidden">
      {/* Hintergrundelemente */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1a1f3e] to-[#0a0f1e] opacity-80"></div>
      
      {/* Dekorative Elemente */}
      <div className="absolute top-[10%] left-[20%] w-32 h-32 rounded-full bg-[#ff0066] blur-[80px] opacity-20"></div>
      <div className="absolute top-[40%] right-[10%] w-40 h-40 rounded-full bg-[#3399ff] blur-[100px] opacity-20"></div>
      <div className="absolute bottom-[15%] left-[30%] w-36 h-36 rounded-full bg-[#9f7aea] blur-[90px] opacity-20"></div>
      
      <div className="relative z-10 h-full">
        {/* Kalender-Header */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mt-[64px]">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff0066] to-[#3399ff]">
              {format(currentDate, 'MMMM yyyy', { locale: de })}
            </h1>
            <p className="text-gray-400 mt-1">
              {format(startOfMonth(currentDate), 'dd.MM.yyyy')} - {format(endOfMonth(currentDate), 'dd.MM.yyyy')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex rounded-lg overflow-hidden bg-white/5 p-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-md hover:bg-white/10 text-white"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm" 
                className="rounded-md hover:bg-white/10 text-white px-3"
                onClick={goToToday}
              >
                Heute
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-md hover:bg-white/10 text-white"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-[#ff0066] to-[#3399ff] hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#3399ff]/20 text-white"
              onClick={() => handleAddEvent(new Date())}
            >
              <Plus className="h-4 w-4 mr-1" />
              Termin
            </Button>
          </div>
        </div>
        
        {/* Fehlermeldung anzeigen, falls vorhanden */}
        {error && <Alert severity="error" className="mx-4 mb-3">{error}</Alert>}
        
        {/* Kalender-Raster */}
        <div className="flex-1 px-2 pb-4 overflow-auto">
          {/* Wochentagsüberschriften */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className="py-2 text-center text-sm font-medium text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Kalendertage */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const dayEvents = getEventsForDay(day);
              const hasHoliday = dayEvents.some(event => event.isHoliday);
              
              return (
                <div 
                  key={index} 
                  className={`rounded-lg backdrop-blur-sm p-2 relative min-h-[90px] transition-all duration-200 ${
                    isCurrentMonth 
                      ? "bg-white/5 hover:bg-white/10" 
                      : "bg-white/[0.02] hover:bg-white/5"
                  } ${!isCurrentMonth ? "opacity-60" : ""} ${hasHoliday ? "bg-gradient-to-b from-[#9d7fea]/10 to-transparent" : ""}`}
                  onClick={() => handleAddEvent(day)}
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className={`h-7 w-7 flex items-center justify-center text-sm rounded-full ${
                        isCurrentDay 
                          ? "bg-gradient-to-r from-[#ff0066] to-[#3399ff] text-white font-medium" 
                          : hasHoliday ? "text-[#d6bcff]" : ""
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    
                    {dayEvents.length > 0 && (
                      <div className="flex -space-x-1">
                        {dayEvents.slice(0, 2).map((event, i) => (
                          <div 
                            key={i} 
                            className="w-2 h-2 rounded-full border border-[#1a1f3e]" 
                            style={{ 
                              backgroundColor: event.isHoliday 
                                ? '#9d7fea' 
                                : getEventTypeColor(event.event_type) 
                            }}
                          ></div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="w-2 h-2 rounded-full bg-white/30 border border-[#1a1f3e]"></div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Terminliste */}
                  <div className="mt-2 space-y-1">
                    {/* Zuerst Feiertage anzeigen */}
                    {dayEvents
                      .filter(event => event.isHoliday)
                      .map((event, idx) => (
                        <div 
                          key={`holiday-${event.id}-${idx}`}
                          className="p-1 rounded-md text-xs flex items-center border-l-2 border-[#9d7fea]"
                          style={{ 
                            backgroundColor: 'rgba(157, 127, 234, 0.12)',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          <div className="w-1 h-1 rounded-full bg-[#9d7fea] mr-1.5"></div>
                          <div className="font-medium text-white truncate">
                            {event.title}
                          </div>
                        </div>
                      ))
                    }
                    
                    {/* Dann normale Termine anzeigen */}
                    {dayEvents
                      .filter(event => !event.isHoliday)
                      .map((event, idx) => (
                        <div 
                          key={`event-${event.id}-${idx}`}
                          className="p-1 rounded-md text-xs cursor-pointer transition-transform hover:scale-[1.02]"
                          style={{ 
                            backgroundColor: `${getEventTypeColor(event.event_type)}40`, 
                            color: 'white' 
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-[10px] opacity-80">{event.time}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Rendern des EventForm-Popups */}
      {showEventForm && (
        <EventForm
          open={showEventForm}
          onClose={handleCloseEventForm}
          initialData={initialEventData}
          isEdit={!!selectedEvent}
        />
      )}
    </div>
  );
};

export default Calendar;
