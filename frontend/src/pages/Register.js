import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Alert } from '@mui/material';
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const validateEmail = email => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

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

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    setIsLoading(true);

    if (!name) {
      setError('Bitte gib deinen Namen ein.');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Bitte gib eine gültige E-Mail-Adresse ein');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setPasswordError('Das Passwort muss mindestens 8 Zeichen lang sein');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein');
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('Bitte stimme den Nutzungsbedingungen zu, um fortzufahren');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      navigate('/login', {
        state: {
          message: 'Registrierung erfolgreich! Du kannst dich jetzt anmelden.'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message ||
        'Bei der Registrierung ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = strength => {
    if (strength >= 4) return 'bg-green-500';
    if (strength >= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl">
          {/* Left panel - Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-[#1a1f3e]/80 to-[#0d1025]/80 backdrop-blur-xl p-8 lg:p-12 flex flex-col justify-center relative border-r border-white/10">
            <div className="relative z-10 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Willkommen bei{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0066] to-[#3399ff]">
                  TimeFlow
                </span>
              </h2>

              <p className="text-gray-300 text-lg max-w-md mx-auto lg:mx-0">
                Erstelle ein Konto und starte noch heute. Organisiere deinen Zeitplan und steigere deine Produktivität.
              </p>
            </div>
          </div>

          {/* Right panel - Register form */}
          <div className="lg:w-1/2 bg-[#1a1f3e]/40 backdrop-blur-xl p-8 lg:p-12 flex items-center justify-center">
            {mounted ? (
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Registrierung</h2>
                  <p className="text-gray-400 mt-2">Erstelle ein Konto, um loszulegen</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  {error && (
                    <Alert severity="error" className="mb-4">
                      {error}
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-300 flex items-center">
                      Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Max Mustermann"
                        required
                        className="pl-10 bg-[#1a1f3e]/50 border-[#ffffff20] text-white focus:border-[#3399ff] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-300 flex items-center">
                      E-Mail-Adresse *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                        className={`pl-10 bg-[#1a1f3e]/50 border-[#ffffff20] text-white focus:border-[#3399ff] transition-colors ${emailError ? 'border-red-500' : ''}`}
                      />
                      {emailError && (
                        <p className="text-sm text-red-500 mt-1">{emailError}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300 flex items-center">
                      Passwort *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10 pr-10 bg-[#1a1f3e]/50 border-[#ffffff20] text-white focus:border-[#3399ff] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-1">
                        <div className="flex h-1 mt-1 overflow-hidden rounded-full bg-gray-800">
                          <div 
                            className={`${getPasswordStrengthColor(passwordStrength(password))}`} 
                            style={{ width: `${passwordStrength(password) * 20}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          {passwordStrength(password) <= 2 && "Schwach"}
                          {passwordStrength(password) > 2 && passwordStrength(password) < 4 && "Mittel"}
                          {passwordStrength(password) >= 4 && "Stark"}
                        </p>
                      </div>
                    )}
                    {passwordError && (
                      <p className="text-sm text-red-500 mt-1">{passwordError}</p>
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

                  <div className="flex items-center">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                      className="border-[#ffffff30] data-[state=checked]:bg-[#3399ff] data-[state=checked]:border-[#3399ff]"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                      Ich stimme den{" "}
                      <Link to="/terms" className="text-[#3399ff] hover:text-white transition-colors">
                        Nutzungsbedingungen
                      </Link>{" "}
                      und{" "}
                      <Link to="/privacy" className="text-[#3399ff] hover:text-white transition-colors">
                        Datenschutzrichtlinien
                      </Link>{" "}
                      zu
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-[#ff0066] to-[#3399ff] hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#3399ff]/20"
                  >
                    {isLoading ? 'Wird registriert...' : 'Registrieren'}
                  </Button>

                  <div className="text-center text-sm text-gray-400">
                    Bereits registriert?{" "}
                    <Link to="/login" className="text-[#3399ff] hover:text-white transition-colors">
                      Anmelden
                    </Link>
                  </div>
                </form>

                <div className="flex justify-center space-x-4 mt-8 text-xs text-gray-500">
                  <Link to="/terms" className="hover:text-gray-300 transition-colors">
                    AGB
                  </Link>
                  <Link to="/support" className="hover:text-gray-300 transition-colors">
                    Support
                  </Link>
                  <Link to="/care" className="hover:text-gray-300 transition-colors">
                    Kundenservice
                  </Link>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
                  <div className="space-y-6">
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-5 bg-gray-700 rounded w-1/3"></div>
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

export default Register;