import { useState } from 'react';

export default function Composer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <div className="flex items-center gap-2 border-t-[3px] border-ink bg-lavender px-3 py-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder="Text Maya…"
        aria-label="Message Maya"
        className="min-w-0 flex-1 border-[2px] border-ink bg-white px-3 py-2 font-mono text-sm focus:bg-lavender focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="pixel-press shrink-0 border-[2px] border-ink bg-purple px-3 py-2 font-pixel text-[10px] text-cream shadow-pixel-sm disabled:opacity-50"
      >
        SEND
      </button>
    </div>
  );
}
