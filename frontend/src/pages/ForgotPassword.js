import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert } from '@mui/material';
import { Mail } from "lucide-react";
import api from '../utils/api';

const validateEmail = email => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess('Wenn ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet. Bitte überprüfen Sie Ihren Posteingang (einschließlich des Spam-Ordners).');
      setEmail('');
    } catch (err) {
      setError('Anfrage fehlgeschlagen. Bitte versuchen Sie es später erneut.');
      console.error('Forgot Password Error:', err);
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
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1a1f3e]/40 backdrop-blur-xl p-8 flex items-center justify-center">
            {mounted ? (
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Passwort vergessen?</h2>
                  <p className="text-gray-400 mt-2">Geben Sie Ihre E-Mail-Adresse ein, und wir senden Ihnen einen Link zum Zurücksetzen des Passworts</p>
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
                        className="pl-10 bg-[#1a1f3e]/50 border-[#ffffff20] text-white focus:border-[#3399ff] transition-colors"
                    />
                    </div>
                  </div>

                    <Button
                      type="submit"
                    disabled={isLoading || !!success}
                    className="w-full h-11 bg-gradient-to-r from-[#ff0066] to-[#3399ff] hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#3399ff]/20"
                  >
                    {isLoading ? 'Wird gesendet...' : 'Zurücksetzen-Link senden'}
                    </Button>

                  <div className="text-center text-sm text-gray-400">
                    Erinnern Sie sich an Ihr Passwort?{" "}
                    <Link to="/login" className="text-[#3399ff] hover:text-white transition-colors">
                        Zurück zur Anmeldung
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
              <div className="w-full">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
                  <div className="space-y-6">
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

export default ForgotPassword;
