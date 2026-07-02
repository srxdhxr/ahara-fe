import { useState } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
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
      await chatApi.sendMessage(activeDate, text);
      await queryClient.invalidateQueries({ queryKey: ['messages', activeDate] });
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="dot-grid-faint flex min-h-dvh items-stretch justify-center sm:items-center sm:py-8">
      <div className="flex w-full flex-col border-ink bg-cream sm:max-w-md sm:border-[3px] sm:shadow-pixel">
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
