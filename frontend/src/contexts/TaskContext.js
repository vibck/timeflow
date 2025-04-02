import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const { currentUser } = useAuth();
  
  // Lade Aufgaben aus dem localStorage beim Initialisieren
  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tasks_${currentUser.id}`);
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (error) {
          console.error('Fehler beim Parsen der gespeicherten Aufgaben:', error);
          setTasks([]);
        }
      }
    }
  }, [currentUser]);
  
  // Speichere Aufgaben im localStorage, wenn sie sich ändern
  useEffect(() => {
    if (currentUser && tasks.length > 0) {
      localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser]);
  
  // Füge eine neue Aufgabe hinzu
  const addTask = (task) => {
    const newTask = {
      id: Date.now(),
      ...task,
      completed: false
    };
    
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };
  
  // Lösche eine Aufgabe
  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  // Toggle Aufgaben-Abschluss
  const toggleTaskCompletion = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
  };
  
  // Aktualisiere eine Aufgabe
  const updateTask = (taskId, updatedData) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updatedData } 
          : task
      )
    );
  };
  
  const value = {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    updateTask
  };
  
  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 