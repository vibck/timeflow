import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Lade den Theme-Modus aus dem localStorage oder verwende 'light' als Standard
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  // Aktualisiere den Theme-Modus im localStorage, wenn er sich ändert
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Setze das data-theme-Attribut auf dem HTML-Element für CSS-Selektoren
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  // Funktion zum Umschalten des Theme-Modus
  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  // Prüfe, ob der Benutzer eine Systemeinstellung für den Dunkelmodus hat
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Wenn keine gespeicherte Einstellung vorhanden ist, verwende die Systemeinstellung
    if (!localStorage.getItem('themeMode')) {
      setMode(mediaQuery.matches ? 'dark' : 'light');
    }
    
    // Höre auf Änderungen der Systemeinstellung
    const handleChange = e => {
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 