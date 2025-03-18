import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider 
} from '@mui/material';
import { 
  Event as EventIcon,
  SmartToy as SmartToyIcon,
  RestaurantMenu as RestaurantIcon,
  MedicalServices as MedicalIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Dashboard = () => {
  // Beispiel für anstehende Termine
  const upcomingAppointments = [
    { id: 1, type: 'medical', title: 'Zahnarzt Dr. Müller', date: '15. Juni 2023', time: '14:30' },
    { id: 2, type: 'restaurant', title: 'Reservierung Restaurant Olive', date: '18. Juni 2023', time: '19:00' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* KI-Buchung Karte */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SmartToyIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  KI-Buchungsassistent
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                Lassen Sie unsere KI Ihre Termine vereinbaren. Wählen Sie einfach die Art des Termins aus und geben Sie Ihre Präferenzen an.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <MedicalIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2">Arzttermine</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <RestaurantIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">Restaurantreservierungen</Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button
                component={RouterLink}
                to="/ai-booking"
                size="small"
                color="primary"
                startIcon={<AddIcon />}
              >
                Neuer Termin
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Anstehende Termine */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" component="h2">
                Anstehende Termine
              </Typography>
            </Box>
            {upcomingAppointments.length > 0 ? (
              <List sx={{ width: '100%' }}>
                {upcomingAppointments.map((appointment, index) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        {appointment.type === 'medical' ? 
                          <MedicalIcon color="info" /> : 
                          <RestaurantIcon color="success" />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={appointment.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {appointment.date}
                            </Typography>
                            {` — ${appointment.time} Uhr`}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < upcomingAppointments.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Keine anstehenden Termine vorhanden.
              </Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                component={RouterLink}
                to="/calendar" 
                color="primary"
              >
                Alle Termine ansehen
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 