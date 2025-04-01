import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const login = async (emailOrToken, password) => {
    try {
      let token;
      
      if (password === undefined) {
        token = emailOrToken;
      } else {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
          email: emailOrToken,
          password
        });
        
        token = response.data.token;
        if (!token) {
          throw new Error('Kein Token vom Server erhalten');
        }
      }
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);
      setCurrentUser(userResponse.data.user);
      setIsAuthenticated(true);
      return userResponse.data.user;
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerinformationen:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      throw error;
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
