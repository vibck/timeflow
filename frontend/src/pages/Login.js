import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Alert } from '@mui/material';
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const validateEmail = email => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    if (location.state && location.state.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setSuccess('');
    setIsLoading(true);

    if (!validateEmail(email)) {
      setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      setSuccess('Erfolgreich angemeldet!');
    } catch (err) {
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
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
                Willkommen zurück bei{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0066] to-[#3399ff]">
                  TimeFlow
                </span>
              </h2>

              <p className="text-gray-300 text-lg max-w-md mx-auto lg:mx-0">
                Ihre persönliche Zeitmanagement-Lösung. Organisieren Sie Ihren Zeitplan und steigern Sie Ihre Produktivität.
              </p>
            </div>
          </div>

          {/* Right panel - Login form */}
          <div className="lg:w-1/2 bg-[#1a1f3e]/40 backdrop-blur-xl p-8 lg:p-12 flex items-center justify-center">
            {mounted ? (
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Login</h2>
                  <p className="text-gray-400 mt-2">Schön, dass Sie wieder da sind!</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
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
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-gray-300">
                        Passwort *
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        Passwort vergessen?
                      </Link>
                    </div>
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
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className="border-[#ffffff30] data-[state=checked]:bg-[#3399ff] data-[state=checked]:border-[#3399ff]"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                      Angemeldet bleiben
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-[#ff0066] to-[#3399ff] hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#3399ff]/20"
                  >
                    {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                  </Button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-[#ffffff20] w-full"></div>
                    <span className="bg-[#1a1f3e]/40 backdrop-blur-xl px-2 text-sm text-gray-400 absolute">Oder</span>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      aria-label="Mit Google anmelden"
                    >
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-400">
                    Noch kein Konto?{" "}
                    <Link to="/register" className="text-[#3399ff] hover:text-white transition-colors">
                      Registrieren
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

export default Login;
