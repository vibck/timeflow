import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert } from '@mui/material';
import { Eye, EyeOff, Lock } from "lucide-react";
import api from '../utils/api';

const passwordStrength = password => {
  if (!password) return 0;
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return Math.min(strength, 5);
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const token = searchParams.get('token');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/reset-password', { 
        token, 
        newPassword 
      });
      setSuccess('Passwort erfolgreich aktualisiert! Du kannst dich jetzt anmelden.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Zurücksetzen des Passworts');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = strength => {
    if (strength >= 4) return 'bg-green-500';
    if (strength >= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1e]">
        <Alert severity="error" className="max-w-md">
          Ungültiger oder fehlender Reset-Token
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0f1e]">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1a1f3e] to-[#0a0f1e] opacity-80"></div>

      {/* Decorative elements */}
      {mounted && (
        <>
          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className="absolute top-[10%] left-[20%] w-32 h-32 rounded-full bg-[#ff0066] blur-[80px] opacity-20"
              style={{
                animation: "pulse 8s infinite alternate",
              }}
            />
            <div
              className="absolute top-[40%] right-[10%] w-40 h-40 rounded-full bg-[#3399ff] blur-[100px] opacity-20"
              style={{
                animation: "pulse 10s infinite alternate",
              }}
            />
            <div
              className="absolute bottom-[15%] left-[30%] w-36 h-36 rounded-full bg-[#9f7aea] blur-[90px] opacity-20"
              style={{
                animation: "pulse 9s infinite alternate",
              }}
            />
          </div>

          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-lg opacity-10 bg-white"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 30 - 15}deg)`,
                  animation: `float ${Math.random() * 20 + 20}s infinite alternate ease-in-out`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1a1f3e]/40 backdrop-blur-xl p-8 flex items-center justify-center">
            {mounted ? (
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Passwort zurücksetzen</h2>
                  <p className="text-gray-400 mt-2">Gib ein neues Passwort für dein Konto ein</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert severity="error" className="mb-4">
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" className="mb-4">
                      {success}
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-300 flex items-center">
                      Neues Passwort *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10 pr-10 bg-[#1a1f3e]/50 border-[#ffffff20] text-white focus:border-[#3399ff] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-1">
                        <div className="flex h-1 mt-1 overflow-hidden rounded-full bg-gray-800">
                          <div 
                            className={`${getPasswordStrengthColor(passwordStrength(newPassword))}`} 
                            style={{ width: `${passwordStrength(newPassword) * 20}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          {passwordStrength(newPassword) <= 2 && "Schwach"}
                          {passwordStrength(newPassword) > 2 && passwordStrength(newPassword) < 4 && "Mittel"}
                          {passwordStrength(newPassword) >= 4 && "Stark"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 flex items-center">
                      Passwort bestätigen *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10 pr-10 bg-[#1a1f3e]/50 border-[#ffffff20] text-white focus:border-[#3399ff] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-[#ff0066] to-[#3399ff] hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#3399ff]/20"
                  >
                    {isLoading ? 'Wird aktualisiert...' : 'Passwort speichern'}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="w-full">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
                  <div className="space-y-6">
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 0.3; transform: translateY(15px); }
          100% { opacity: 0.2; transform: translateY(0); }
        }
        
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(20px) rotate(5deg); }
          100% { transform: translateY(-20px) rotate(-5deg); }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;