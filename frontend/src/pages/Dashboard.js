import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronRight, 
  MoreHorizontal, 
  CheckSquare, 
  Square, 
  CalendarDays, 
  ArrowRight, 
  Activity,
  Trash2,
  Edit,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import api from '../utils/api';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  TextField, 
  IconButton,
  Checkbox,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Paper
} from '@mui/material';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("work");
  const [newTaskDueDate, setNewTaskDueDate] = useState("Heute");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [healthIntervals, setHealthIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const getUserName = () => {
    if (!currentUser) return "Benutzer";
    
    if (currentUser.displayName) {
      return currentUser.displayName.split(" ")[0];
    }
    
    if (currentUser.name) {
      return currentUser.name.split(" ")[0];
    }
    
    if (currentUser.username) {
      return currentUser.username;
    }
    
    if (currentUser.email) {
      return currentUser.email.split("@")[0];
    }
    
    return "Benutzer";
  };
  
  const firstName = getUserName();

  // Update time every minute
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Format greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Guten Morgen";
    if (hour < 18) return "Guten Tag";
    return "Guten Abend";
  };

  // Format date in German
  const formatDate = () => {
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    return currentTime.toLocaleDateString("de-DE", options);
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  };

  // Add new task
  const addTask = () => {
    if (newTask.trim() === "") return;
    
    const newTaskObj = {
      id: Date.now(),
      title: newTask,
      completed: false,
      dueDate: newTaskDueDate,
      category: newTaskCategory
    };
    
    setTasks([newTaskObj, ...tasks]);
    setNewTask("");
    setIsAddingTask(false);
  };
  
  // Delete task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  // Start editing task
  const startEditTask = (task) => {
    setEditingTask({
      ...task,
      editTitle: task.title,
      editCategory: task.category,
      editDueDate: task.dueDate
    });
  };
  
  // Save edited task
  const saveEditTask = () => {
    if (editingTask.editTitle.trim() === "") return;
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id 
        ? {
            ...task,
            title: editingTask.editTitle,
            category: editingTask.editCategory,
            dueDate: editingTask.editDueDate
          }
        : task
    ));
    
    setEditingTask(null);
  };
  
  // Cancel editing task
  const cancelEditTask = () => {
    setEditingTask(null);
  };

  // Get task category color
  const getTaskCategoryColor = (category) => {
    switch (category) {
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

  const handleAddAppointment = () => {
    // Anstatt zur URL zu navigieren, öffnen wir direkt das Popup
    const startTime = new Date();
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1); // Standard: 1 Stunde später
    
    // Initialisiere ein leeres Event mit aktueller Zeit
    const emptyEvent = {
      id: 'new-event-' + Date.now(), // Temporäre ID für das neue Event
      title: '',
      description: '',
      location: '',
      start_time: startTime,
      end_time: endTime,
      event_type: 'personal'
    };
    
    // Öffne das EventForm-Popup mit dem leeren Event
    if (window.openEventFormPopup) {
      window.openEventFormPopup(emptyEvent);
    } else {
      // Fallback zur alten Methode, falls die globale Funktion nicht verfügbar ist
      navigate('/events/new');
    }
  };

  // Task category options
  const taskCategories = [
    { id: "work", name: "Arbeit", color: "#3399ff" },
    { id: "personal", name: "Persönlich", color: "#ff9900" },
    { id: "health", name: "Gesundheit", color: "#66cc66" },
    { id: "other", name: "Sonstiges", color: "#9966cc" }
  ];

  // Formatiere Datum relativ zum aktuellen Datum
  const formatRelativeDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(date - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `vor ${diffDays} Tagen`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `vor ${months} Monaten`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `vor ${years} Jahren`;
      }
    } catch (error) {
      console.error('Fehler bei der Datumsformatierung:', error);
      return 'unbekannt';
    }
  };
  
  // Berechne den Fortschritt eines Intervalls
  const calculateProgress = (lastVisit, nextVisit) => {
    try {
      const now = new Date();
      // Stelle sicher, dass wir Date-Objekte haben
      const last = lastVisit instanceof Date ? lastVisit : new Date(lastVisit);
      const next = nextVisit instanceof Date ? nextVisit : new Date(nextVisit);
      
      // Prüfe, ob die Daten gültig sind
      if (isNaN(last.getTime()) || isNaN(next.getTime())) {
        console.error('Ungültige Datumswerte für Fortschrittsberechnung:', { lastVisit, nextVisit });
        return 0;
      }
      
      // Setze Uhrzeit auf Mitternacht für konsistente Berechnungen
      const lastDate = new Date(last);
      lastDate.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(next);
      nextDate.setHours(0, 0, 0, 0);
      
      const nowDate = new Date(now);
      nowDate.setHours(0, 0, 0, 0);
      
      // Gesamt Zeitspanne
      const total = nextDate - lastDate;
      
      // Wenn das Intervall ungültig ist oder 0, gib 0% zurück
      if (total <= 0) {
        console.warn('Ungültiges Intervall: Die Zeitspanne ist 0 oder negativ');
        return 0;
      }
      
      // Vergangene Zeit
      const elapsed = nowDate - lastDate;
      
      // Fortschritt berechnen und auf 0-100% begrenzen
      const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
      
      return progress;
    } catch (error) {
      console.error('Fehler bei der Fortschrittsberechnung:', error);
      return 0;
    }
  };
  
  // Prüfe, ob ein Termin überfällig ist
  const isOverdue = (nextVisit) => {
    try {
      // Stelle sicher, dass wir ein Date-Objekt haben
      const nextDate = nextVisit instanceof Date ? nextVisit : new Date(nextVisit);
      
      // Prüfe, ob das Datum gültig ist
      if (isNaN(nextDate.getTime())) {
        console.error('Ungültiges Datum für nächsten Besuch:', nextVisit);
        return false;
      }
      
      // Vergleiche nur Datum ohne Uhrzeit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextDateOnly = new Date(nextDate);
      nextDateOnly.setHours(0, 0, 0, 0);
      
      console.log('Dashboard - Überfälligkeitsprüfung:', {
        original: nextVisit,
        nextDate: nextDate,
        nextDateOnly: nextDateOnly,
        today: today,
        isOverdue: nextDateOnly < today
      });
      
      return nextDateOnly < today;
    } catch (error) {
      console.error('Fehler bei der Überprüfung auf Überfälligkeit:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/api/events');
        const events = response.data.map(event => ({
          id: event.id,
          title: event.title,
          date: format(new Date(event.start_time), 'dd.MM.yyyy', { locale: de }),
          time: event.allDay 
            ? 'Ganztägig' 
            : `${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')}`,
          color: event.color || "#3399ff"
        }));
        setUpcomingEvents(events);
      } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
        // Keine Fallback-Daten mehr
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Lade Gesundheitsintervalle
    const fetchHealthIntervals = async () => {
      try {
        const response = await api.get('/api/health-intervals');
        console.log('Rohe API-Antwort (Health Intervals):', response.data);
        
        // Konvertiere die API-Daten in das richtige Format
        const formattedIntervals = response.data.map(interval => {
          // Stelle sicher, dass die Daten gültig sind
          if (!interval.last_appointment) {
            console.warn('Ungültige Intervalldaten in API-Antwort (fehlendes last_appointment):', interval);
            return null;
          }
          
          // Das nächste Datum wird entweder aus next_appointment oder next_suggested_date gelesen
          const nextDateValue = interval.next_appointment || interval.next_suggested_date;
          if (!nextDateValue) {
            console.warn('Ungültige Intervalldaten in API-Antwort (fehlendes nächstes Datum):', interval);
            return null;
          }
          
          const lastVisitDate = new Date(interval.last_appointment);
          const nextVisitDate = new Date(nextDateValue);
          
          // Prüfe, ob die Datumsangaben gültig sind
          if (isNaN(lastVisitDate.getTime()) || isNaN(nextVisitDate.getTime())) {
            console.warn('Ungültige Datumswerte in Intervall:', interval);
            return null;
          }
          
          return {
            id: interval.id,
            title: interval.interval_type,
            interval: interval.interval_months,
            lastVisit: lastVisitDate,
            nextVisit: nextVisitDate,
            notes: interval.notes || ''
          };
        })
        .filter(interval => interval !== null); // Entferne ungültige Intervalldaten
        
        // Sortiere nach nächstem Besuchsdatum
        formattedIntervals.sort((a, b) => a.nextVisit - b.nextVisit);
        
        console.log('Geladene Gesundheitsintervalle:', formattedIntervals);
        setHealthIntervals(formattedIntervals);
      } catch (error) {
        console.error('Fehler beim Laden der Gesundheitsintervalle:', error);
        setHealthIntervals([]);
      }
    };

    fetchEvents();
    fetchHealthIntervals();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1120]" style={{
      color: mode === 'dark' ? "#ffffff" : "#1e293b",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif",
    }}>
      <div>
        {/* Header with add button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-8">
          <div className="mb-4 md:mb-0">
            <h1 style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              background: "linear-gradient(90deg, #ff0066, #3399ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {getGreeting()}, {firstName}!
            </h1>
            <p style={{
              fontSize: "1rem",
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
            }}>
              {formatDate()}
            </p>
          </div>
          
          <button
            onClick={handleAddAppointment}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 2rem",
              background: "linear-gradient(90deg, #ff0066, #3399ff)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            <Plus size={20} />
            Termin
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
          {/* Tasks section - 2/3 width on large screens */}
          <div className={`lg:col-span-2 ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#2a2f4e]' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden`}>
            <div className={`flex justify-between items-center p-4 border-b ${mode === 'dark' ? 'border-[#2a2f4e]' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <CheckSquare className={`h-5 w-5 ${mode === 'dark' ? 'text-[#ff0066]' : 'text-[#ff0066]'} mr-2`} />
                <h2 className={`font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Aufgaben</h2>
              </div>
              <button
                className="bg-gradient-to-r from-[#ff0066] to-[#3399ff] hover:opacity-90 text-white rounded-full h-8 px-3 flex items-center justify-center font-medium"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Neu
              </button>
            </div>

            {isAddingTask && (
              <div className={`p-4 ${mode === 'dark' ? 'bg-[#2a2f4e] border-[#1a1f3e]' : 'bg-gray-50 border-gray-200'} border-b`}>
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Neue Aufgabe eingeben..."
                    className={`w-full p-2 rounded ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    autoFocus
                  />
                  
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className={`p-2 rounded ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {taskCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    
                    <select
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className={`p-2 rounded ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="Heute">Heute</option>
                      <option value="Morgen">Morgen</option>
                      <option value="Diese Woche">Diese Woche</option>
                      <option value="Nächste Woche">Nächste Woche</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsAddingTask(false)}
                      className={`px-3 py-1 rounded ${mode === 'dark' ? 'bg-[#1a1f3e] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={addTask}
                      className="px-3 py-1 rounded bg-gradient-to-r from-[#ff0066] to-[#3399ff] text-white"
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4">
              <div className="space-y-2">
                {tasks
                  .slice(0, showAllTasks ? tasks.length : 5)
                  .map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-md flex items-start gap-3 transition-colors ${
                      task.completed 
                        ? mode === 'dark' ? "bg-[#2a2f4e]/50" : "bg-gray-50"
                        : mode === 'dark' ? "bg-[#2a2f4e] hover:bg-[#323752]" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {editingTask && editingTask.id === task.id ? (
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={editingTask.editTitle}
                          onChange={(e) => setEditingTask({...editingTask, editTitle: e.target.value})}
                          className={`w-full p-2 rounded ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          autoFocus
                        />
                        
                        <div className="flex flex-wrap gap-3">
                          <select
                            value={editingTask.editCategory}
                            onChange={(e) => setEditingTask({...editingTask, editCategory: e.target.value})}
                            className={`p-2 rounded ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          >
                            {taskCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          
                          <select
                            value={editingTask.editDueDate}
                            onChange={(e) => setEditingTask({...editingTask, editDueDate: e.target.value})}
                            className={`p-2 rounded ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#3a3f5e] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          >
                            <option value="Heute">Heute</option>
                            <option value="Morgen">Morgen</option>
                            <option value="Diese Woche">Diese Woche</option>
                            <option value="Nächste Woche">Nächste Woche</option>
                          </select>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelEditTask}
                            className={`px-3 py-1 rounded ${mode === 'dark' ? 'bg-[#1a1f3e] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                          >
                            Abbrechen
                          </button>
                          <button
                            onClick={saveEditTask}
                            className="px-3 py-1 rounded bg-gradient-to-r from-[#ff0066] to-[#3399ff] text-white"
                          >
                            Speichern
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => toggleTaskCompletion(task.id)} className="mt-0.5 flex-shrink-0">
                          {task.completed ? (
                            <CheckSquare className="h-5 w-5 text-[#ff0066]" />
                          ) : (
                            <Square className={`h-5 w-5 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: getTaskCategoryColor(task.category) }}
                            ></div>
                            <p className={`font-medium ${task.completed ? mode === 'dark' ? "text-gray-400" : "text-gray-400" : mode === 'dark' ? "text-white" : "text-gray-900"} ${task.completed ? "line-through" : ""}`}>
                              {task.title}
                            </p>
                          </div>
                          <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{task.dueDate}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => startEditTask(task)}
                            className={`${mode === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className={`${mode === 'dark' ? 'text-gray-400 hover:text-[#ff0066]' : 'text-gray-400 hover:text-[#ff0066]'}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className={`text-center py-6 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>Keine Aufgaben vorhanden</p>
                    <p className="text-sm mt-2">Klicke auf "Neu", um eine Aufgabe hinzuzufügen</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-3 border-t ${mode === 'dark' ? 'border-[#2a2f4e]' : 'border-gray-200'} flex justify-between items-center`}>
              <span className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {tasks.filter((t) => t.completed).length} von {tasks.length} erledigt
              </span>
              {tasks.length > 5 && (
                <button 
                  onClick={() => setShowAllTasks(!showAllTasks)} 
                  className={`text-sm ${mode === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors flex items-center`}
                >
                  {showAllTasks ? "Weniger anzeigen" : "Alle anzeigen"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </div>

          {/* Upcoming events - 1/3 width on large screens */}
          <div className={`${mode === 'dark' ? 'bg-[#1a1f3e] border-[#2a2f4e]' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden`}>
            <div className={`flex justify-between items-center p-4 border-b ${mode === 'dark' ? 'border-[#2a2f4e]' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-[#3399ff] mr-2" />
                <h2 className={`font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Kommende Termine</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {upcomingEvents
                  .slice(0, showAllEvents ? upcomingEvents.length : 5)
                  .map((event) => (
                  <div 
                    key={event.id} 
                    className={`p-3 ${mode === 'dark' ? 'bg-[#2a2f4e] hover:bg-[#323752]' : 'bg-gray-50 hover:bg-gray-100'} rounded-md transition-colors cursor-pointer`}
                    onClick={() => {
                      // Bereite das Event-Objekt mit korrekten Datumsformaten vor
                      const formattedEvent = {
                        ...event,
                        // Füge ein zusätzliches start_time-Feld hinzu, das ein gültiges Date-Objekt enthält
                        // date ist ein String im Format 'dd.MM.yyyy', daher konvertieren wir es
                        start_time: (() => {
                          try {
                            // Falls event.date im Format 'dd. MMM' und event.time im Format 'HH:mm - HH:mm' ist,
                            // müssen wir dies korrekt parsen
                            const [day, month] = event.date.split('.');
                            const [startTime] = event.time.split('-')[0].trim().split(':');
                            const startHour = parseInt(startTime, 10) || 9; // Standardwert 9 Uhr falls nicht parsebar
                            
                            // Verwende das aktuelle Jahr, wenn nicht im Date enthalten
                            const currentYear = new Date().getFullYear();
                            const monthNumber = parseInt(month.trim(), 10) - 1; // Monate sind 0-basiert in JS
                            const dayNumber = parseInt(day.trim(), 10);
                            
                            // Erstelle ein gültiges Datum
                            const date = new Date(currentYear, monthNumber, dayNumber, startHour, 0, 0);
                            return date;
                          } catch (e) {
                            console.error('Fehler beim Parsen des Datums:', e);
                            return new Date(); // Fallback auf aktuelles Datum
                          }
                        })()
                      };
                      
                      // Öffne das EventForm-Popup mit dem formatierten Event-Objekt
                      if (window.openEventFormPopup) {
                        window.openEventFormPopup(formattedEvent);
                      } else {
                        // Fallback: Navigiere zur Kalenderseite
                        navigate('/calendar');
                        
                        // Versuche, das Popup nach der Navigation zu öffnen
                        setTimeout(() => {
                          if (window.openEventFormPopup) {
                            window.openEventFormPopup(formattedEvent);
                          }
                        }, 100);
                      }
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: event.color }}></div>
                      <h3 className={`font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{event.title}</h3>
                    </div>
                    <div className={`flex items-center text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      <span>
                        {event.date}, {event.time}
                      </span>
                    </div>
                  </div>
                ))}
                
                {upcomingEvents.length === 0 && (
                  <div className={`text-center py-6 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>Keine Termine vorhanden</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-3 border-t ${mode === 'dark' ? 'border-[#2a2f4e]' : 'border-gray-200'} flex justify-between items-center`}>
              {upcomingEvents.length > 5 && (
                <button 
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  className={`text-sm ${mode === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors flex items-center`}
                >
                  {showAllEvents ? "Weniger anzeigen" : "Alle anzeigen"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              )}
              <Link to="/calendar">
                <button className="bg-gradient-to-r from-[#ff0066] to-[#3399ff] hover:opacity-90 text-white rounded-full h-8 px-3 flex items-center justify-center font-medium">
                  Kalender
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 px-8 pb-8">
          {/* Today's appointments */}
          <div className={`${mode === 'dark' ? 'bg-[#1a1f3e] border-[#2a2f4e]' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Heute</h3>
                <p className={`text-2xl font-bold mt-1 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>1 Termin</p>
              </div>
              <div className={`${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-50'} p-2 rounded-full`}>
                <CalendarDays className="h-5 w-5 text-[#3399ff]" />
              </div>
            </div>
            <div className={`mt-4 pt-4 border-t ${mode === 'dark' ? 'border-[#2a2f4e]' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#3399ff] mr-2"></div>
                <p className={`text-sm ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Meeting mit Marketing-Team</p>
              </div>
              <p className={`text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>15:30 - 16:30</p>
            </div>
          </div>

          {/* Tasks progress */}
          <div className={`${mode === 'dark' ? 'bg-[#1a1f3e] border-[#2a2f4e]' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Aufgaben</h3>
                <p className={`text-2xl font-bold mt-1 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}% erledigt
                </p>
              </div>
              <div className={`${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-50'} p-2 rounded-full`}>
                <CheckSquare className="h-5 w-5 text-[#ff0066]" />
              </div>
            </div>
            <div className="mt-4">
              <div className={`w-full ${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-100'} h-2 rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#ff0066] to-[#3399ff]" 
                  style={{ width: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%` }}
                ></div>
              </div>
              <div className={`flex justify-between mt-2 text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>{tasks.filter(t => t.completed).length} von {tasks.length} erledigt</span>
                <span>{tasks.length - tasks.filter(t => t.completed).length} ausstehend</span>
              </div>
            </div>
          </div>

          {/* Health intervals */}
          <div className={`${mode === 'dark' ? 'bg-[#1a1f3e] border-[#2a2f4e]' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Gesundheitsintervalle</h3>
                {healthIntervals.length > 0 ? (
                  <p className={`text-2xl font-bold mt-1 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {healthIntervals[0].title}
                  </p>
                ) : (
                  <p className={`text-2xl font-bold mt-1 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Keine Intervalle
                  </p>
                )}
              </div>
              <div className={`${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-50'} p-2 rounded-full`}>
                <Activity className="h-5 w-5 text-[#66cc66]" />
              </div>
            </div>
            <div className={`mt-4 pt-4 border-t ${mode === 'dark' ? 'border-[#2a2f4e]' : 'border-gray-200'}`}>
              {healthIntervals.length > 0 ? (
                <>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isOverdue(healthIntervals[0].nextVisit) ? 'bg-[#ff0066]' : 'bg-[#66cc66]'
                    }`}></div>
                    <p className={`text-sm ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {isOverdue(healthIntervals[0].nextVisit) 
                        ? 'Überfällig' 
                        : `Nächster Termin: ${format(new Date(healthIntervals[0].nextVisit), 'dd.MM.yyyy', { locale: de })}`
                      }
                    </p>
                  </div>
                  <div className={`w-full ${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-100'} h-2 rounded-full overflow-hidden mt-3`}>
                    <div 
                      className={`h-full ${
                        isOverdue(healthIntervals[0].nextVisit)
                          ? 'bg-gradient-to-r from-[#ff0066] to-[#ff3366]'
                          : 'bg-gradient-to-r from-[#66cc66] to-[#88ee88]'
                      }`} 
                      style={{ width: `${calculateProgress(healthIntervals[0].lastVisit, healthIntervals[0].nextVisit)}%` }}
                    ></div>
                  </div>
                  <div className={`flex justify-between mt-2 text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Letzter Besuch: {formatRelativeDate(healthIntervals[0].lastVisit)}</span>
                    <span>{Math.round(calculateProgress(healthIntervals[0].lastVisit, healthIntervals[0].nextVisit))}%</span>
                  </div>
                </>
              ) : (
                <div>
                  <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Keine Gesundheitsintervalle konfiguriert
                  </p>
                  <div className={`w-full ${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-100'} h-2 rounded-full overflow-hidden mt-3`}>
                    <div className="h-full bg-gradient-to-r from-[#66cc66] to-[#88ee88]" style={{ width: "0%" }}></div>
                  </div>
                  <div className={`flex justify-between mt-2 text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Noch keine Termine</span>
                    <span>0%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
