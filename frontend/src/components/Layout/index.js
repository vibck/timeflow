import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  CssBaseline,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Dashboard as DashboardIcon,
  Healing as HealingIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarMonthIcon,
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, SidebarLink } from '../Sidebar';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseMenu();
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', href: '/' },
    { icon: <CalendarMonthIcon />, label: 'Kalender', href: '/calendar' },
    { icon: <SmartToyIcon />, label: 'KI-Buchung', href: '/ai-booking' },
    { icon: <HealingIcon />, label: 'Gesundheitsintervalle', href: '/health-intervals' }
  ];

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #1a1a2e, #16213e)'
    }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          background: 'rgba(20, 20, 40, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography 
              variant="h5" 
              component={Link} 
              to="/"
              sx={{ 
                color: 'white', 
                textDecoration: 'none',
                fontWeight: 600,
                letterSpacing: '0.5px',
                '&:hover': { opacity: 0.9 }
              }}
            >
              TimeFlow
            </Typography>
          </motion.div>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Profil & Einstellungen">
              <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              PaperProps={{
                sx: {
                  background: 'rgba(20, 20, 40, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  mt: 1.5,
                  '& .MuiMenuItem-root': {
                    fontSize: '0.9rem',
                    py: 1,
                    px: 2,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem component={Link} to="/profile">
                <PersonIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                Profil
              </MenuItem>
              <MenuItem component={Link} to="/settings">
                <SettingsIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                Einstellungen
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                Abmelden
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Sidebar>
        {menuItems.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </Sidebar>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          height: 'calc(100vh - 64px)',
          mt: '64px',
          ml: { xs: 0, md: '240px' },
          width: { md: 'calc(100% - 240px)' },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <motion.div
          key={window.location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            overflow: 'auto'
          }}
        >
          <Outlet />
        </motion.div>
      </Box>
    </Box>
  );
};

export default Layout;
