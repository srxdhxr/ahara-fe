import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { User, Lock, Mail } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sign In Form
  const [signInData, setSignInData] = useState({
    username: '',
    password: '',
  });

  // Sign Up Form
  const [signUpData, setSignUpData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.login({
        email: signInData.username,
        password: signInData.password,
      });
      navigate('/food-logs');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signUpData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      await api.register({
        name: signUpData.full_name,
        email: signUpData.email,
        password: signUpData.password,
      });
      
      // Send OTP for verification
      await api.sendOTP(signUpData.email);
      
      // Navigate to OTP verification page with email and sign-up context
      navigate(`/verify-otp?email=${encodeURIComponent(signUpData.email)}&type=signup`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Load Google OAuth script and initialize
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialize Google sign-in after script loads
      initializeGoogleSignIn();
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'your-google-client-id-here.apps.googleusercontent.com') {
      setError('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }

    try {
      // Wait for Google script to load
      const checkGoogle = () => {
        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            // @ts-ignore
            if (window.google?.accounts?.id) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      };

      await checkGoogle();

      // Initialize Google Sign-In
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          setError('');
          setIsLoading(true);
          try {
            await api.googleAuth(response.credential);
            navigate('/food-logs');
          } catch (err: any) {
            setError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
      });

      // Use renderButton instead of prompt
      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        // @ts-ignore
        window.google.accounts.id.renderButton(
          buttonElement,
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%'
          }
        );
      }
      
    } catch (err: any) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="/favicon.png" 
              alt="Ahara" 
              className="h-16 w-16 sm:h-20 sm:w-20"
            />
            <h1 className="text-5xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
              Ahara
            </h1>
          </div>
          <p className="text-[#8B7355] text-sm">Your nutrition companion</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/50 backdrop-blur-sm rounded-[24px] p-8 clay-shadow">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => {
                setActiveTab('signin');
                setError('');
              }}
              className={`flex-1 py-3 rounded-[16px] font-semibold transition-all duration-300 ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] clay-shadow'
                  : 'bg-white/30 text-[#8B7355]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`flex-1 py-3 rounded-[16px] font-semibold transition-all duration-300 ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] clay-shadow'
                  : 'bg-white/30 text-[#8B7355]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#FFE0E8] border-2 border-[#FFB3C1] rounded-[12px] text-[#8B7355] text-sm">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#6B5B95] mb-2 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="email"
                    value={signInData.username}
                    onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] placeholder-[#B4A093] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5B95] mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] placeholder-[#B4A093] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow clay-hover font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center mt-4 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E8DEFF]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white/50 text-[#8B7355]">OR</span>
                  </div>
                </div>
                
                <div id="google-signin-button" className="w-full"></div>

                <button
                  type="button"
                  onClick={() => navigate('/verify-otp')}
                  className="text-sm text-[#8B7355] hover:text-[#6B5B95] transition-colors"
                >
                  Sign in with OTP
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#6B5B95] mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="text"
                    value={signUpData.full_name}
                    onChange={(e) => setSignUpData({ ...signUpData, full_name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] placeholder-[#B4A093] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5B95] mb-2 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] placeholder-[#B4A093] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5B95] mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] placeholder-[#B4A093] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                </div>
                <p className="text-xs text-[#8B7355] mt-1 ml-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5B95] mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] placeholder-[#B4A093] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#D4F1E8] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow clay-hover font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}