import apiClient from './client';
import { queryClient } from '../queryClient';

// ---------------------------------------------------------------------------
// Auth: email OTP -> JWT (ahara-engine /api/auth). Token storage/injection/
// expiry is handled by src/api/client.ts middleware.
// ---------------------------------------------------------------------------

export const TOKEN_KEY = 'access_token';

export interface AuthApi {
  /** Resolves with whether this email has an Ahara account. */
  requestOtp(email: string): Promise<{ registered: boolean }>;
  verifyOtp(email: string, code: string): Promise<{ access_token: string }>;
  /** Post-checkout auto-login: Stripe session id → JWT. */
  sessionLogin(sessionId: string): Promise<{ access_token: string }>;
}

export const authApi: AuthApi = {
  async requestOtp(email: string) {
    const { data } = await apiClient.post('/api/auth/request-otp', { email });
    return { registered: (data as { registered?: boolean }).registered !== false };
  },
  async verifyOtp(email: string, code: string) {
    const { data } = await apiClient.post('/api/auth/verify-otp', { email, code });
    return data as { access_token: string };
  },
  async sessionLogin(sessionId: string) {
    const { data } = await apiClient.post('/api/auth/session-login', {
      session_id: sessionId,
    });
    return data as { access_token: string };
  },
};

export const session = {
  isAuthed: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  start: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    // a fresh login must never inherit another account's cached queries
    queryClient.clear();
  },
  end: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.clear();
    queryClient.clear();
  },
};
