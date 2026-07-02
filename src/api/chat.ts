import { format, subDays, addDays } from 'date-fns';
import type { ChatApi, ChatMessage, DaySummary } from './types';

// ---------------------------------------------------------------------------
// Mock chat API. Keep components programmed against the `ChatApi` interface —
// swapping this for the real FastAPI backend (ahara-engine) means implementing
// the same three methods on top of src/api/client.ts and flipping USE_MOCK.
// ---------------------------------------------------------------------------

const USE_MOCK = true;

const day = (offset: number) => format(subDays(new Date(), offset), 'yyyy-MM-dd');
const tomorrow = () => format(addDays(new Date(), 1), 'yyyy-MM-dd');

const at = (dateOffset: number, h: number, m: number) => {
  const d = subDays(new Date(), dateOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

let nextId = 1000;

// Seeded, believable nutrition-chat history keyed by local date
const seed: Record<string, ChatMessage[]> = {
  [day(0)]: [
    { id: 1, from: 'maya', text: 'morning. breakfast plans', at: at(0, 8, 4) },
    { id: 2, from: 'you', text: 'two eggs and sourdough toast with butter', at: at(0, 8, 31) },
    { id: 3, from: 'maya', text: 'eggs and toast, solid start — ~380 cal, 16g protein', at: at(0, 8, 31) },
    { id: 4, from: 'you', text: 'chicken burrito for lunch', at: at(0, 12, 47) },
    { id: 5, from: 'maya', text: 'nice — roughly 650 cal, ~40g protein. solid lunch', at: at(0, 12, 48) },
    { id: 6, from: 'maya', text: "you're at 56g protein. dinner's the move for the rest", at: at(0, 12, 48) },
  ],
  [day(1)]: [
    { id: 11, from: 'you', text: 'greek yogurt with honey and walnuts', at: at(1, 7, 52) },
    { id: 12, from: 'maya', text: 'got it — ~320 cal, 18g protein. good base', at: at(1, 7, 53) },
    { id: 13, from: 'you', text: 'big caesar salad with grilled chicken for lunch', at: at(1, 13, 5) },
    { id: 14, from: 'maya', text: 'lands ~550, protein at 45g for the day', at: at(1, 13, 6) },
    { id: 15, from: 'you', text: 'how am i doing today', at: at(1, 17, 30) },
    { id: 16, from: 'maya', text: '870 so far, ~55g protein. dinner has room — even 30g chicken closes the gap', at: at(1, 17, 30) },
    { id: 17, from: 'you', text: 'salmon and rice for dinner', at: at(1, 19, 22) },
    { id: 18, from: 'maya', text: "got the salmon, that's a clean dinner. day landed ~1580, protein hit", at: at(1, 19, 23) },
  ],
  [day(2)]: [
    { id: 21, from: 'you', text: 'skipped breakfast, black coffee only', at: at(2, 9, 15) },
    { id: 22, from: 'maya', text: 'noted. i’ll be quiet till lunch', at: at(2, 9, 15) },
    { id: 23, from: 'you', text: 'pasta with red sauce and meatballs', at: at(2, 13, 40) },
    { id: 24, from: 'maya', text: 'yeah pasta with meatballs — lands ~780, 35g protein', at: at(2, 13, 41) },
  ],
  [day(3)]: [],
  [day(4)]: [
    { id: 41, from: 'you', text: 'protein shake after the gym', at: at(4, 10, 2) },
    { id: 42, from: 'maya', text: 'quick 25g protein, noted', at: at(4, 10, 2) },
  ],
  [tomorrow()]: [],
};

const replies = [
  "got it — that's roughly {cal} cal, ~{p}g protein",
  "logged. you're pacing well today",
  'nice — solid choice. anything else with it',
  "noted. that puts you around {cal} for the day",
  'got the {food}, clean pick',
];

function fakeReply(text: string): string {
  const lower = text.toLowerCase();
  if (/how|doing|total|left|much/.test(lower)) {
    return "you're at ~1,240 today with ~560 to spare. protein's at 62g — dinner's the protein move";
  }
  const template = replies[Math.floor(Math.random() * replies.length)];
  const food = lower.split(' ').slice(0, 3).join(' ');
  return template
    .replace('{cal}', String(350 + Math.floor(Math.random() * 400)))
    .replace('{p}', String(15 + Math.floor(Math.random() * 30)))
    .replace('{food}', food);
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockApi: ChatApi = {
  async listDays(): Promise<DaySummary[]> {
    await wait(150);
    const days: DaySummary[] = [
      { date: day(0), label: 'TODAY', kind: 'today' },
      { date: tomorrow(), label: 'TMRW', kind: 'tomorrow' },
    ];
    for (let i = 1; i <= 6; i++) {
      const d = subDays(new Date(), i);
      days.push({ date: day(i), label: format(d, 'EEE d').toUpperCase(), kind: 'past' });
    }
    return days;
  },

  async listMessages(date: string): Promise<ChatMessage[]> {
    await wait(200);
    return [...(seed[date] ?? [])];
  },

  async sendMessage(date: string, text: string): Promise<ChatMessage> {
    const yours: ChatMessage = { id: nextId++, from: 'you', text, at: new Date().toISOString() };
    seed[date] = [...(seed[date] ?? []), yours];
    await wait(800); // Maya "typing"
    const reply: ChatMessage = { id: nextId++, from: 'maya', text: fakeReply(text), at: new Date().toISOString() };
    seed[date] = [...seed[date], reply];
    return reply;
  },
};

// Real implementation lands here once ahara-engine grows /api/chat endpoints.
export const chatApi: ChatApi = USE_MOCK ? mockApi : mockApi;
