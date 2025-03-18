import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Drawer, 
  List, 
  ListItem,
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Box
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Healing as HealingIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarMonthIcon,
  Person as PersonIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Kalender', icon: <CalendarMonthIcon />, path: '/calendar' },
    { text: 'KI-Buchung', icon: <SmartToyIcon />, path: '/ai-booking' },
    { text: 'Gesundheitsintervalle', icon: <HealingIcon />, path: '/health-intervals' },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
    { text: 'Einstellungen', icon: <SettingsIcon />, path: '/settings' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            TimeFlow
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Abmelden</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map(item => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
