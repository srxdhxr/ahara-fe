import { useEffect, useRef, useState } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarDropdown({
  selected,
  onPick,
  onClose,
}: {
  selected: string;
  onPick: (date: string) => void;
  onClose: () => void;
}) {
  const [month, setMonth] = useState(() => startOfMonth(parseISO(selected)));
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const today = new Date();
  const maxDay = addDays(today, 1); // planning stops at tomorrow
  const grid = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  return (
    <div
      ref={ref}
      className="absolute right-2 top-full z-20 mt-2 w-64 border-[3px] border-ink bg-cream p-3 shadow-pixel"
      role="dialog"
      aria-label="Calendar"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          aria-label="Previous month"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="pixel-press border-[2px] border-ink bg-cream px-2 py-0.5 font-pixel text-[10px] shadow-pixel-sm"
        >
          ◀
        </button>
        <div className="font-pixel text-[10px] tracking-widest">
          {format(month, 'MMM yyyy').toUpperCase()}
        </div>
        <button
          aria-label="Next month"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="pixel-press border-[2px] border-ink bg-cream px-2 py-0.5 font-pixel text-[10px] shadow-pixel-sm"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center font-pixel text-[9px] text-brown">
            {d}
          </div>
        ))}
        {grid.map((day) => {
          const inMonth = isSameMonth(day, month);
          const disabled = isAfter(day, maxDay);
          const isSelected = isSameDay(day, parseISO(selected));
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              disabled={disabled}
              onClick={() => onPick(format(day, 'yyyy-MM-dd'))}
              className={[
                'aspect-square border-[2px] font-mono text-xs',
                isSelected
                  ? 'border-ink bg-purple text-cream shadow-pixel-sm'
                  : isToday
                    ? 'border-ink bg-lavender text-ink'
                    : 'border-transparent',
                !isSelected && !disabled ? 'hover:border-ink hover:bg-lavender' : '',
                disabled ? 'cursor-not-allowed text-ink/25' : '',
                !inMonth && !disabled ? 'text-brown/50' : '',
              ].join(' ')}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
