import React, { createContext, useContext, useState, useEffect } from 'react';
import getTheme from '../theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Immer den 'dark' Modus verwenden, unabhängig von gespeicherten Einstellungen
  const [mode, setMode] = useState('dark');

  const theme = getTheme(mode);

  useEffect(() => {
    localStorage.setItem('themeMode', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.style.backgroundColor = '#0f1120';
  }, []);

  // Dummy-Funktion für toggleTheme, die nichts mehr tut (immer im Dark Mode bleiben)
  const toggleTheme = () => {
    // Nichts tun - wir bleiben immer im Dark Mode
    return;
  };

  const value = {
    theme,
    mode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 