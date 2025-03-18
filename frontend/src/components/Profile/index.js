import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Benutzerprofil
        </Typography>
        <Typography variant="body1" paragraph>
          Hier werden in Zukunft Ihre Profildaten angezeigt.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Diese Seite ist noch in Entwicklung.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 