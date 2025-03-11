import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <Typography variant="h1" gutterBottom>404</Typography>
      <Typography variant="h4" gutterBottom>Seite nicht gefunden</Typography>
      <Typography variant="body1" gutterBottom>
        Die angeforderte Seite existiert nicht.
      </Typography>
      <Button component={Link} to="/" variant="contained" color="primary" sx={{ mt: 2 }}>
        Zurück zur Startseite
      </Button>
    </Box>
  );
};

export default NotFound;
