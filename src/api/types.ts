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

export interface ChatApi {
  listDays(): Promise<DaySummary[]>;
  listMessages(date: string): Promise<ChatMessage[]>;
  sendMessage(date: string, text: string): Promise<ChatMessage>;
}
