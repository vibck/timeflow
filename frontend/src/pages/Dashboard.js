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
  useTheme,
  Container,
  Avatar,
  IconButton,
  LinearProgress,
  CardContent
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Healing as HealingIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  NavigateNext as NavigateNextIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { motion } from 'framer-motion';
import api from '../utils/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

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

  // Berechne den Fortschritt zwischen letztem und nächstem Termin
  const calculateProgress = (lastDate, nextDate) => {
    const last = DateTime.fromISO(lastDate);
    const next = DateTime.fromISO(nextDate);
    const now = DateTime.now();
    
    const totalDays = next.diff(last, 'days').days;
    const passedDays = now.diff(last, 'days').days;
    
    return Math.min(100, Math.max(0, (passedDays / totalDays) * 100));
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Dashboard Header */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #1976D2 0%, #5E35B1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}
          >
            Willkommen zurück
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Hier findest du eine Übersicht deiner anstehenden Termine und Erinnerungen
          </Typography>
        </Box>
        
        <Box sx={{ mt: { xs: 2, sm: 0 }, display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/new')}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Neuer Termin
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => navigate('/calendar')}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Zum Kalender
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: '10px'
          }}
        >
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 5
        }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Daten werden geladen...
          </Typography>
        </Box>
      ) : (
        <Box 
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0288d1 0%, #26c6da 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                        Anstehende Termine
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {upcomingEvents.length}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 48,
                        height: 48
                      }}
                    >
                      <EventIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1.5, mb: 0.5, opacity: 0.8 }}>
                    Nächster Termin
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {upcomingEvents.length > 0 
                      ? upcomingEvents[0].title 
                      : 'Keine anstehenden Termine'}
                  </Typography>
                  {upcomingEvents.length > 0 && (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {formatDateTime(upcomingEvents[0].start_time)}
                    </Typography>
                  )}
                  <Box sx={{ mt: 'auto', pt: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/calendar')}
                      endIcon={<NavigateNextIcon />}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                    >
                      Alle Termine anzeigen
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                        Erinnerungen
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {upcomingReminders.length}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 48,
                        height: 48
                      }}
                    >
                      <NotificationsIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1.5, mb: 0.5, opacity: 0.8 }}>
                    Nächste Erinnerung
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {upcomingReminders.length > 0 
                      ? upcomingReminders[0].event.title 
                      : 'Keine anstehenden Erinnerungen'}
                  </Typography>
                  {upcomingReminders.length > 0 && (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {formatDateTime(upcomingReminders[0].reminder_time)}
                    </Typography>
                  )}
                  <Box sx={{ mt: 'auto', pt: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/calendar')}
                      endIcon={<NavigateNextIcon />}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                    >
                      Alle Erinnerungen
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #43a047 0%, #8bc34a 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                        Gesundheitsintervalle
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {healthIntervals.length}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 48,
                        height: 48
                      }}
                    >
                      <HealingIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1.5, mb: 0.5, opacity: 0.8 }}>
                    Nächster Check-up
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {healthIntervals.length > 0 
                      ? healthIntervals[0].interval_type 
                      : 'Keine Gesundheitschecks geplant'}
                  </Typography>
                  {healthIntervals.length > 0 && (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {formatDate(healthIntervals[0].next_appointment)}
                    </Typography>
                  )}
                  <Box sx={{ mt: 'auto', pt: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/health-intervals')}
                      endIcon={<NavigateNextIcon />}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                    >
                      Alle Gesundheitsintervalle
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

          {/* Main sections */}
          <Grid container spacing={3}>
            {/* Anstehende Termine */}
            <Grid item xs={12} md={7}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon 
                        color="primary" 
                        sx={{ 
                          mr: 1.5,
                          p: 0.5,
                          borderRadius: '8px',
                          bgcolor: 'primary.light',
                          color: 'primary.dark'
                        }} 
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Anstehende Termine
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box>
                    {upcomingEvents.length > 0 ? (
                      <List disablePadding>
                        {upcomingEvents.map((event, index) => (
                          <React.Fragment key={event.id}>
                            {index > 0 && <Divider variant="inset" component="li" />}
                            <ListItem 
                              component="div"
                              onClick={() => navigate(`/events/${event.id}`)}
                              sx={{ 
                                py: 2,
                                px: 3,
                                cursor: 'pointer',
                                '&:hover': { 
                                  bgcolor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.05)' 
                                    : 'rgba(0, 0, 0, 0.03)'
                                }
                              }}
                            >
                              <ListItemIcon>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: `${getEventTypeColor(event.event_type)}.light`,
                                    color: `${getEventTypeColor(event.event_type)}.dark`
                                  }}
                                >
                                  <EventIcon />
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" component="div">
                                    {event.title}
                                  </Typography>
                                }
                                secondary={
                                  <Typography component="div">
                                    <Typography variant="body2" component="div">
                                      {formatDateTime(event.start_time)}
                                    </Typography>
                                    {event.location && (
                                      <Typography 
                                        variant="body2" 
                                        component="div"
                                        sx={{ 
                                          display: 'block',
                                          color: 'text.secondary'
                                        }}
                                      >
                                        Ort: {event.location}
                                      </Typography>
                                    )}
                                  </Typography>
                                }
                              />
                              <Chip 
                                label={translateEventType(event.event_type)} 
                                color={getEventTypeColor(event.event_type)}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  borderRadius: '6px'
                                }}
                              />
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box
                        sx={{
                          p: 4,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          Keine anstehenden Termine in den nächsten 7 Tagen.
                        </Typography>
                        <Button
                          variant="outlined"
                          sx={{ mt: 2, borderRadius: '8px', textTransform: 'none' }}
                          onClick={() => navigate('/events/new')}
                          startIcon={<AddIcon />}
                        >
                          Termin hinzufügen
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Health Intervals */}
            <Grid item xs={12} md={5}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HealingIcon 
                        color="success" 
                        sx={{ 
                          mr: 1.5,
                          p: 0.5,
                          borderRadius: '8px',
                          bgcolor: 'success.light',
                          color: 'success.dark'
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Gesundheitsintervalle
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/health-intervals')}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none'
                      }}
                    >
                      Alle anzeigen
                    </Button>
                  </Box>

                  <Box>
                    {healthIntervals.length > 0 ? (
                      <List disablePadding>
                        {healthIntervals.map((interval, index) => (
                          <React.Fragment key={interval.id}>
                            {index > 0 && <Divider variant="inset" component="li" />}
                            <ListItem 
                              component="div"
                              onClick={() => navigate('/health-intervals')}
                              sx={{ 
                                py: 2,
                                px: 3,
                                cursor: 'pointer',
                                '&:hover': { 
                                  bgcolor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.05)' 
                                    : 'rgba(0, 0, 0, 0.03)'
                                }
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {interval.interval_type}
                                  </Typography>
                                }
                                secondary={
                                  <Typography component="div">
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                      <Typography variant="body2" component="div">
                                        Letzter Termin: {formatDate(interval.last_appointment)}
                                      </Typography>
                                      <Typography variant="body2" component="div">
                                        Nächster: {formatDate(interval.next_appointment)}
                                      </Typography>
                                    </Box>
                                    <LinearProgress 
                                      variant="determinate"
                                      value={calculateProgress(interval.last_appointment, interval.next_appointment)}
                                      sx={{ 
                                        height: 6, 
                                        borderRadius: 3,
                                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 3,
                                          bgcolor: getHealthIntervalStatus(interval.next_appointment).color + '.main'
                                        }
                                      }}
                                    />
                                  </Typography>
                                }
                              />
                              <Chip 
                                label={getHealthIntervalStatus(interval.next_appointment).text} 
                                color={getHealthIntervalStatus(interval.next_appointment).color}
                                size="small"
                                sx={{ 
                                  ml: 1,
                                  fontWeight: 500,
                                  borderRadius: '6px'
                                }}
                              />
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box
                        sx={{
                          p: 4,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          Keine Gesundheitsintervalle definiert.
                        </Typography>
                        <Button
                          variant="outlined"
                          sx={{ mt: 2, borderRadius: '8px', textTransform: 'none' }}
                          onClick={() => navigate('/health-intervals')}
                        >
                          Gesundheitsintervalle einrichten
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
