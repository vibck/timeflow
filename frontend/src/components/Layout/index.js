import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
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
  Badge,
  Popover
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Search, Bell, Settings, User, LayoutGrid, Calendar, LayoutList, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import api from '../../utils/api';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [sidebarEvents, setSidebarEvents] = useState([]);
  
  const isCalendarPage = location.pathname === '/calendar';
  const currentPath = location.pathname;

  // Funktion zum Abrufen der Farbe basierend auf dem Termintyp
  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case "work":
        return "#3399ff";
      case "personal":
        return "#ff9900";
      case "health":
        return "#66cc66";
      default:
        return "#9966cc";
    }
  };

  useEffect(() => {
    // Funktion, um Termine neu zu laden
    const refreshSidebarEvents = async () => {
      try {
        // Ladezustand setzen
        setIsLoadingEvents(true);
        
        // Direkt von der API neue Termine laden anstatt window.calendarEvents zu verwenden
        const response = await api.get('/api/events');
        const now = new Date();
        
        const events = response.data.map(event => {
          const start_time = new Date(event.start_time);
          const end_time = new Date(event.end_time);
          
          return {
            id: event.id,
            title: event.title,
            date: format(start_time, 'dd.MM.yyyy', { locale: de }),
            time: event.allDay 
              ? 'Ganztägig' 
              : `${format(start_time, 'HH:mm')} - ${format(end_time, 'HH:mm')}`,
            color: getEventTypeColor(event.event_type),
            event_type: event.event_type || 'personal',
            start_time: start_time,
            end_time: end_time,
            // Explizit speichern, ob der Termin in der Zukunft liegt
            isInFuture: end_time > now
          };
        });
        
        // Filtere vergangene Termine strikt aus
        const filteredEvents = events.filter(event => event.isInFuture);
        
        // Sortiere strikt nach Startzeit und dann nach ID
        filteredEvents.sort((a, b) => {
          // Prüfung auf undefined/null Werte
          if (!a || !a.start_time) return -1;
          if (!b || !b.start_time) return 1;
          
          // Vergleiche nach Startdatum und Startzeit
          const timeA = a.start_time.getTime();
          const timeB = b.start_time.getTime();
          
          // Primäre Sortierung nach Startzeit (vom frühesten zum spätesten)
          if (timeA !== timeB) {
            return timeA - timeB; // Aufsteigende Sortierung nach Zeit
          }
          
          // Sekundäre Sortierung nach ID
          if (a.id !== b.id) {
            return a.id - b.id;
          }
          
          // Tertiäre Sortierung nach Titel
          return a.title.localeCompare(b.title);
        });
        
        // Update window.calendarEvents für andere Komponenten
        window.calendarEvents = filteredEvents;
        
        // Aktualisiere separaten Sidebar-State
        setSidebarEvents(filteredEvents);
        
        // Für die Kalenderseite auch calendarEvents aktualisieren
        if (isCalendarPage) {
          setCalendarEvents(filteredEvents);
        }
      } catch (error) {
        // Fehler leise behandeln, um Konsolenspam zu vermeiden
        // Kritische Fehler sollten in einer Produktionsumgebung in einem Error-Tracking-System erfasst werden
      } finally {
        // Ladezustand zurücksetzen
        setIsLoadingEvents(false);
      }
    };
    
    // Globale Funktion für andere Komponenten bereitstellen
    window.refreshSidebarEvents = refreshSidebarEvents;
    
    // Sofort beim Mounten der Komponente Termine laden
    refreshSidebarEvents();
    
    // Die Termine regelmäßig aktualisieren (alle 30 Sekunden), um vergangene zu entfernen
    const intervalId = setInterval(() => {
      // Regelmäßig die Termine neu laden, unabhängig davon ob leer oder nicht
      refreshSidebarEvents();
    }, 30000); // Alle 30 Sekunden
    
    // Bei Unmount dieser Komponente die globale Funktion und den Interval löschen
    return () => {
      window.refreshSidebarEvents = null;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Beim ersten Laden der Komponente Termine laden
    if (window.refreshSidebarEvents && calendarEvents.length === 0) {
      window.refreshSidebarEvents();
    }
  }, [calendarEvents.length]);

  useEffect(() => {
    // Wenn wir auf der Kalenderseite sind, überprüfen wir periodisch,
    // ob Kalender-Events verfügbar sind
    if (isCalendarPage) {
      const checkEvents = () => {
        if (window.calendarEvents) {
          // Erstelle einen eindeutigeren Fingerabdruck für die Events, der ID, Titel und Startzeit enthält
          const createEventsFingerprint = (events) => {
            return events
              .map(event => `${event.id}-${event.title}-${event.start_time?.getTime() || 0}`)
              .join('|');
          };
          
          const currentFingerprint = createEventsFingerprint(calendarEvents);
          const newFingerprint = createEventsFingerprint(window.calendarEvents);
          
          if (currentFingerprint !== newFingerprint) {
            // Nur den calendarEvents-State aktualisieren, nicht den Sidebar-State
            setCalendarEvents(window.calendarEvents);
          }
        }
      };
      
      // Sofort prüfen
      checkEvents();
      
      // Periodisch prüfen
      const interval = setInterval(checkEvents, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isCalendarPage, calendarEvents]);

  // Lade Dummy-Events für alle Seiten
  useEffect(() => {
    // Stattdessen werden die Events durch die API-Calls geladen
    if (calendarEvents.length === 0) {
      setCalendarEvents([]);
    }
  }, [calendarEvents.length]);

  // Lade Benachrichtigungen
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // In einer echten App würden wir hier API-Calls machen
        // const response = await api.get('/api/notifications');
        // setNotifications(response.data);
        
        // Leere Benachrichtigungen statt Dummy-Daten
        setNotifications([]);
      } catch (error) {
        console.error('Fehler beim Laden der Benachrichtigungen:', error);
      }
    };
    
    fetchNotifications();
  }, []);

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

  const handleOpenNotifications = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchorEl(null);
  };

  const handleOpenSettings = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setSettingsAnchorEl(null);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim().length > 2) {
      // In einer echten App würden wir hier API-Calls machen
      // Aber für die Demo verwenden wir lokale Filterung der Events
      
      const filteredEvents = window.calendarEvents ? 
        window.calendarEvents.filter(event => 
          event.title.toLowerCase().includes(value.toLowerCase())
        ) : [];
      
      setSearchResults(filteredEvents);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (event) => {
    // Navigiere zum jeweiligen Event
    if (event.id) {
      navigate(`/events/${event.id}`);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    handleCloseNotifications();
  };

  const handleNotificationClick = (notification) => {
    // Markiere diese Benachrichtigung als gelesen
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    
    // Je nach Typ der Benachrichtigung zu verschiedenen Seiten navigieren
    switch(notification.type) {
      case 'meeting':
        navigate(`/events/${notification.eventId}`);
        break;
      case 'message':
        navigate('/messages');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      default:
        navigate('/notifications');
    }
    
    handleCloseNotifications();
  };

  const handleEditEvent = (event) => {
    // Direkt das Popup öffnen, wenn die Funktion verfügbar ist
    if (window.openEventFormPopup) {
      window.openEventFormPopup(event);
    } else {
      // Wenn die Funktion nicht verfügbar ist (z.B. beim ersten Laden), 
      // verwenden wir einen Timer, um die Funktion aufzurufen, sobald sie verfügbar ist
      const checkAndOpenPopup = () => {
        if (window.openEventFormPopup) {
          window.openEventFormPopup(event);
          return true;
        }
        return false;
      };
      
      // Wenn die Funktion nicht sofort verfügbar ist, navigieren wir zur Calendar-Seite
      // und versuchen dann, das Popup zu öffnen, wenn die Funktion verfügbar wird
      navigate(`/calendar`);
      
      // Versuche, das Popup zu öffnen, nachdem wir zur Calendar-Seite navigiert sind
      // und die Funktion wahrscheinlich verfügbar geworden ist
      setTimeout(() => {
        if (!checkAndOpenPopup()) {
          // Wenn die Funktion nach 100ms immer noch nicht verfügbar ist,
          // versuchen wir es alle 100ms für maximal 1 Sekunde
          let attempts = 0;
          const intervalId = setInterval(() => {
            attempts += 1;
            if (checkAndOpenPopup() || attempts >= 10) {
              clearInterval(intervalId);
            }
          }, 100);
        }
      }, 100);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { icon: <LayoutGrid className="h-5 w-5 text-gray-400" />, label: 'Dashboard', href: '/' },
    { icon: <Calendar className="h-5 w-5 text-gray-400" />, label: 'Kalender', href: '/calendar' },
    { icon: <LayoutList className="h-5 w-5 text-gray-400" />, label: 'KI-Buchung', href: '/ai-booking' },
    { icon: <MenuIcon className="h-5 w-5 text-gray-400" />, label: 'Gesundheitsintervalle', href: '/health-intervals' }
  ];

  useEffect(() => {
    // Überschreibe die globale Funktion, damit sie auch die Sidebar aktualisiert
    const originalRefreshCalendarEvents = window.refreshCalendarEvents;
    if (originalRefreshCalendarEvents) {
      window.refreshCalendarEvents = (...args) => {
        // Originale Funktion aufrufen
        originalRefreshCalendarEvents(...args);
        
        // Zusätzlich die Sidebar aktualisieren
        if (window.refreshSidebarEvents) {
          window.refreshSidebarEvents();
        }
      };
    }
    
    return () => {
      // Beim Unmount die originale Funktion wiederherstellen
      window.refreshCalendarEvents = originalRefreshCalendarEvents;
    };
  }, []);

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      background: '#0a0f1e',
      color: 'white'
    }}>
      {/* Einheitliche Sidebar für alle Seiten */}
      <div className="w-64 bg-[#0f1120] backdrop-blur-xl border-r border-white/10 p-6 fixed top-0 bottom-0 left-0 z-10">
        <div className="text-xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#ff0066] to-[#3399ff]">
          TimeFlow
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              to={item.href} 
              className={`flex items-center p-3 rounded-lg ${
                currentPath === item.href 
                  ? 'bg-gradient-to-r from-[#ff0066]/10 to-[#3399ff]/10 text-white' 
                  : 'hover:bg-white/5 transition-colors'
              }`}
            >
              {React.cloneElement(item.icon, { 
                className: `mr-3 h-5 w-5 ${currentPath === item.href ? 'text-[#3399ff]' : 'text-gray-400'}`
              })}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* Kommende Termine werden jetzt immer angezeigt */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-xs uppercase text-gray-500 font-medium mb-4 tracking-wider">
            Kommende Termine
          </h3>
          <div className="space-y-3">
            {isLoadingEvents && sidebarEvents.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#2a2f4e] border border-[#3a3f6e] transition-colors flex items-center justify-center">
                <span className="text-sm text-gray-400">Termine werden geladen...</span>
              </div>
            ) : sidebarEvents && sidebarEvents.length > 0 ? (
              // Nochmaliges Filtern der Events direkt vor der Anzeige, um sicherzustellen, dass
              // wirklich nur zukünftige Termine angezeigt werden
              sidebarEvents
                .filter(event => {
                  const now = new Date();
                  // Für Events mit Endzeit: nur anzeigen, wenn Endzeit > jetzt
                  return event.end_time > now;
                })
                .slice(0, 3) // Zeige nur die nächsten drei Termine
                .map(event => (
                  <div 
                    key={event.id} 
                    className="p-3 rounded-lg bg-[#1a1f3e] border border-[#2a2f4e] transition-colors cursor-pointer"
                    onClick={() => handleEditEvent && handleEditEvent(event)}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: event.color || getEventTypeColor(event.event_type || 'personal') }}
                      ></div>
                      <span className="text-sm font-medium">{event.title || 'Unbenannter Termin'}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {event.date && format(new Date(event.date), 'dd. MMM', { locale: de })} • {event.time || 'Keine Zeit angegeben'}
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-3 rounded-lg bg-[#2a2f4e] border border-[#3a3f6e] transition-colors flex items-center justify-center">
                <span className="text-sm text-gray-400">Keine kommenden Termine</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header für alle Seiten */}
      <div className="fixed top-0 left-64 right-0 z-20 flex justify-between items-center p-4 bg-[#0f1120] backdrop-blur-xl border-b border-white/10">
        <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-2 w-96 relative">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Termine, Aufgaben oder Projekte suchen..." 
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-400"
            value={searchTerm}
            onChange={handleSearch}
          />
          
          {/* Suchergebnisse Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f3e] rounded-lg shadow-xl border border-white/10 z-50">
              <div className="py-2">
                {searchResults.map(result => (
                  <div 
                    key={result.id}
                    className="px-4 py-2 hover:bg-white/10 cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="font-medium">{result.title}</div>
                    <div className="text-xs text-gray-400">{result.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Tooltip title="Benachrichtigungen">
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(30, 35, 60, 0.5)', 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  bgcolor: 'rgba(30, 35, 60, 0.8)',
                },
                width: 36,
                height: 36
              }}
              onClick={handleOpenNotifications}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Bell size={18} />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Einstellungen">
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(30, 35, 60, 0.5)', 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  bgcolor: 'rgba(30, 35, 60, 0.8)',
                },
                width: 36,
                height: 36
              }}
              component={Link}
              to="/settings"
            >
              <Settings size={18} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Profil & Einstellungen">
            <IconButton 
              onClick={handleOpenMenu} 
              sx={{ 
                p: 0,
                bgcolor: '#5C31D4',
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: '#6C42E5',
                }
              }}
            >
              <User 
                size={18} 
                color="#ffffff"
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Popover und Menüs für alle Seiten */}
      {/* Benachrichtigungen Popover */}
      <Popover
        open={Boolean(notificationAnchorEl)}
        anchorEl={notificationAnchorEl}
        onClose={handleCloseNotifications}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            background: 'rgba(20, 20, 40, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            mt: 1.5,
            overflow: 'hidden'
          }
        }}
      >
        <div className="p-3 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-medium">Benachrichtigungen</h3>
          <button 
            className="text-xs text-gray-400 hover:text-white transition-colors"
            onClick={handleMarkAllNotificationsAsRead}
          >
            Alle als gelesen markieren
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto py-2">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Keine Benachrichtigungen
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-3 hover:bg-white/5 cursor-pointer flex items-start ${!notification.read ? 'bg-white/5' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-1">
                  <div className="font-medium mb-1">
                    {notification.title}
                    {!notification.read && (
                      <span className="ml-2 w-2 h-2 inline-block rounded-full bg-[#ff0066]"></span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{notification.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-white/10 text-center">
          <Link to="/notifications" className="text-sm text-[#3399ff] hover:underline">
            Alle Benachrichtigungen anzeigen
          </Link>
        </div>
      </Popover>
      
      {/* Profil Menü */}
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
        <MenuItem component={Link} to="/profile" onClick={handleCloseMenu}>
          <PersonIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          Profil
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          Abmelden
        </MenuItem>
      </Menu>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          ml: '256px',
          width: 'calc(100% - 256px)',
          mt: '64px',
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
            padding: isCalendarPage ? '0' : '16px',
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
