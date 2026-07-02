import apiClient from './client';

// ---------------------------------------------------------------------------
// Auth: email OTP -> JWT (ahara-engine /api/auth). Token storage/injection/
// expiry is handled by src/api/client.ts middleware.
// ---------------------------------------------------------------------------

export const TOKEN_KEY = 'access_token';

export interface AuthApi {
  /** Resolves with whether this email has an Ahara account. */
  requestOtp(email: string): Promise<{ registered: boolean }>;
  verifyOtp(email: string, code: string): Promise<{ access_token: string }>;
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
};

export const session = {
  isAuthed: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  start: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  end: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.clear();
  },
};
