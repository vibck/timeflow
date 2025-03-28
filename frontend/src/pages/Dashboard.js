import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Chip,
  Button,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Healing as HealingIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import api from '../utils/api';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [healthIntervals, setHealthIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Lade anstehende Erinnerungen
        const remindersResponse = await api.get('/api/reminders');
        
        // Filtere Erinnerungen, die in der Zukunft liegen und noch nicht gesendet wurden
        const futureReminders = remindersResponse.data
          .filter(reminder => !reminder.is_sent && DateTime.fromISO(reminder.reminder_time).toMillis() > DateTime.now().toMillis())
          .sort((a, b) => DateTime.fromISO(a.reminder_time).toMillis() - DateTime.fromISO(b.reminder_time).toMillis());
        
        // Lade Details zu den zugehörigen Terminen
        const remindersWithEvents = await Promise.all(
          futureReminders.map(async reminder => {
            try {
              const eventResponse = await api.get(`/api/events/${reminder.event_id}`);
              return {
                ...reminder,
                event: eventResponse.data
              };
            } catch (err) {
              console.error(`Fehler beim Laden des Termins für Erinnerung ${reminder.id}:`, err);
              return {
                ...reminder,
                event: { title: 'Unbekannter Termin' }
              };
            }
          })
        );
        
        setUpcomingReminders(remindersWithEvents.slice(0, 5)); // Zeige maximal 5 an
        
        // Lade anstehende Termine (für die nächsten 7 Tage)
        const now = DateTime.now();
        const _nextWeek = now.plus({ days: 7 });
        
        const eventsResponse = await api.get('/api/events');
        const upcomingEvents = eventsResponse.data.data ? eventsResponse.data.data.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= new Date();
        }) : [];
        
        setUpcomingEvents(upcomingEvents.slice(0, 5)); // Zeige maximal 5 an

        // Lade Gesundheitsintervalle
        const healthIntervalsResponse = await api.get('/api/health-intervals');
        
        // Sortiere nach dem nächsten empfohlenen Termin
        const sortedHealthIntervals = healthIntervalsResponse.data
          .sort((a, b) => DateTime.fromISO(a.next_suggested_date).toMillis() - DateTime.fromISO(b.next_suggested_date).toMillis());
        
        setHealthIntervals(sortedHealthIntervals.slice(0, 5)); // Zeige nur die nächsten 5 an
        
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Dashboard-Daten:', err);
        setError('Fehler beim Laden der Dashboard-Daten. Bitte versuche es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Formatiere Datum für die Anzeige (ohne Uhrzeit)
  const formatDate = date => {
    return DateTime.fromISO(date).toFormat('dd.MM.yyyy');
  };

  // Formatiere Datum und Uhrzeit für die Anzeige
  const formatDateTime = dateTime => {
    const date = DateTime.fromISO(dateTime);
    return date.toFormat('dd.MM.yyyy HH:mm');
  };
  
  // Berechne den relativen Zeitpunkt für die Anzeige
  const getRelativeTime = dateTime => {
    return DateTime.fromISO(dateTime).toRelative();
  };
  
  // Bestimme die Farbe basierend auf der Dringlichkeit
  const getReminderColor = reminderTime => {
    const hours = DateTime.fromISO(reminderTime).diffNow('hour').hours;
    
    if (hours < 1) return 'error';
    if (hours < 24) return 'warning';
    return 'info';
  };
  
  // Bestimme die Farbe basierend auf dem Termintyp
  const getEventTypeColor = eventType => {
    switch (eventType) {
      case 'work': return 'primary';
      case 'health': return 'success';
      case 'personal': return 'secondary';
      default: return 'default';
    }
  };
  
  // Übersetze den Termintyp
  const translateEventType = eventType => {
    switch (eventType) {
      case 'work': return 'Arbeit';
      case 'health': return 'Gesundheit';
      case 'personal': return 'Persönlich';
      default: return 'Sonstiges';
    }
  };

  // Berechne den Status eines Gesundheitsintervalls
  const getHealthIntervalStatus = nextDate => {
    const now = DateTime.now();
    const next = DateTime.fromISO(nextDate);
    const diffDays = next.diff(now, 'day').days;
    
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
        <Typography variant="h4">Dashboard</Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Anstehende Erinnerungen */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%', 
                border: 1, 
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Anstehende Erinnerungen</Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/calendar')}
                  startIcon={<EventIcon />}
                >
                  Zum Kalender
                </Button>
              </Box>
              
              {upcomingReminders.length > 0 ? (
                <List sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  {upcomingReminders.map((reminder, index) => (
                    <React.Fragment key={reminder.id}>
                      {index > 0 && <Divider />}
                      <ListItem 
                        component="div"
                        onClick={() => navigate(`/events/${reminder.event_id}`)}
                        sx={{ 
                          py: 1.5, 
                          cursor: 'pointer',
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <TimeIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={reminder.event.title}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                Erinnerung: {formatDateTime(reminder.reminder_time)}
                              </Typography>
                              <br />
                              <Typography variant="body2" component="span">
                                Termin: {formatDateTime(reminder.event.start_time)}
                              </Typography>
                            </>
                          }
                        />
                        <Chip 
                          label={getRelativeTime(reminder.reminder_time)} 
                          color={getReminderColor(reminder.reminder_time)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Keine anstehenden Erinnerungen.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Anstehende Termine */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%', 
                border: 1, 
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Anstehende Termine</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => navigate('/events/new')}
                  startIcon={<AddIcon />}
                >
                  Neuer Termin
                </Button>
              </Box>
              
              {upcomingEvents.length > 0 ? (
                <List sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  {upcomingEvents.map((event, index) => (
                    <React.Fragment key={event.id}>
                      {index > 0 && <Divider />}
                      <ListItem 
                        component="div"
                        onClick={() => navigate(`/events/${event.id}`)}
                        sx={{ 
                          py: 1.5, 
                          cursor: 'pointer',
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <EventIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {formatDateTime(event.start_time)}
                              </Typography>
                              {event.location && (
                                <>
                                  <br />
                                  <Typography variant="body2" component="span">
                                    Ort: {event.location}
                                  </Typography>
                                </>
                              )}
                            </>
                          }
                        />
                        <Chip 
                          label={translateEventType(event.event_type)} 
                          color={getEventTypeColor(event.event_type)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Keine anstehenden Termine in den nächsten 7 Tagen.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Gesundheitsintervalle */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                border: 1, 
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HealingIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Gesundheitsintervalle</Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/health-intervals')}
                >
                  Alle anzeigen
                </Button>
              </Box>
              
              {healthIntervals.length > 0 ? (
                <List sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  {healthIntervals.map((interval, index) => (
                    <React.Fragment key={interval.id}>
                      {index > 0 && <Divider />}
                      <ListItem 
                        component="div"
                        onClick={() => navigate('/health-intervals')}
                        sx={{ 
                          py: 1.5, 
                          cursor: 'pointer',
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <HealingIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={interval.interval_type}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                Letzter Termin: {formatDate(interval.last_appointment)}
                              </Typography>
                              <br />
                              <Typography variant="body2" component="span">
                                Nächster Termin: {formatDate(interval.next_appointment)}
                              </Typography>
                            </>
                          }
                        />
                        <Chip 
                          label={getHealthIntervalStatus(interval.next_appointment).text} 
                          color={getHealthIntervalStatus(interval.next_appointment).color}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Keine Gesundheitsintervalle definiert.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
