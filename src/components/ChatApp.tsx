import { useEffect, useState } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import { userApi } from '../api/user';
import type { ChatMessage, DaySummary } from '../api/types';
import DateStrip from './DateStrip';
import ChatThread from './ChatThread';
import Composer from './Composer';

function summarize(date: string): DaySummary {
  const d = parseISO(date);
  if (isToday(d)) return { date, label: 'TODAY', kind: 'today' };
  if (isTomorrow(d)) return { date, label: 'TMRW', kind: 'tomorrow' };
  return { date, label: format(d, 'EEE d').toUpperCase(), kind: 'past' };
}

export default function ChatApp() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  // Keep the server's notion of the user's timezone honest — signups default
  // to America/Los_Angeles, which makes Maya talk about dinner at 3am for
  // east-coast users. The browser knows the truth; sync it once per load.
  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!browserTz) return;
    userApi
      .getMe()
      .then((me) => {
        if (me.timezone !== browserTz) return userApi.updateMe({ timezone: browserTz });
      })
      .catch(() => {
        // non-fatal — worst case the server keeps its stored timezone
      });
  }, []);

  const { data: days = [] } = useQuery({
    queryKey: ['days'],
    queryFn: () => chatApi.listDays(),
  });

  const activeDate = selected ?? days[0]?.date ?? null;
  // Calendar picks can land outside the strip's window — synthesize a summary
  const activeDay = activeDate
    ? (days.find((d) => d.date === activeDate) ?? summarize(activeDate))
    : null;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', activeDate],
    queryFn: () => chatApi.listMessages(activeDate!),
    enabled: activeDate !== null,
  });

  const send = async (text: string) => {
    if (!activeDate) return;
    const optimistic: ChatMessage = {
      id: -Date.now(),
      from: 'you',
      text,
      at: new Date().toISOString(),
    };
    queryClient.setQueryData<ChatMessage[]>(['messages', activeDate], (old = []) => [
      ...old,
      optimistic,
    ]);
    setTyping(true);
    try {
      const replies = await chatApi.sendMessage(activeDate, text);
      queryClient.setQueryData<ChatMessage[]>(['messages', activeDate], (old = []) => [
        ...old,
        ...replies,
      ]);
      // Re-sync with the server (ids for the optimistic message, ordering)
      await queryClient.invalidateQueries({ queryKey: ['messages', activeDate] });
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        // duplicate send — the first copy is still processing; poll for it
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['messages', activeDate] });
        }, 8000);
      } else {
        await queryClient.invalidateQueries({ queryKey: ['messages', activeDate] });
      }
    } finally {
      setTyping(false);
    }
  };

  return (
    // h-dvh (not min-h): the panel is a fixed viewport-height app shell —
    // the THREAD scrolls internally, the page itself never grows.
    <div className="dot-grid-faint flex h-dvh items-stretch justify-center sm:items-center sm:py-8">
      <div className="flex h-full w-full flex-col overflow-hidden border-ink bg-cream sm:h-[min(85dvh,800px)] sm:max-w-md sm:border-[3px] sm:shadow-pixel">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-lavender px-4 py-2">
          <span className="font-pixel text-[10px] tracking-widest">MAYA · AHARA</span>
          <button
            aria-label="Settings"
            onClick={() => navigate('/settings')}
            className="pixel-press border-[2px] border-ink bg-cream p-1 text-ink shadow-pixel-sm focus:outline-none focus-visible:bg-lavender"
          >
            <Settings size={14} strokeWidth={2.5} />
          </button>
        </div>

        {activeDay && (
          <DateStrip days={days} selected={activeDay.date} onSelect={setSelected} />
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {activeDay ? (
            <ChatThread
              messages={messages}
              day={activeDay}
              loading={isLoading}
              typing={typing}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="cursor-blink font-pixel text-xs tracking-widest text-brown">
                LOADING
              </div>
            </div>
          )}
        </div>

        <Composer onSend={send} disabled={typing || !activeDay} />
      </div>
    </div>
  );
}
