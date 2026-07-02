import apiClient from './client';
import type { ChatApi, ChatMessage, DaySummary } from './types';

// ---------------------------------------------------------------------------
// Chat API over ahara-engine /api/chat. Days/labels are computed server-side
// in the user's timezone; sendMessage waits for Maya's reply burst.
// ---------------------------------------------------------------------------

export const chatApi: ChatApi = {
  async listDays(): Promise<DaySummary[]> {
    const { data } = await apiClient.get('/api/chat/days');
    return data as DaySummary[];
  },

  async listMessages(date: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get('/api/chat/messages', { params: { date } });
    return data as ChatMessage[];
  },

  async sendMessage(date: string, text: string): Promise<ChatMessage[]> {
    // Agent runs synchronously server-side — can take ~30s on tool-heavy turns
    const { data } = await apiClient.post(
      '/api/chat/message',
      { text, date },
      { timeout: 90000 },
    );
    return (data as { replies: ChatMessage[] }).replies;
  },

  async sendVoice(
    date: string,
    blob: Blob,
    mime: string,
  ): Promise<{ transcript: ChatMessage; replies: ChatMessage[] }> {
    const form = new FormData();
    const ext = mime.includes('mp4') ? 'm4a' : 'webm';
    form.append('audio', blob, `note.${ext}`);
    form.append('date', date);
    const { data } = await apiClient.post('/api/chat/voice', form, { timeout: 120000 });
    return data as { transcript: ChatMessage; replies: ChatMessage[] };
  },
};
