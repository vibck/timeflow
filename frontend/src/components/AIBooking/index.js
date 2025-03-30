import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import MedicalBookingForm from './MedicalBookingForm';
import RestaurantBookingForm from './RestaurantBookingForm';
import HairdresserBookingForm from './HairdresserBookingForm';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ContentCutIcon from '@mui/icons-material/ContentCut';

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ mt: 2 }}>
    {value === index && children}
  </Box>
);

const AIBooking = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            fontWeight: 700,
            background: 'linear-gradient(90deg, #1976D2 0%, #5E35B1 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            mb: 1.5
          }}
        >
          KI-gestützte Terminbuchung
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.95rem', sm: '1.1rem' },
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.5,
            fontWeight: 400,
            letterSpacing: '0.01em'
          }}
        >
          Überlassen Sie die Terminkoordination unserer fortschrittlichen KI und sparen Sie wertvolle Zeit.
          Wählen Sie einfach die passende Kategorie und lassen Sie uns den Rest für Sie erledigen.
        </Typography>
      </Box>

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: '4px 4px 0 0'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="Buchungsoptionen"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.85rem',
              fontWeight: 500,
              textTransform: 'none',
              letterSpacing: '0.02em',
              minHeight: '48px',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#1976D2',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976D2',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="Arzttermin" icon={<MedicalServicesIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" />
          <Tab label="Restaurant" icon={<RestaurantIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" />
          <Tab label="Friseur" icon={<ContentCutIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          <MedicalBookingForm />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <RestaurantBookingForm />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <HairdresserBookingForm />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default AIBooking; 