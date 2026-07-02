import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

function pickMime(): string {
  // Safari records mp4/aac; Chrome/Firefox webm/opus
  for (const m of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

export default function Composer({
  onSend,
  onVoice,
  disabled,
}: {
  onSend: (text: string) => void;
  onVoice: (blob: Blob, mime: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const discard = useRef(false);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const canRecord =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices && pickMime() !== '';

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunks.current = [];
      discard.current = false;
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setElapsed(0);
        if (discard.current) return;
        const blob = new Blob(chunks.current, { type: mime.split(';')[0] });
        if (blob.size > 1000) onVoice(blob, mime.split(';')[0]);
      };
      recorder.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      // mic denied — nothing to do; the button simply won't capture
    }
  };

  const stopRecording = (keep: boolean) => {
    discard.current = !keep;
    recorder.current?.stop();
  };

  // 3-minute hard stop — matches the server's upload cap comfortably
  useEffect(() => {
    if (elapsed >= 180) stopRecording(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  if (recording) {
    const mm = Math.floor(elapsed / 60);
    const ss = String(elapsed % 60).padStart(2, '0');
    return (
      <div className="flex min-h-11 items-center gap-2 px-3 py-2">
        <button
          aria-label="Discard recording"
          onClick={() => stopRecording(false)}
          className="pixel-press flex min-h-11 min-w-11 shrink-0 items-center justify-center border-[2px] border-ink bg-cream p-2.5 font-pixel text-[10px] text-ink shadow-pixel-sm"
        >
          ✕
        </button>
        <div className="flex min-h-11 flex-1 items-center gap-2 border-[2px] border-ink bg-white px-3 py-2.5">
          <span className="rec-pulse inline-block h-3 w-3 border-[2px] border-ink bg-purple" />
          <span className="cursor-blink font-mono text-sm">
            recording {mm}:{ss}
          </span>
        </div>
        <button
          aria-label="Stop and send"
          onClick={() => stopRecording(true)}
          className="pixel-press flex min-h-11 min-w-11 shrink-0 items-center justify-center border-[2px] border-ink bg-purple p-2.5 text-cream shadow-pixel-sm"
        >
          <Square size={14} strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-11 items-center gap-2 px-3 py-2">
      {canRecord && (
        <button
          aria-label="Record a voice note"
          onClick={startRecording}
          disabled={disabled}
          className="pixel-press flex min-h-11 min-w-11 shrink-0 items-center justify-center border-[2px] border-ink bg-cream p-2.5 text-ink shadow-pixel-sm disabled:opacity-50"
        >
          <Mic size={16} strokeWidth={2.5} />
        </button>
      )}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        onFocus={(e) =>
          // keep the composer above the iOS keyboard
          setTimeout(() => e.target.scrollIntoView({ block: 'nearest' }), 250)
        }
        placeholder="Text Maya…"
        aria-label="Message Maya"
        // text-base (16px): anything smaller makes iOS zoom the page on focus.
        // rounded-none: Safari rounds inputs by default — off-brand here.
        className="min-h-11 min-w-0 flex-1 rounded-none border-[2px] border-ink bg-white px-3 py-2.5 font-mono text-base focus:bg-lavender focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="pixel-press min-h-11 shrink-0 border-[2px] border-ink bg-purple px-3 py-2.5 font-pixel text-[10px] tracking-wider text-cream shadow-pixel-sm disabled:opacity-50"
      >
        SEND
      </button>
    </div>
  );
}
