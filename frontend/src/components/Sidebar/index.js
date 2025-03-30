import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

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
        width: 240,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        background: 'rgba(20, 20, 40, 0.8)',
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