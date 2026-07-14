import type { ChatMessage } from '../api/types';

export default function MessageBubble({
  message,
  showLabel,
}: {
  message: ChatMessage;
  showLabel: boolean;
}) {
  const isYou = message.from === 'you';
  return (
    <div className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] break-words border-[2px] border-ink px-3 py-2 text-sm leading-snug rounded-[4px]',
          isYou ? 'bg-purple text-cream shadow-pixel-sm' : 'bg-white text-ink shadow-pixel-sm',
        ].join(' ')}
      >
        {showLabel && (
          <div
            className={`mb-0.5 font-pixel text-[9px] tracking-wider ${
              isYou ? 'text-cream/80' : 'text-brown'
            }`}
          >
            {isYou ? 'YOU' : 'MAYA'}
          </div>
        )}
        <div>{message.text}</div>
      </div>
    </div>
  );
}

export function TimeSeparator({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="font-pixel text-[10px] tracking-widest text-brown">— {text} —</div>
    </div>
  );
}

// Real-time progress: the actual steps the agent streams (SSE `step` events),
// not canned status text. `logged`/`total` steps are done (✓); everything else
// is in-flight (⋯). Until the first step arrives we show a lone "thinking".
export interface AgentStep {
  kind: string;
  label: string;
}

export function TypingIndicator({ steps }: { steps?: AgentStep[] }) {
  const shown = steps && steps.length ? steps : [{ kind: 'thinking', label: 'thinking' }];
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-[4px] border-[2px] border-ink bg-white px-3 py-2 shadow-pixel-sm">
        <div className="mb-0.5 font-pixel text-[9px] tracking-wider text-brown">MAYA</div>
        <div className="space-y-0.5 font-mono text-xs text-brown">
          {shown.map((s, i) => {
            const done = s.kind === 'logged' || s.kind === 'total';
            const isLast = i === shown.length - 1;
            return (
              <div key={i} className={done ? 'text-ink' : ''}>
                <span className="mr-1 opacity-60">{done ? '✓' : '⋯'}</span>
                <span className={isLast && !done ? 'cursor-blink' : ''}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
