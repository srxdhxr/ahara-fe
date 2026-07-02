import { useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import type { ChatMessage, DaySummary } from '../api/types';
import MessageBubble, { TimeSeparator, TypingIndicator } from './MessageBubble';

function EmptyState({ kind }: { kind: DaySummary['kind'] }) {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="font-pixel text-xs tracking-widest text-brown">
        {kind === 'tomorrow' ? 'PLAN TOMORROW' : 'NO MESSAGES'}
      </div>
      <p className="max-w-[240px] font-mono text-xs text-brown">
        {kind === 'tomorrow'
          ? "tell maya what you're planning to eat and she'll rough out the numbers"
          : 'nothing logged this day'}
      </p>
    </div>
  );
}

export default function ChatThread({
  messages,
  day,
  loading,
  typing,
}: {
  messages: ChatMessage[];
  day: DaySummary;
  loading: boolean;
  typing: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, typing, day.date]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="cursor-blink font-pixel text-xs tracking-widest text-brown">LOADING</div>
      </div>
    );
  }

  if (messages.length === 0 && !typing) {
    return (
      <div className="h-full">
        <EmptyState kind={day.kind} />
      </div>
    );
  }

  // Insert a time separator whenever >45min passes between messages
  const rows: React.ReactNode[] = [];
  let prev: ChatMessage | null = null;
  for (const msg of messages) {
    const t = parseISO(msg.at);
    if (!prev || t.getTime() - parseISO(prev.at).getTime() > 45 * 60 * 1000) {
      rows.push(<TimeSeparator key={`sep-${msg.id}`} text={format(t, 'h:mm a')} />);
    }
    // Hide the YOU/MAYA label on consecutive messages from the same sender
    rows.push(<MessageBubble key={msg.id} message={msg} showLabel={prev?.from !== msg.from} />);
    prev = msg;
  }

  // NOTE: no overflow here — AppShell's <main> is the one scroller.
  return (
    <div className="space-y-2 px-4 py-5">
      {rows}
      {typing && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
