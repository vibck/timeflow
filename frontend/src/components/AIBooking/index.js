import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography,
  Container
} from '@mui/material';
import MedicalBookingForm from './MedicalBookingForm';
import RestaurantBookingForm from './RestaurantBookingForm';
import HairdresserBookingForm from './HairdresserBookingForm';

const TabPanel = props => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AIBooking = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          KI-gestützte Terminbuchung
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Lassen Sie unsere KI für Sie Termine vereinbaren. Wählen Sie einfach den gewünschten Buchungstyp und füllen Sie das Formular aus.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="Buchungsoptionen"
          >
            <Tab label="Arzttermin" />
            <Tab label="Restaurant" />
            <Tab label="Friseur" />
          </Tabs>
        </Box>

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
    </Container>
  );
};

export default AIBooking; 