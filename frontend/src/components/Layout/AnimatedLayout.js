import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Box,
  useTheme
} from '@mui/material';
import { 
  LayoutDashboard, 
  Calendar, 
  Activity, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Sidebar, 
  SidebarBody, 
  SidebarLink 
} from '../Sidebar';
import '../Sidebar/sidebar.css';

/**
 * AnimatedLayout - Modern animiertes Layout mit responsiver Sidebar
 * 
 * Diese Komponente ersetzt das ursprüngliche statische Layout mit einer
 * animierten Sidebar, die bei Hover expandiert wird und im mobilen Modus
 * ein Slide-In-Menü bietet.
 *
 * @param {Object} props - Die Props für die Komponente
 * @param {React.ReactNode} props.children - Inhalt, der im Hauptbereich angezeigt wird
 */
const AnimatedLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigationslinks für die Sidebar
  const links = [
    { 
      label: 'Dashboard', 
      href: '/', 
      icon: <LayoutDashboard size={24} className="text-neutral-700 dark-text-neutral-200" /> 
    },
    { 
      label: 'Kalender', 
      href: '/calendar', 
      icon: <Calendar size={24} className="text-neutral-700 dark-text-neutral-200" /> 
    },
    { 
      label: 'Gesundheitsintervalle', 
      href: '/health-intervals', 
      icon: <Activity size={24} className="text-neutral-700 dark-text-neutral-200" /> 
    },
    { 
      label: 'Einstellungen', 
      href: '/settings', 
      icon: <Settings size={24} className="text-neutral-700 dark-text-neutral-200" /> 
    }
  ];

  // Hilfsfunktion zum Überprüfen des aktiven Links
  const isActiveLink = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5'
      }}
    >
      {/* Header-Bereich mit Logo und Logout-Button */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
          boxShadow: 'none',
          borderBottom: 1,
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              color: theme.palette.primary.main
            }}
          >
            TimeFlow
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogOut size={18} />}
            sx={{ 
              borderRadius: '20px',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }
            }}
          >
            Abmelden
          </Button>
        </Toolbar>
      </AppBar>

      {/* Animierte Sidebar mit responsivem Verhalten */}
      <Sidebar>
        <SidebarBody>
          <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {links.map(link => (
              <SidebarLink 
                key={link.href} 
                link={link} 
                className={isActiveLink(link.href) ? 'active-link' : ''}
              />
            ))}
          </Box>
        </SidebarBody>
      </Sidebar>

      {/* Hauptinhalt der Seite */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: 8,
          bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5'
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AnimatedLayout; 