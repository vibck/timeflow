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
import api from '../utils/api';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([
    { id: 1, title: "Präsentation vorbereiten", completed: false, dueDate: "Morgen, 14:00", category: "work" },
    { id: 2, title: "Meeting mit Marketing-Team", completed: false, dueDate: "Heute, 15:30", category: "work" },
    { id: 3, title: "Projektplan aktualisieren", completed: true, dueDate: "Gestern", category: "work" },
    { id: 4, title: "Mila von der Schule abholen", completed: false, dueDate: "02. Apr, 10:00", category: "personal" },
    { id: 5, title: "Zahnarzttermin vereinbaren", completed: false, dueDate: "Diese Woche", category: "health" },
  ]);
  const [newTask, setNewTask] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("work");
  const [newTaskDueDate, setNewTaskDueDate] = useState("Heute");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  
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

  // Get upcoming events
  const upcomingEvents = [
    { id: 1, title: "Mila Abholen", date: "02. Apr", time: "10:00 - 10:15", color: "#3399ff" },
    { id: 2, title: "Weiberfastnacht", date: "27. Mär", time: "Ganztägig", color: "#9966cc" },
    { id: 3, title: "Rosenmontag", date: "03. Mär", time: "Ganztägig", color: "#9966cc" },
    { id: 4, title: "Teambesprechung", date: "05. Apr", time: "09:30 - 10:30", color: "#3399ff" },
    { id: 5, title: "Quartalsbericht", date: "10. Apr", time: "14:00 - 15:00", color: "#3399ff" },
    { id: 6, title: "Geburtstagsfeier Lisa", date: "15. Apr", time: "19:00 - 22:00", color: "#ff9900" },
    { id: 7, title: "Arzttermin", date: "18. Apr", time: "11:30 - 12:15", color: "#66cc66" },
  ];

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
    navigate('/events/new');
  };

  // Task category options
  const taskCategories = [
    { id: "work", name: "Arbeit", color: "#3399ff" },
    { id: "personal", name: "Persönlich", color: "#ff9900" },
    { id: "health", name: "Gesundheit", color: "#66cc66" },
    { id: "other", name: "Sonstiges", color: "#9966cc" }
  ];

  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header with add button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#ff0066] to-[#3399ff] text-transparent bg-clip-text">{getGreeting()}, {firstName}</span>
              <span className="text-[#9966cc]">!</span>
            </h1>
            <p className="text-sm text-gray-400">{formatDate()}</p>
          </div>
          
          <Button
            className="bg-gradient-to-r from-[#ff0066] to-[#3399ff] hover:opacity-90 text-white rounded-full h-10 px-4 flex items-center justify-center font-medium"
            onClick={handleAddAppointment}
          >
            <Plus className="h-4 w-4 mr-2" />
            Termin
          </Button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks section - 2/3 width on large screens */}
          <div className="lg:col-span-2 bg-[#1a1f3e] rounded-lg border border-[#2a2f4e] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[#2a2f4e]">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-[#ff0066] mr-2" />
                <h2 className="font-medium">Aufgaben</h2>
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
              <div className="p-4 bg-[#2a2f4e] border-b border-[#1a1f3e]">
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Neue Aufgabe eingeben..."
                    className="w-full p-2 rounded bg-[#1a1f3e] border border-[#3a3f5e] text-white"
                    autoFocus
                  />
                  
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="p-2 rounded bg-[#1a1f3e] border border-[#3a3f5e] text-white"
                    >
                      {taskCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    
                    <select
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="p-2 rounded bg-[#1a1f3e] border border-[#3a3f5e] text-white"
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
                      className="px-3 py-1 rounded bg-[#1a1f3e] text-gray-400 hover:text-white"
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
                      task.completed ? "bg-[#2a2f4e]/50" : "bg-[#2a2f4e] hover:bg-[#323752]"
                    }`}
                  >
                    {editingTask && editingTask.id === task.id ? (
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={editingTask.editTitle}
                          onChange={(e) => setEditingTask({...editingTask, editTitle: e.target.value})}
                          className="w-full p-2 rounded bg-[#1a1f3e] border border-[#3a3f5e] text-white"
                          autoFocus
                        />
                        
                        <div className="flex flex-wrap gap-3">
                          <select
                            value={editingTask.editCategory}
                            onChange={(e) => setEditingTask({...editingTask, editCategory: e.target.value})}
                            className="p-2 rounded bg-[#1a1f3e] border border-[#3a3f5e] text-white"
                          >
                            {taskCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          
                          <select
                            value={editingTask.editDueDate}
                            onChange={(e) => setEditingTask({...editingTask, editDueDate: e.target.value})}
                            className="p-2 rounded bg-[#1a1f3e] border border-[#3a3f5e] text-white"
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
                            className="px-3 py-1 rounded bg-[#1a1f3e] text-gray-400 hover:text-white"
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
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: getTaskCategoryColor(task.category) }}
                            ></div>
                            <p className={`font-medium ${task.completed ? "text-gray-400 line-through" : "text-white"}`}>
                              {task.title}
                            </p>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{task.dueDate}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => startEditTask(task)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-[#ff0066]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <p>Keine Aufgaben vorhanden</p>
                    <p className="text-sm mt-2">Klicke auf "Neu", um eine Aufgabe hinzuzufügen</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#2a2f4e] flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {tasks.filter((t) => t.completed).length} von {tasks.length} erledigt
              </span>
              {tasks.length > 5 && (
                <button 
                  onClick={() => setShowAllTasks(!showAllTasks)} 
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  {showAllTasks ? "Weniger anzeigen" : "Alle anzeigen"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </div>

          {/* Upcoming events - 1/3 width on large screens */}
          <div className="bg-[#1a1f3e] rounded-lg border border-[#2a2f4e] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[#2a2f4e]">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-[#3399ff] mr-2" />
                <h2 className="font-medium">Kommende Termine</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {upcomingEvents
                  .slice(0, showAllEvents ? upcomingEvents.length : 5)
                  .map((event) => (
                  <div key={event.id} className="p-3 bg-[#2a2f4e] rounded-md hover:bg-[#323752] transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: event.color }}></div>
                      <h3 className="font-medium text-white">{event.title}</h3>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      <span>
                        {event.date}, {event.time}
                      </span>
                    </div>
                  </div>
                ))}
                
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <p>Keine Termine vorhanden</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#2a2f4e] flex justify-between items-center">
              {upcomingEvents.length > 5 && (
                <button 
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Today's appointments */}
          <div className="bg-[#1a1f3e] rounded-lg border border-[#2a2f4e] p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 text-sm">Heute</h3>
                <p className="text-2xl font-bold mt-1">1 Termin</p>
              </div>
              <div className="bg-[#2a2f4e] p-2 rounded-full">
                <CalendarDays className="h-5 w-5 text-[#3399ff]" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#2a2f4e]">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#3399ff] mr-2"></div>
                <p className="text-sm">Meeting mit Marketing-Team</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">15:30 - 16:30</p>
            </div>
          </div>

          {/* Tasks progress */}
          <div className="bg-[#1a1f3e] rounded-lg border border-[#2a2f4e] p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 text-sm">Aufgaben</h3>
                <p className="text-2xl font-bold mt-1">20% erledigt</p>
              </div>
              <div className="bg-[#2a2f4e] p-2 rounded-full">
                <CheckSquare className="h-5 w-5 text-[#ff0066]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-[#2a2f4e] h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#ff0066] to-[#3399ff]" style={{ width: "20%" }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>1 von 5 erledigt</span>
                <span>4 ausstehend</span>
              </div>
            </div>
          </div>

          {/* Health intervals */}
          <div className="bg-[#1a1f3e] rounded-lg border border-[#2a2f4e] p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 text-sm">Gesundheitsintervalle</h3>
                <p className="text-2xl font-bold mt-1">Zahnarzt</p>
              </div>
              <div className="bg-[#2a2f4e] p-2 rounded-full">
                <Activity className="h-5 w-5 text-[#66cc66]" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#2a2f4e]">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#66cc66] mr-2"></div>
                <p className="text-sm">Nächster Termin fällig</p>
              </div>
              <div className="w-full bg-[#2a2f4e] h-2 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-gradient-to-r from-[#66cc66] to-[#88ee88]" style={{ width: "70%" }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Letzter Besuch: vor 4 Monaten</span>
                <span>70%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
