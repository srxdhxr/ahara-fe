import apiClient from './client';

// ---------------------------------------------------------------------------
// Auth: email OTP -> JWT (ahara-engine /api/auth). Token storage/injection/
// expiry is handled by src/api/client.ts middleware.
// ---------------------------------------------------------------------------

export const TOKEN_KEY = 'access_token';

export interface AuthApi {
  requestOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<{ access_token: string }>;
}

export const authApi: AuthApi = {
  async requestOtp(email: string) {
    await apiClient.post('/api/auth/request-otp', { email });
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
