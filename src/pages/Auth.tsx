import React, { useState } from 'react';
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
                    required
                  />
                </div>
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

