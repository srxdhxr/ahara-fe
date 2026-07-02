import { useEffect, useRef, useState } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import { userApi } from '../api/user';
import type { ChatMessage, DaySummary } from '../api/types';
import AppShell from './AppShell';
import TopBar from './TopBar';
import ChatHeader from './ChatHeader';
import ChatThread from './ChatThread';
import Composer from './Composer';

// Browser-local date is the single source of truth for "today" — server
// labels proved raceable against the timezone sync (multi-agent audit).
const localToday = () => format(new Date(), 'yyyy-MM-dd');

function summarize(date: string): DaySummary {
  const d = parseISO(date);
  if (isToday(d)) return { date, label: 'TODAY', kind: 'today' };
  if (isTomorrow(d)) return { date, label: 'TMRW', kind: 'tomorrow' };
  return { date, label: format(d, 'EEE d').toUpperCase(), kind: 'past' };
}

export default function ChatApp() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string>(localToday);
  const [typing, setTyping] = useState(false);
  const todayRef = useRef(localToday());

  // Keep the server's notion of the user's timezone honest (it scopes the
  // message-day windows and macro sums); refresh queries once it settles.
  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!browserTz) return;
    userApi
      .getMe()
      .then((me) => {
        if (me.timezone === browserTz) return;
        return userApi.updateMe({ timezone: browserTz }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['macros'] });
        });
      })
      .catch(() => {
        // non-fatal — worst case the server keeps its stored timezone
      });
  }, [queryClient]);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Day rollover: when the app is resumed (or midnight passes while open),
  // recompute local today; if the user was sitting on the old today, move
  // them to the new one. Deliberate historical picks are left alone.
  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== 'visible') return;
      const now = localToday();
      if (now !== todayRef.current) {
        const wasOnToday = selectedRef.current === todayRef.current;
        todayRef.current = now;
        if (wasOnToday) setSelected(now);
      }
      queryClient.invalidateQueries({ queryKey: ['macros'] });
    };
    document.addEventListener('visibilitychange', check);
    return () => document.removeEventListener('visibilitychange', check);
  }, [queryClient]);

  const activeDay = summarize(selected);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', selected],
    queryFn: () => chatApi.listMessages(selected),
  });

  const { data: macros } = useQuery({
    queryKey: ['macros', selected],
    queryFn: () => chatApi.getMacros(selected),
  });

  const appendLocal = (msgs: ChatMessage[]) =>
    queryClient.setQueryData<ChatMessage[]>(['messages', selected], (old = []) => [
      ...old,
      ...msgs,
    ]);

  const resync = () => {
    queryClient.invalidateQueries({ queryKey: ['messages', selected] });
    queryClient.invalidateQueries({ queryKey: ['macros', selected] });
  };

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
      resync();
    }
  };

  const send = async (text: string) => {
    appendLocal([{ id: -Date.now(), from: 'you', text, at: new Date().toISOString() }]);
    setTyping(true);
    startPolling();
    try {
      await chatApi.sendMessage(selected, text);
      resync();
    } catch (e) {
      await handleFailure(e);
    } finally {
      stopPolling();
      setTyping(false);
    }
  };

  const sendVoice = async (blob: Blob, mime: string) => {
    appendLocal([
      { id: -Date.now(), from: 'you', text: '▶ voice note…', at: new Date().toISOString() },
    ]);
    setTyping(true);
    startPolling();
    try {
      await chatApi.sendVoice(selected, blob, mime);
      resync();
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
      subheader={<ChatHeader day={activeDay} macros={macros} onSelect={setSelected} />}
      footer={<Composer onSend={send} onVoice={sendVoice} disabled={typing} />}
    >
      <ChatThread messages={messages} day={activeDay} loading={isLoading} typing={typing} />
    </AppShell>
  );
}
