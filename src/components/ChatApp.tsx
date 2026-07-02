import { useEffect, useRef, useState } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import { userApi } from '../api/user';
import type { ChatMessage, DaySummary } from '../api/types';
import AppShell from './AppShell';
import TopBar from './TopBar';
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
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  // Keep the server's notion of the user's timezone honest — signups default
  // to America/Los_Angeles. The browser knows the truth; sync once per load.
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

  const appendLocal = (msgs: ChatMessage[]) =>
    queryClient.setQueryData<ChatMessage[]>(['messages', activeDate], (old = []) => [
      ...old,
      ...msgs,
    ]);

  const resync = () => queryClient.invalidateQueries({ queryKey: ['messages', activeDate] });

  // Progressive replies: the agent writes burst messages to the DB one at a
  // time over its 20-40s run, but the POST only resolves at the end. Polling
  // the thread while "typing" surfaces each message the moment it lands.
  // First poll waits 4s so voice placeholders aren't wiped pre-transcription.
  const pollDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopPolling = () => {
    if (pollDelay.current) clearTimeout(pollDelay.current);
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollDelay.current = null;
    pollInterval.current = null;
  };
  const startPolling = () => {
    stopPolling();
    pollDelay.current = setTimeout(() => {
      pollInterval.current = setInterval(resync, 2500);
    }, 4000);
  };
  useEffect(() => stopPolling, []);

  const handleFailure = async (e: unknown) => {
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status === 409) {
      // duplicate send — the first copy is still processing; poll for it
      setTimeout(resync, 8000);
    } else {
      await resync();
    }
  };

  const send = async (text: string) => {
    if (!activeDate) return;
    appendLocal([{ id: -Date.now(), from: 'you', text, at: new Date().toISOString() }]);
    setTyping(true);
    startPolling();
    try {
      await chatApi.sendMessage(activeDate, text);
      await resync();
    } catch (e) {
      await handleFailure(e);
    } finally {
      stopPolling();
      setTyping(false);
    }
  };

  const sendVoice = async (blob: Blob, mime: string) => {
    if (!activeDate) return;
    appendLocal([
      { id: -Date.now(), from: 'you', text: '▶ voice note…', at: new Date().toISOString() },
    ]);
    setTyping(true);
    startPolling();
    try {
      await chatApi.sendVoice(activeDate, blob, mime);
      await resync();
    } catch (e) {
      await handleFailure(e);
    } finally {
      stopPolling();
      setTyping(false);
    }
  };

  return (
    <AppShell
      header={<TopBar gear />}
      subheader={
        activeDay && <DateStrip days={days} selected={activeDay.date} onSelect={setSelected} />
      }
      footer={<Composer onSend={send} onVoice={sendVoice} disabled={typing || !activeDay} />}
    >
      {activeDay ? (
        <ChatThread messages={messages} day={activeDay} loading={isLoading} typing={typing} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="cursor-blink font-pixel text-xs tracking-widest text-brown">LOADING</div>
        </div>
      )}
    </AppShell>
  );
}
