import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`)
        .then(response => {
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        
        // Nach erfolgreichem Login die Termine für die Sidebar laden
        setTimeout(() => {
          if (window.refreshSidebarEvents) {
            window.refreshSidebarEvents();
          }
          
          if (window.refreshDashboardEvents) {
            window.refreshDashboardEvents();
          }
        }, 500);
        
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Funktion zum Aktualisieren der Benutzerdaten im Kontext
  const updateUserData = (userData) => {
    if (!currentUser) return;
    
    setCurrentUser(prevUserData => ({
      ...prevUserData,
      ...userData
    }));
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
