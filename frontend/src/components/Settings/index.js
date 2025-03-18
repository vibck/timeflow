import React from 'react';
import { Container, Typography, Paper, Box, Divider, Switch, FormGroup, FormControlLabel } from '@mui/material';

const Settings = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Einstellungen
        </Typography>
        
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Benachrichtigungen
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <FormGroup>
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="E-Mail-Benachrichtigungen"
            />
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Push-Benachrichtigungen"
            />
            <FormControlLabel 
              control={<Switch />} 
              label="SMS-Benachrichtigungen"
            />
          </FormGroup>
        </Box>
        
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Privatsphäre
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <FormGroup>
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Profilinformationen öffentlich sichtbar"
            />
            <FormControlLabel 
              control={<Switch />} 
              label="Aktivitäten teilen"
            />
          </FormGroup>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" sx={{ fontStyle: 'italic' }}>
            Weitere Einstellungsoptionen werden in zukünftigen Updates verfügbar sein.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings; 