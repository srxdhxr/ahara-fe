// ---------------------------------------------------------------------------
// User profile / health / preferences API, shaped to the ahara-engine User
// model (models/user.py) and onboarding facts (allergies, medications, goals).
// Mock persists to localStorage until the engine exposes profile endpoints.
// ---------------------------------------------------------------------------

export type Goal =
  | 'lose_weight'
  | 'gain_muscle'
  | 'eat_more_protein'
  | 'eat_better'
  | 'manage_glp1'
  | 'other';

export const GOAL_LABELS: Record<Goal, string> = {
  lose_weight: 'LOSE WEIGHT',
  gain_muscle: 'GAIN MUSCLE',
  eat_more_protein: 'MORE PROTEIN',
  eat_better: 'EAT BETTER',
  manage_glp1: 'MANAGE GLP-1',
  other: 'OTHER',
};

export type UserProfile = {
  first_name: string;
  email: string;
  phone_number: string;
  timezone: string;
};

export type HealthData = {
  sex: 'M' | 'F' | '';
  age: number | null;
  weight_lb: number | null;
  height_in: number | null;
};

export type Preferences = {
  allergies: string[];
  medications: string[];
  goals: Goal[];
};

export interface UserApi {
  getProfile(): Promise<UserProfile>;
  updateProfile(p: UserProfile): Promise<void>;
  getHealth(): Promise<HealthData>;
  updateHealth(h: HealthData): Promise<void>;
  getPreferences(): Promise<Preferences>;
  updatePreferences(p: Preferences): Promise<void>;
}

const USE_MOCK = true;
const KEY = 'mock_user_v1';

type MockUser = { profile: UserProfile; health: HealthData; prefs: Preferences };

const defaults: MockUser = {
  profile: {
    first_name: 'Sridhar',
    email: 'you@example.com',
    phone_number: '+15551234567',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  health: { sex: 'M', age: 27, weight_lb: 165, height_in: 70 },
  prefs: { allergies: [], medications: [], goals: ['eat_more_protein'] },
};

const load = (): MockUser => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    // corrupted — fall through to defaults
  }
  return defaults;
};

const save = (u: MockUser) => localStorage.setItem(KEY, JSON.stringify(u));

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockUser: UserApi = {
  async getProfile() {
    await wait(120);
    return load().profile;
  },
  async updateProfile(profile) {
    await wait(200);
    save({ ...load(), profile });
  },
  async getHealth() {
    await wait(120);
    return load().health;
  },
  async updateHealth(health) {
    await wait(200);
    save({ ...load(), health });
  },
  async getPreferences() {
    await wait(120);
    return load().prefs;
  },
  async updatePreferences(prefs) {
    await wait(200);
    save({ ...load(), prefs });
  },
};

export const userApi: UserApi = USE_MOCK ? mockUser : mockUser;
