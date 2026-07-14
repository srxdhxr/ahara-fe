import apiClient from './client';
import { TOKEN_KEY } from './auth';
import type { ChatApi, ChatMessage, DayMacros, DaySummary } from './types';

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

  async getMacros(date: string): Promise<DayMacros> {
    const { data } = await apiClient.get('/api/chat/macros', { params: { date } });
    return data as DayMacros;
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

/**
 * Streaming send: resolves with all replies, invoking onReply the moment
 * each message lands (SSE). Falls back to the buffered endpoint if the
 * stream can't be established.
 */
export interface AgentStep {
  kind: string;
  label: string;
  total?: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
}

export async function sendMessageStreaming(
  date: string,
  text: string,
  onReply: (text: string) => void,
  onStep?: (step: AgentStep) => void,
): Promise<ChatMessage[]> {
  const base = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
  const res = await fetch(`${base}/api/chat/message/stream`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ''}`,
    },
    body: JSON.stringify({ text, date }),
  });
  if (!res.ok || !res.body) {
    if (res.status === 409) throw Object.assign(new Error('dup'), { response: { status: 409 } });
    return chatApi.sendMessage(date, text); // old endpoint fallback
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let done: ChatMessage[] | null = null;
  for (;;) {
    const { value, done: eof } = await reader.read();
    if (eof) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      if (!frame.startsWith('data: ')) continue; // keepalive comment
      const ev = JSON.parse(frame.slice(6));
      if (ev.type === 'reply') onReply(ev.text);
      else if (ev.type === 'step') onStep?.(ev as AgentStep);
      else if (ev.type === 'done') done = ev.replies as ChatMessage[];
      else if (ev.type === 'error') throw new Error('stream error');
    }
    if (done) break;
  }
  if (done === null) throw new Error('stream ended early');
  return done;
}
