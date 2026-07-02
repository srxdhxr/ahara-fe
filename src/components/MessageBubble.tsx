import { useEffect, useState } from 'react';
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
          'max-w-[85%] border-[2px] border-ink px-3 py-2 text-sm leading-snug rounded-[4px]',
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

// What Maya's "doing" while the agent runs. Ordered like the real pipeline —
// think → remember → log → cook-brain → math — so long waits read as work,
// not lag. Cycles forward, then holds on the last one.
const THINKING_STATUSES = [
  'thinking',
  'updating memory',
  'recording the meal',
  'tossing',
  'sautéing',
  'counting calories',
  'double-checking the math',
];

export function TypingIndicator() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, THINKING_STATUSES.length - 1)),
      2200,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-[4px] border-[2px] border-ink bg-white px-3 py-2 shadow-pixel-sm">
        <div className="mb-0.5 font-pixel text-[9px] tracking-wider text-brown">MAYA</div>
        <div className="cursor-blink font-mono text-xs text-brown">
          {THINKING_STATUSES[step]}
        </div>
      </div>
    </div>
  );
}
