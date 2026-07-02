// ---------------------------------------------------------------------------
// Auth API. Mock for now — ahara-engine has no session endpoints yet. The
// interface is what the engine will implement (email OTP, mirroring its
// email-verification onboarding). Swap USE_MOCK when the endpoints exist.
// Token storage/injection/expiry is handled by src/api/client.ts middleware.
// ---------------------------------------------------------------------------

export const TOKEN_KEY = 'access_token';

export interface AuthApi {
  requestOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<{ access_token: string }>;
}

const USE_MOCK = true;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockAuth: AuthApi = {
  async requestOtp(email: string) {
    await wait(500);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error('enter a valid email');
    }
  },
  async verifyOtp(_email: string, code: string) {
    await wait(500);
    if (!/^\d{6}$/.test(code)) {
      throw new Error('code is 6 digits');
    }
    // DEMO ONLY: any 6-digit code passes. Real verification happens
    // server-side once ahara-engine exposes /auth endpoints.
    return { access_token: `demo.${crypto.randomUUID()}` };
  },
};

export const authApi: AuthApi = USE_MOCK ? mockAuth : mockAuth;

export const session = {
  isAuthed: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  start: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  end: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.clear();
  },
};
