import React from 'react';
import { Typography, Box } from '@mui/material';
import CalendarView from '../components/Calendar/CalendarView';

const Calendar = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Kalender</Typography>
      <CalendarView />
    </Box>
  );
};

export default Calendar;
