import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

export default function OTPVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Check if email and type are provided in URL params (from sign-up flow)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
      // If email is provided, skip to OTP step
      setStep('otp');
      setMessage('OTP has been sent to your email. Please check your inbox.');
    }
  }, [searchParams]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.sendOTP(email);
      setMessage(response.data.message);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.verifyOTP(email, otp);
      
      if (response.data.success && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        // Navigate based on whether it's sign-up or sign-in
        navigate('/log-meal');
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.sendOTP(email);
      setMessage(response.data.message);
      setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend OTP.');
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
          <p className="text-[#8B7355] text-sm">Verify your email</p>
        </div>

        {/* OTP Card */}
        <div className="bg-white/50 backdrop-blur-sm rounded-[24px] p-8 clay-shadow">
          {/* Back Button (only on OTP step) */}
          {step === 'otp' && (
            <button
              onClick={() => setStep('email')}
              className="flex items-center gap-2 text-[#8B7355] hover:text-[#6B5B95] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to email</span>
            </button>
          )}

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-[#FFE0E8] border-2 border-[#FFB3C1] rounded-[12px] text-[#8B7355] text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-[#D4F1E8] border-2 border-[#9FE2BF] rounded-[12px] text-[#6B5B95] text-sm">
              {message}
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#6B5B95] mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] placeholder-[#B4A093] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <p className="text-xs text-[#8B7355] mt-2 ml-1">
                  We'll send a verification code to this email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow clay-hover font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-[#8B7355] hover:text-[#6B5B95] transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-sm text-[#8B7355]">
                  Enter the 6-digit code sent to
                </p>
                <p className="font-semibold text-[#6B5B95] mt-1">{email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5B95] mb-2 ml-1">
                  Verification Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] placeholder-[#B4A093] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all text-center tracking-widest text-2xl font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-[#8B7355] mt-2 ml-1 text-center">
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-14 bg-gradient-to-r from-[#D4F1E8] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow clay-hover font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-[#8B7355] hover:text-[#6B5B95] transition-colors disabled:opacity-50"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-[#8B7355]">
            Need help? Contact us at{' '}
            <a href="mailto:hello@withahara.com" className="text-[#6B5B95] hover:underline">
              hello@withahara.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

