import apiClient from './client';

// ---------------------------------------------------------------------------
// Profile / health / preferences over ahara-engine /api/me. email and
// phone_number are read-only server-side (login + SMS identity).
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

export const KNOWN_GOALS = Object.keys(GOAL_LABELS) as Goal[];

export type Me = {
  first_name: string;
  email: string; // read-only
  phone_number: string; // read-only
  timezone: string;
  sex: 'M' | 'F' | '';
  age: number | null;
  weight_lb: number | null;
  height_in: number | null;
};

export type MeUpdate = Partial<
  Pick<Me, 'first_name' | 'timezone' | 'sex' | 'age' | 'weight_lb' | 'height_in'>
>;

export type Preferences = {
  allergies: string[];
  medications: string[];
  // Server stores goals as free-text facts; onboarding may have written
  // sentences, the web app writes Goal keys. Treat as strings, render known
  // keys as toggles and the rest as removable pills.
  goals: string[];
};

export const userApi = {
  async getMe(): Promise<Me> {
    const { data } = await apiClient.get('/api/me');
    return data as Me;
  },
  async updateMe(update: MeUpdate): Promise<Me> {
    const { data } = await apiClient.put('/api/me', update);
    return data as Me;
  },
  async getPreferences(): Promise<Preferences> {
    const { data } = await apiClient.get('/api/me/preferences');
    return data as Preferences;
  },
  async updatePreferences(prefs: Preferences): Promise<Preferences> {
    const { data } = await apiClient.put('/api/me/preferences', prefs);
    return data as Preferences;
  },
};
