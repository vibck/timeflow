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
  subDays,
} from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  CalendarViewMonth as CalendarViewMonthIcon
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
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  // Kalenderansicht (Monat, Woche, Tag)
  const [calendarView, setCalendarView] = useState('month');

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { locale: de }),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth), { locale: de }),
  });

  // Hilfsfunktion für die Bestimmung der Spaltenposition
  const getColStartClass = (day) => {
    const dayOfWeek = getDay(day);
    const colStartClasses = [
      "", // Sonntag (0) - keine Verschiebung
      "gridColumn: '2 / 3'", // Montag (1)
      "gridColumn: '3 / 4'", // Dienstag (2)
      "gridColumn: '4 / 5'", // Mittwoch (3)
      "gridColumn: '5 / 6'", // Donnerstag (4)
      "gridColumn: '6 / 7'", // Freitag (5)
      "gridColumn: '7 / 8'", // Samstag (6)
    ];
    return colStartClasses[dayOfWeek];
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

  const handleDayClick = (day) => {
    setSelectedDay(day);
    if (onSelectDay) {
      onSelectDay(day);
    }
  };

  const handleEventClick = (event) => {
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
    const startOfSelectedWeek = startOfWeek(selectedDay, { locale: de });
    const endOfSelectedWeek = endOfWeek(selectedDay, { locale: de });
    
    // Hole alle Tage der Woche
    const daysOfWeek = eachDayOfInterval({
      start: startOfSelectedWeek,
      end: endOfSelectedWeek
    });
    
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Wochentage-Header */}
        <Grid 
          container 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          {daysOfWeek.map((day, index) => (
            <Grid 
              item 
              xs 
              key={day.toString()} 
              sx={{ 
                py: 1.5, 
                textAlign: 'center',
                borderRight: index < 6 ? 1 : 0,
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {format(day, 'EEE', { locale: de })}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: isToday(day) ? 'bold' : 'normal',
                  color: isToday(day) ? 'primary.main' : 'text.primary'
                }}
              >
                {format(day, 'd')}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {/* Tagesinhalte */}
        <Grid container sx={{ flex: 1, overflow: 'auto' }}>
          {daysOfWeek.map((day, index) => {
            // Finde Ereignisse für diesen Tag
            const dayEvents = data.filter(item => isSameDay(item.day, day));
            const events = dayEvents.length > 0 ? dayEvents[0].events : [];
            
            return (
              <Grid 
                item 
                xs 
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    sx={{
                      p: 1,
                      mb: 1,
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
                    <Typography 
                      variant="caption" 
                      fontWeight="medium"
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
              </Grid>
            );
          })}
        </Grid>
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
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day, index) => (
            <Grid 
              item 
              xs 
              key={day} 
              sx={{ 
                py: 1.5, 
                textAlign: 'center',
                borderRight: index < 6 ? 1 : 0,
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" fontWeight="medium">{day}</Typography>
            </Grid>
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
            {days.map((day, dayIdx) => {
              // Finde Ereignisse für diesen Tag
              const dayEvents = data.filter(item => isSameDay(item.day, day));
              const events = dayEvents.length > 0 ? dayEvents[0].events : [];
              
              // Bestimme die Spaltenposition für den ersten Tag des Monats
              const gridColumnStyle = dayIdx === 0 ? { sx: { [getColStartClass(day)]: true } } : {};

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
                      ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)') 
                      : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer',
                    ...gridColumnStyle.sx
                  }}
                >
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
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
                      <Typography variant="body2">
                        {format(day, 'd')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 1, overflow: 'hidden', maxHeight: 'calc(100% - 40px)' }}>
                    {events.slice(0, 1).map(event => (
                      <Box
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        sx={{
                          p: 1,
                          mb: 0.5,
                          borderRadius: 1,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
                          border: 1,
                          borderColor: 'divider',
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'action.selected' 
                          },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          fontWeight="medium"
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
                    {events.length > 1 && (
                      <Typography variant="caption" color="text.secondary">
                        + {events.length - 1} weitere
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
            {days.map((day, dayIdx) => {
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
          <Typography variant="h5" fontWeight="medium">
            {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: de })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(firstDayCurrentMonth, 'dd.MM.yyyy', { locale: de })} - {format(endOfMonth(firstDayCurrentMonth), 'dd.MM.yyyy', { locale: de })}
          </Typography>
        </Box>
      );
    } else if (calendarView === 'week') {
      const startOfSelectedWeek = startOfWeek(selectedDay, { locale: de });
      const endOfSelectedWeek = endOfWeek(selectedDay, { locale: de });
      return (
        <Box>
          <Typography variant="h5" fontWeight="medium">
            KW {format(selectedDay, 'w', { locale: de })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(startOfSelectedWeek, 'dd.MM.yyyy', { locale: de })} - {format(endOfSelectedWeek, 'dd.MM.yyyy', { locale: de })}
          </Typography>
        </Box>
      );
    } else if (calendarView === 'day') {
      return (
        <Box>
          <Typography variant="h5" fontWeight="medium">
            {format(selectedDay, 'EEEE', { locale: de })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
        border: 'none'
      }}
    >
      {/* Kalender-Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            flexDirection: 'column', 
            alignItems: 'center', 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1, 
            width: 80, 
            bgcolor: 'action.hover' 
          }}>
            <Typography variant="caption" sx={{ p: 0.5, textTransform: 'uppercase', color: 'text.secondary' }}>
              {format(today, 'MMM', { locale: de })}
            </Typography>
            <Box sx={{ 
              width: '100%', 
              bgcolor: 'background.paper', 
              borderRadius: 1, 
              p: 0.5, 
              display: 'flex', 
              justifyContent: 'center' 
            }}>
              <Typography variant="h5" fontWeight="bold">
                {format(today, 'd')}
              </Typography>
            </Box>
          </Box>
          {getViewTitle()}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={calendarView}
            exclusive
            onChange={handleViewChange}
            aria-label="Kalenderansicht"
            size="small"
            sx={{ display: { xs: 'none', md: 'flex' } }}
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

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Divider orientation="horizontal" sx={{ width: '100%', display: { xs: 'block', md: 'none' } }} />

          <Box sx={{ display: 'flex', boxShadow: 1, borderRadius: 1, overflow: 'hidden' }}>
            <IconButton onClick={previousPeriod} sx={{ borderRadius: 0 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Button onClick={goToToday} sx={{ borderRadius: 0, borderLeft: 1, borderRight: 1, borderColor: 'divider' }}>
              Heute
            </Button>
            <IconButton onClick={nextPeriod} sx={{ borderRadius: 0 }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Divider orientation="horizontal" sx={{ width: '100%', display: { xs: 'block', md: 'none' } }} />

          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddEvent}
            fullWidth={!isDesktop}
          >
            Neuer Termin
          </Button>
        </Box>
      </Box>

      {/* Kalender-Raster */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderCalendarView()}
      </Box>
    </Paper>
  );
};

export default FullScreenCalendar; 