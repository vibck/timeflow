import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import {
  LayoutGrid as Grid3X3,
  Calendar as CalendarIcon,
  LayoutList,
  Menu
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * @typedef {Object} LinkItem
 * @property {string} label - Beschriftung des Links
 * @property {string} href - Ziel des Links
 * @property {React.ReactNode} icon - Icon für den Link
 */

/**
 * Sidebar - Hauptkomponente für die Seitenleiste
 */
export const Sidebar = ({ children }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 256,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        background: '#0f1120',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        pt: '64px',
        zIndex: 1200,
        boxShadow: '4px 0 15px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Box sx={{ p: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

/**
 * SidebarLink - Link für die Sidebar
 */
export const SidebarLink = ({ icon, label, href }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Tooltip title={label} placement="right">
      <Link
        to={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          textDecoration: 'none',
          transition: 'all 0.2s ease-in-out',
          marginBottom: '4px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }
        }}
      >
        <Box
          component={motion.div}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            '& svg': {
              width: 20,
              height: 20
            }
          }}
        >
          {icon}
        </Box>
        <Box
          component={motion.span}
          sx={{
            fontSize: '0.95rem',
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </Box>
      </Link>
    </Tooltip>
  );
};

/**
 * CalendarSidebar - Spezielle Sidebar für den Kalender mit kommenden Terminen
 */
export const CalendarSidebar = ({ events = [], onEditEvent }) => {
  return (
    <div className="w-64 bg-[#0f1120] backdrop-blur-xl border-r border-white/10 p-6 fixed top-0 bottom-0 left-0 z-10">
      <div className="text-xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#ff0066] to-[#3399ff]">
        TimeFlow
      </div>
      
      <nav className="space-y-1">
        <Link to="/" className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
          <Grid3X3 className="mr-3 h-5 w-5 text-gray-400" />
          <span>Dashboard</span>
        </Link>
        <Link to="/calendar" className="flex items-center p-3 rounded-lg bg-gradient-to-r from-[#ff0066]/10 to-[#3399ff]/10 text-white">
          <CalendarIcon className="mr-3 h-5 w-5 text-[#3399ff]" />
          <span>Kalender</span>
        </Link>
        <Link to="/ai-booking" className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
          <LayoutList className="mr-3 h-5 w-5 text-gray-400" />
          <span>KI-Buchung</span>
        </Link>
        <Link to="/health-intervals" className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
          <Menu className="mr-3 h-5 w-5 text-gray-400" />
          <span>Gesundheitsintervalle</span>
        </Link>
      </nav>
      
      <div className="mt-8 pt-8 border-t border-white/10">
        <h3 className="text-xs uppercase text-gray-500 font-medium mb-4 tracking-wider">Kommende Termine</h3>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.slice(0, 3).map(event => (
              <div 
                key={event.id} 
                className="p-3 rounded-lg bg-[#1a1f3e] border border-[#2a2f4e] transition-colors cursor-pointer"
                onClick={() => onEditEvent && onEditEvent(event)}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: event.color }}></div>
                  <span className="text-sm font-medium">{event.title}</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {format(event.date, 'dd. MMM', { locale: de })} • {event.time}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-lg bg-[#1a1f3e] border border-[#2a2f4e] flex items-center justify-center">
              <span className="text-sm text-gray-400 font-medium">Keine kommenden Termine</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 