export type ChatMessage = {
  id: number;
  from: 'you' | 'maya';
  text: string;
  at: string; // ISO timestamp (UTC)
};

export type DaySummary = {
  date: string; // YYYY-MM-DD (user-local)
  label: string; // TODAY, TMRW, MON 23 …
  kind: 'today' | 'tomorrow' | 'past';
};

export type DayMacros = {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meals: number;
};

export interface ChatApi {
  listDays(): Promise<DaySummary[]>;
  listMessages(date: string): Promise<ChatMessage[]>;
  getMacros(date: string): Promise<DayMacros>;
  /** Sends a message and resolves with Maya's reply burst (1–3 messages). */
  sendMessage(date: string, text: string): Promise<ChatMessage[]>;
  /** Uploads a voice note; resolves with its transcript + Maya's replies. */
  sendVoice(
    date: string,
    blob: Blob,
    mime: string,
  ): Promise<{ transcript: ChatMessage; replies: ChatMessage[] }>;
}
