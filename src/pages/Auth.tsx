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
      await api.register({
        name: signUpData.full_name,
        email: signUpData.email,
        password: signUpData.password,
      });
      
      // Auto-login after registration
      await api.login({
        email: signUpData.email,
        password: signUpData.password,
      });
      
      navigate('/food-logs');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Google OAuth script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'your-google-client-id-here.apps.googleusercontent.com') {
      setError('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      setIsLoading(false);
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
          try {
            await api.googleAuth(response.credential);
            navigate('/food-logs');
          } catch (err: any) {
            console.error('Backend auth error:', err);
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
        
        // Trigger the button programmatically
        setTimeout(() => {
          const clickableButton = buttonElement.querySelector('div[role="button"]') as HTMLElement;
          if (clickableButton) {
            clickableButton.click();
          }
        }, 100);
      } else {
        // Fallback: use prompt if button element not found
        // @ts-ignore
        window.google.accounts.id.prompt();
      }
      
    } catch (err: any) {
      console.error('Google sign-in initialization error:', err);
      setError('Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
            Ahara
          </h1>
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
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 h-12 bg-white border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] font-semibold hover:bg-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>

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

