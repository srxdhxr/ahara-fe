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
  status: 'free' | 'trial' | 'paid' | 'cancelled';
  trial_ends_at: string | null; // ISO, set for signup trials
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


export type SubscriptionState = {
  status: string; // trialing | active | past_due ...
  auto_renew: boolean;
  period_end: number | null; // unix seconds; trial end while trialing
} | null;

export const billingApi = {
  async subscription(): Promise<SubscriptionState> {
    const { data } = await apiClient.get('/api/billing/subscription');
    return (data as { subscription: SubscriptionState }).subscription;
  },
  async setAutoRenew(enabled: boolean): Promise<SubscriptionState> {
    const { data } = await apiClient.post('/api/billing/auto-renew', { enabled });
    return (data as { subscription: SubscriptionState }).subscription;
  },
  /** Stripe Billing Portal — manage card, cancel, invoices. */
  async portal(): Promise<string> {
    const { data } = await apiClient.post('/api/billing/portal');
    return (data as { url: string }).url;
  },
  /** Re-subscribe checkout (pay today — trials are signup-only). */
  async checkout(): Promise<string> {
    const { data } = await apiClient.post('/api/billing/checkout');
    return (data as { url: string }).url;
  },
};
