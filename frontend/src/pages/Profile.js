import React, { useState, useEffect } from 'react';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  User,
  Mail,
  Image,
  Save,
  Clock,
  Info,
  Edit3,
  Camera,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const Profile = () => {
  const { mode } = useAppTheme();
  const { currentUser, updateUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    profile_picture: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Benutzerinformationen über API laden
        const response = await api.get('/api/auth/me');
        console.log('Benutzerdaten API-Antwort:', response.data);
        
        // Prüfe speziell das created_at-Feld
        if (response.data.user && response.data.user.created_at) {
          console.log('created_at-Feld vorhanden:', response.data.user.created_at);
          console.log('Datum-Objekt aus created_at:', new Date(response.data.user.created_at));
        } else {
          console.warn('created_at-Feld fehlt in der API-Antwort');
        }
        
        setUserData(response.data.user);
        setEditData({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          profile_picture: response.data.user.profile_picture || ''
        });
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
        setMessage({
          text: 'Fehler beim Laden der Benutzerdaten',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Zurücksetzen der Bearbeitungsdaten auf aktuelle Werte
    setEditData({
      name: userData?.name || '',
      email: userData?.email || '',
      profile_picture: userData?.profile_picture || ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Profilaktualisierung an API senden
      const response = await api.put('/api/users/profile', editData);
      
      // Benutzerdaten aktualisieren
      setUserData({
        ...userData,
        ...editData
      });
      
      // Auth-Kontext aktualisieren
      if (updateUserData) {
        updateUserData({
          ...editData
        });
      }
      
      // Bearbeitungsmodus beenden
      setIsEditing(false);
      
      setMessage({
        text: 'Profil erfolgreich aktualisiert',
        type: 'success'
      });
      
      // Nachricht nach 3 Sekunden ausblenden
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Profils:', error);
      setMessage({
        text: 'Fehler beim Aktualisieren des Profils',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({
          ...editData,
          profile_picture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1120] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3399ff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      backgroundColor: mode === 'dark' ? "#0f1120" : "#f8fafc",
      color: mode === 'dark' ? "#ffffff" : "#1e293b",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif",
    }}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Mein Profil</h1>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'}`}>
            {message.text}
          </div>
        )}
        
        <div className={`rounded-lg p-6 ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#2a2f4e]' : 'bg-white border-gray-100'} border`}>
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
              {isEditing ? (
                <div className="relative w-32 h-32">
                  <div 
                    className="w-32 h-32 rounded-full bg-cover bg-center"
                    style={{ 
                      backgroundImage: editData.profile_picture ? 
                        `url(${editData.profile_picture})` : 
                        'none',
                      backgroundColor: editData.profile_picture ? 'transparent' : '#3a4166',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {!editData.profile_picture && <User size={48} color="#8892b0" />}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-[#3399ff] rounded-full p-2 cursor-pointer hover:bg-[#3399ff]/80">
                    <Camera className="h-5 w-5 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              ) : (
                <div 
                  className="w-32 h-32 rounded-full bg-cover bg-center border-4 border-[#3399ff]/20"
                  style={{ 
                    backgroundImage: userData?.profile_picture ? 
                      `url(${userData.profile_picture})` : 
                      'none',
                    backgroundColor: userData?.profile_picture ? 'transparent' : '#3a4166',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!userData?.profile_picture && <User size={48} color="#8892b0" />}
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm mb-1 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                      className={`w-full p-2 rounded ${mode === 'dark' ? 'bg-[#0f1120] border-[#2a2f4e] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm mb-1 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>E-Mail</label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      className={`w-full p-2 rounded ${mode === 'dark' ? 'bg-[#0f1120] border-[#2a2f4e] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-1">{userData?.name || 'Kein Name angegeben'}</h2>
                  <div className={`flex items-center mb-4 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{userData?.email}</span>
                  </div>
                  <div className={`text-sm ${mode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Mitglied seit: {userData?.created_at 
                        ? format(new Date(userData.created_at), 'dd.MM.yyyy', { locale: de }) 
                        : 'Unbekannt'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700/20 flex justify-end">
            {isEditing ? (
              <div className="space-x-3">
                <button
                  onClick={handleCancel}
                  className={`px-4 py-2 rounded ${mode === 'dark' ? 'bg-[#2a2f4e] text-gray-300 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded bg-gradient-to-r from-[#ff0066] to-[#3399ff] text-white"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Speichern...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-4 h-4 mr-1" />
                      Speichern
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded bg-gradient-to-r from-[#ff0066] to-[#3399ff] text-white"
              >
                <Edit3 className="w-4 h-4 inline mr-1" />
                Profil bearbeiten
              </button>
            )}
          </div>
        </div>
        
        <div className={`mt-8 rounded-lg p-6 ${mode === 'dark' ? 'bg-[#1a1f3e] border-[#2a2f4e]' : 'bg-white border-gray-100'} border`}>
          <h2 className="text-xl font-bold mb-4">Kontodetails</h2>
          
          <div className={`grid gap-4 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-start">
              <div className={`p-2 rounded-lg ${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-100'} mr-3`}>
                <User className="w-5 h-5 text-[#3399ff]" />
              </div>
              <div>
                <h3 className="font-medium">Account-Typ</h3>
                <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {userData?.google_id ? 'Google-Konto' : 'Standard-Konto'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className={`p-2 rounded-lg ${mode === 'dark' ? 'bg-[#2a2f4e]' : 'bg-gray-100'} mr-3`}>
                <Info className="w-5 h-5 text-[#ff0066]" />
              </div>
              <div>
                <h3 className="font-medium">Datenschutz und Sicherheit</h3>
                <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Verwalte deine Datenschutzeinstellungen in den <a href="/settings" className="text-[#3399ff] hover:underline">Einstellungen</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 