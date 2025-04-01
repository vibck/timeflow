import React, { useState } from 'react';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
  addDays,
  subDays
} from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  useTheme,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Fade,
  LinearProgress
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * @typedef {Object} Event
 * @property {number} id - Die ID des Ereignisses
 * @property {string} name - Der Name des Ereignisses
 * @property {string} time - Die Zeit des Ereignisses als formatierter String
 * @property {string} datetime - Die Zeit des Ereignisses als ISO-String
 */

/**
 * @typedef {Object} CalendarData
 * @property {Date} day - Das Datum
 * @property {Event[]} events - Die Ereignisse für diesen Tag
 */

/**
 * @typedef {Object} FullScreenCalendarProps
 * @property {CalendarData[]} data - Die Kalenderdaten
 * @property {Function} [onAddEvent] - Callback für das Hinzufügen eines neuen Ereignisses
 * @property {Function} [onSelectEvent] - Callback für die Auswahl eines Ereignisses
 * @property {Function} [onSelectDay] - Callback für die Auswahl eines Tages
 */

/**
 * FullScreenCalendar-Komponente
 * @param {FullScreenCalendarProps} props - Die Props für die Komponente
 */
const FullScreenCalendar = ({ data = [], onAddEvent, onSelectEvent, onSelectDay }) => {
  const theme = useTheme();
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(
    format(today, 'MMM-yyyy')
  );
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());
  
  // Kalenderansicht (Monat, Woche, Tag)
  const [calendarView, setCalendarView] = useState('month');
  
  // Lade-Status für Refresh-Animation
  const [isLoading, setIsLoading] = useState(false);
  
  // Finde heutige Termine
  const todayEvents = data.filter(item => isSameDay(item.day, today))
    .flatMap(item => item.events || []);

  // Hilfs-Funktion zum Aktualisieren der Daten
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { locale: de, weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth), { locale: de, weekStartsOn: 1 })
  });

  // Hilfsfunktion für die Bestimmung der Spaltenposition
  const getColStartClass = day => {
    const dayOfWeek = getDay(day);
    // Anpassen der Spalten für Montag als ersten Tag (1 = Montag, 0 = Sonntag)
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return `gridColumn: '${adjustedDay + 1} / ${adjustedDay + 2}'`;
  };

  // Behandle Änderung der Kalenderansicht
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setCalendarView(newView);
    }
  };

  // Navigiere zum vorherigen Zeitraum (abhängig von der Ansicht)
  const previousPeriod = () => {
    if (calendarView === 'month') {
      const firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 });
      setCurrentMonth(format(firstDayPrevMonth, 'MMM-yyyy'));
    } else if (calendarView === 'week') {
      setSelectedDay(subDays(selectedDay, 7));
    } else if (calendarView === 'day') {
      setSelectedDay(subDays(selectedDay, 1));
    }
  };

  // Navigiere zum nächsten Zeitraum (abhängig von der Ansicht)
  const nextPeriod = () => {
    if (calendarView === 'month') {
      const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
      setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    } else if (calendarView === 'week') {
      setSelectedDay(addDays(selectedDay, 7));
    } else if (calendarView === 'day') {
      setSelectedDay(addDays(selectedDay, 1));
    }
  };

  // Gehe zum heutigen Tag
  const goToToday = () => {
    setCurrentMonth(format(today, 'MMM-yyyy'));
    setSelectedDay(today);
  };

  const handleDayClick = day => {
    setSelectedDay(day);
    if (onSelectDay) {
      onSelectDay(day);
    }
  };

  const handleEventClick = event => {
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  const handleAddEvent = () => {
    if (onAddEvent) {
      onAddEvent(selectedDay);
    }
  };

  // Rendere die Tagesansicht
  const renderDayView = () => {
    // Finde Ereignisse für den ausgewählten Tag
    const dayEvents = data.filter(item => isSameDay(item.day, selectedDay));
    const events = dayEvents.length > 0 ? dayEvents[0].events : [];
    
    // Sortiere Ereignisse nach Startzeit
    events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    return (
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(selectedDay, 'EEEE, dd. MMMM yyyy', { locale: de })}
        </Typography>
        
        {events.length > 0 ? (
          <Box>
            {events.map(event => (
              <Box
                key={event.id}
                onClick={() => handleEventClick(event)}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': { 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'action.selected' 
                  },
                  cursor: 'pointer'
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {event.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.time}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Keine Termine für diesen Tag.
          </Typography>
        )}
      </Box>
    );
  };

  // Rendere die Wochenansicht
  const renderWeekView = () => {
    // Berechne Start- und Endtag der Woche
    const startOfSelectedWeek = startOfWeek(selectedDay, { locale: de, weekStartsOn: 1 });
    const endOfSelectedWeek = endOfWeek(selectedDay, { locale: de, weekStartsOn: 1 });
    
    // Hole alle Tage der Woche
    const daysOfWeek = eachDayOfInterval({
      start: startOfSelectedWeek,
      end: endOfSelectedWeek
    });
    
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Wochentage-Header */}
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderLeft: 1,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)'
          }}
        >
          {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map((weekday, index) => (
            <Box 
              key={weekday} 
              sx={{ 
                py: 1.5, 
                textAlign: 'center',
                borderRight: index < 6 ? 1 : 0,
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {format(
                  new Date(2023, 0, index + 2), // 2.1.2023 = Montag, 3.1.2023 = Dienstag, usw.
                  'EEEEEE', 
                  { locale: de }
                )}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Tagesinhalte */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderLeft: 1,
            borderRight: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          {daysOfWeek.map((day, index) => {
            // Finde Ereignisse für diesen Tag
            const dayEvents = data.filter(item => isSameDay(item.day, day));
            const events = dayEvents.length > 0 ? dayEvents[0].events : [];
            
            return (
              <Box 
                key={day.toString()} 
                sx={{ 
                  height: '100%',
                  borderRight: index < 6 ? 1 : 0,
                  borderColor: 'divider',
                  bgcolor: isToday(day) 
                    ? (theme.palette.mode === 'dark' ? 'rgba(30, 136, 229, 0.08)' : 'rgba(30, 136, 229, 0.05)')
                    : 'transparent',
                  p: 1,
                  overflow: 'auto'
                }}
                onClick={() => handleDayClick(day)}
              >
                {events.map(event => (
                  <Box
                    key={event.id}
                    onClick={e => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    sx={{
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: event.originalEvent?.isHoliday 
                        ? (theme.palette.mode === 'dark' ? 'rgba(198, 40, 40, 0.2)' : 'rgba(248, 232, 232, 1)')
                        : (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)'),
                      color: event.originalEvent?.isHoliday
                        ? (theme.palette.mode === 'dark' ? '#ff6e6e' : '#b71c1c')
                        : (theme.palette.mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(21, 101, 192)'),
                      border: 1,
                      borderColor: event.originalEvent?.isHoliday
                        ? (theme.palette.mode === 'dark' ? 'rgba(198, 40, 40, 0.4)' : 'rgba(183, 28, 28, 0.3)')
                        : (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)'),
                      '&:hover': { 
                        bgcolor: event.originalEvent?.isHoliday
                          ? (theme.palette.mode === 'dark' ? 'rgba(198, 40, 40, 0.3)' : 'rgba(248, 232, 232, 0.9)')
                          : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'action.selected') 
                      },
                      cursor: 'pointer'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      fontWeight={event.originalEvent?.isHoliday ? 600 : "medium"}
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'
                      }}
                    >
                      {event.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      display="block" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {event.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // Rendere die Monatsansicht
  const renderMonthView = () => {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Wochentage-Header */}
        <Grid 
          container 
          spacing={0}
          sx={{ 
            borderBottom: 1, 
            borderLeft: 1,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(25, 118, 210, 0.04)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)'
          }}
        >
          {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map((weekday, index) => (
            <Box 
              key={weekday} 
              sx={{ 
                py: 1.5, 
                textAlign: 'center',
                borderRight: index < 6 ? 1 : 0,
                borderColor: 'divider'
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px'
                }}
              >
                {format(
                  new Date(2023, 0, index + 2), // 2.1.2023 = Montag, 3.1.2023 = Dienstag, usw.
                  'EEEEEE', 
                  { locale: de }
                )}
              </Typography>
            </Box>
          ))}
        </Grid>

        {/* Kalendertage */}
        <Box 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}
        >
          {/* Desktop-Ansicht */}
          <Box 
            sx={{ 
              display: { xs: 'none', md: 'grid' }, 
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridAutoRows: 'minmax(90px, 1fr)',
              height: 'auto',
              minHeight: '100%',
              borderLeft: 1,
              borderColor: 'divider'
            }}
          >
            {days.map(day => {
              // Finde Ereignisse für diesen Tag
              const dayEvents = data.filter(item => isSameDay(item.day, day));
              const events = dayEvents.length > 0 ? dayEvents[0].events : [];
              
              // Bestimme die Spaltenposition für den ersten Tag des Monats
              const gridColumnStyle = day === 0 ? { sx: { [getColStartClass(day)]: true } } : {};

              return (
                <Box
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  sx={{
                    position: 'relative',
                    borderBottom: 1,
                    borderRight: 1,
                    borderColor: 'divider',
                    bgcolor: !isSameMonth(day, firstDayCurrentMonth) 
                      ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)') 
                      : isToday(day)
                        ? (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.05)')
                        : 'background.paper',
                    '&:hover': { 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.08)' 
                        : 'rgba(0, 0, 0, 0.04)',
                      transition: 'background-color 0.2s'
                    },
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    ...gridColumnStyle.sx
                  }}
                >
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: isEqual(day, selectedDay) 
                          ? 'primary.main' 
                          : isToday(day) 
                            ? 'primary.light' 
                            : 'transparent',
                        color: isEqual(day, selectedDay)
                          ? 'primary.contrastText'
                          : isToday(day)
                            ? theme.palette.mode === 'dark' ? 'white' : 'primary.dark'
                            : !isSameMonth(day, firstDayCurrentMonth) 
                              ? 'text.disabled' 
                              : 'text.primary',
                        fontWeight: isEqual(day, selectedDay) || isToday(day) ? 700 : 400,
                        boxShadow: isEqual(day, selectedDay) ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Typography variant="body2">
                        {format(day, 'd')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 1, overflow: 'hidden', maxHeight: 'calc(100% - 40px)' }}>
                    {events.slice(0, 3).map((event, idx) => (
                      <Box
                        key={event.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        sx={{
                          p: 1,
                          mb: 0.5,
                          borderRadius: '6px',
                          bgcolor: event.originalEvent?.isHoliday 
                            ? (theme.palette.mode === 'dark' ? 'rgba(198, 40, 40, 0.2)' : 'rgba(248, 232, 232, 1)')
                            : (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)'),
                          color: event.originalEvent?.isHoliday
                            ? (theme.palette.mode === 'dark' ? '#ff6e6e' : '#b71c1c')
                            : (theme.palette.mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(21, 101, 192)'),
                          border: 1,
                          borderColor: event.originalEvent?.isHoliday
                            ? (theme.palette.mode === 'dark' ? 'rgba(198, 40, 40, 0.4)' : 'rgba(183, 28, 28, 0.3)')
                            : (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)'),
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          '&:hover': { 
                            filter: 'brightness(1.1)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          },
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          fontWeight={event.originalEvent?.isHoliday ? 600 : "medium"}
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {event.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          display="block" 
                          sx={{
                            opacity: 0.8,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {event.time}
                        </Typography>
                      </Box>
                    ))}
                    {events.length > 3 && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'primary.main',
                          display: 'block',
                          textAlign: 'center',
                          fontWeight: 600
                        }}
                      >
                        + {events.length - 3} weitere
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Mobile-Ansicht */}
          <Grid 
            container 
            sx={{ 
              display: { xs: 'grid', md: 'none' }, 
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridAutoRows: '60px',
              height: 'auto',
              minHeight: '100%',
              borderLeft: 1,
              borderColor: 'divider'
            }}
          >
            {days.map(day => {
              // Finde Ereignisse für diesen Tag
              const dayEvents = data.filter(item => isSameDay(item.day, day));
              const events = dayEvents.length > 0 ? dayEvents[0].events : [];

              return (
                <Box
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  sx={{
                    borderBottom: 1,
                    borderRight: 1,
                    borderColor: 'divider',
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    bgcolor: !isSameMonth(day, firstDayCurrentMonth) 
                      ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)') 
                      : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer'
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      ml: 'auto',
                      bgcolor: isEqual(day, selectedDay) 
                        ? 'primary.main' 
                        : isToday(day) 
                          ? 'primary.light' 
                          : 'transparent',
                      color: isEqual(day, selectedDay) || isToday(day) 
                        ? 'primary.contrastText' 
                        : !isSameMonth(day, firstDayCurrentMonth) 
                          ? 'text.disabled' 
                          : 'text.primary',
                      fontWeight: isEqual(day, selectedDay) || isToday(day) ? 'bold' : 'normal'
                    }}
                  >
                    <Typography variant="caption">
                      {format(day, 'd')}
                    </Typography>
                  </Box>

                  {events.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', mt: 'auto' }}>
                      {events.map(event => (
                        <Box
                          key={event.id}
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'text.secondary',
                            mx: 0.25,
                            mt: 0.5
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Grid>
        </Box>
      </Box>
    );
  };

  // Rendere die aktuelle Ansicht basierend auf calendarView
  const renderCalendarView = () => {
    switch (calendarView) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
      default:
        return renderMonthView();
    }
  };

  // Bestimme den Titel basierend auf der aktuellen Ansicht
  const getViewTitle = () => {
    if (calendarView === 'month') {
      return (
        <Box>
          <Typography 
            variant="h5" 
            sx={{
              fontWeight: 600,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #90CAF9 0%, #1976D2 100%)' 
                : 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: de })}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8, letterSpacing: '0.25px' }}>
            {format(firstDayCurrentMonth, 'dd.MM.yyyy', { locale: de })} - {format(endOfMonth(firstDayCurrentMonth), 'dd.MM.yyyy', { locale: de })}
          </Typography>
        </Box>
      );
    } else if (calendarView === 'week') {
      const startOfSelectedWeek = startOfWeek(selectedDay, { locale: de });
      const endOfSelectedWeek = endOfWeek(selectedDay, { locale: de });
      return (
        <Box>
          <Typography 
            variant="h5" 
            sx={{
              fontWeight: 600,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #90CAF9 0%, #1976D2 100%)' 
                : 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            KW {format(selectedDay, 'w', { locale: de })}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8, letterSpacing: '0.25px' }}>
            {format(startOfSelectedWeek, 'dd.MM.yyyy', { locale: de })} - {format(endOfSelectedWeek, 'dd.MM.yyyy', { locale: de })}
          </Typography>
        </Box>
      );
    } else if (calendarView === 'day') {
      return (
        <Box>
          <Typography 
            variant="h5" 
            sx={{
              fontWeight: 600,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #90CAF9 0%, #1976D2 100%)' 
                : 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            {format(selectedDay, 'EEEE', { locale: de })}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8, letterSpacing: '0.25px' }}>
            {format(selectedDay, 'dd.MM.yyyy', { locale: de })}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        overflow: 'hidden',
        borderRadius: 0,
        border: 'none',
        bgcolor: 'transparent'
      }}
    >
      {/* Kalender-Header */}
      <Box 
        sx={{ 
          p: { xs: 1, md: 2 },
          pb: { xs: 1, md: 1.5 },
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(180deg, rgba(30, 40, 50, 0.6) 0%, rgba(20, 30, 40, 0.4) 100%)' 
            : 'linear-gradient(180deg, rgba(240, 245, 250, 0.8) 0%, rgba(250, 252, 255, 0.4) 100%)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(8px)',
          height: 'auto',
          minHeight: { xs: '80px', md: '60px' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            p: 0.5, 
            mr: 1, 
            display: 'flex', 
            borderRadius: '50%', 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
            color: 'primary.main'
          }}>
            <EventIcon />
          </Box>
          {getViewTitle()}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: 'center', 
          gap: 1,
          width: { xs: '100%', md: 'auto' },
          mt: { xs: 1, md: 0 }
        }}>
          {todayEvents.length > 0 && (
            <Fade in={true} timeout={800}>
              <Chip 
                icon={<TodayIcon fontSize="small" />}
                label={`${todayEvents.length} Termine heute`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: '16px',
                  height: '28px',
                  mr: { xs: 0, md: 1 },
                  mb: { xs: 1, sm: 0 },
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  width: { xs: '100%', sm: 'auto' }
                }}
              />
            </Fade>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <ToggleButtonGroup
              value={calendarView}
              exclusive
              onChange={handleViewChange}
              aria-label="Kalenderansicht"
              size="small"
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  px: 1.5
                },
                '& .MuiToggleButton-root.Mui-selected': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              <ToggleButton value="month" aria-label="Monatsansicht">
                <Tooltip title="Monatsansicht">
                  <CalendarViewMonthIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="week" aria-label="Wochenansicht">
                <Tooltip title="Wochenansicht">
                  <ViewWeekIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="day" aria-label="Tagesansicht">
                <Tooltip title="Tagesansicht">
                  <ViewDayIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ 
              display: 'flex', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              flex: { xs: 1, sm: 'none' }
            }}>
              <IconButton 
                onClick={previousPeriod} 
                size="small" 
                sx={{ 
                  borderRadius: 0,
                  height: '32px',
                  width: '32px'
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Button 
                onClick={goToToday} 
                size="small" 
                sx={{ 
                  borderRadius: 0, 
                  borderLeft: 1, 
                  borderRight: 1, 
                  borderColor: 'divider', 
                  py: 0.5,
                  px: { xs: 2, md: 1.5 },
                  minWidth: { xs: 0, md: '80px' },
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  flex: { xs: 1, sm: 'none' }
                }}
                startIcon={<TodayIcon fontSize="small" />}
              >
                Heute
              </Button>
              <IconButton 
                onClick={nextPeriod} 
                size="small" 
                sx={{ 
                  borderRadius: 0,
                  height: '32px',
                  width: '32px'
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleAddEvent}
                sx={{
                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  height: '32px',
                  flex: { xs: 1, sm: 'none' }
                }}
                size="small"
              >
                Termin
              </Button>
              
              {/* Refresh-Button, der handleRefresh verwendet */}
              <IconButton
                onClick={handleRefresh}
                size="small"
                sx={{
                  height: '32px',
                  width: '32px',
                  ml: 0.5
                }}
                aria-label="Kalender aktualisieren"
              >
                <Tooltip title="Aktualisieren">
                  <RefreshIcon fontSize="small" />
                </Tooltip>
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Loading-Anzeige */}
      {isLoading && (
        <LinearProgress sx={{ height: '2px' }} />
      )}

      {/* Kalender-Raster */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100% - 60px)',
        overflow: 'hidden' 
      }}>
        {renderCalendarView()}
      </Box>
    </Paper>
  );
};

export default FullScreenCalendar; 