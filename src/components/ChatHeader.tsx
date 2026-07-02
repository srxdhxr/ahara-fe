import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { DayMacros, DaySummary } from '../api/types';
import CalendarDropdown from './CalendarDropdown';

function dateLabel(day: DaySummary): string {
  const pretty = format(parseISO(day.date), 'EEE MMM d').toUpperCase();
  if (day.kind === 'today') return `TODAY · ${pretty}`;
  if (day.kind === 'tomorrow') return `TMRW · ${pretty}`;
  return pretty;
}

function Stat({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center border-[2px] border-ink bg-cream px-1 py-1.5">
      <span className="font-pixel text-[8px] tracking-wider text-brown">{label}</span>
      <span className="font-mono text-xs font-medium text-ink">
        {value === null ? '·' : Math.round(value)}
        <span className="text-[9px] text-brown">{unit}</span>
      </span>
    </div>
  );
}

/**
 * Chat header row: calendar picker + selected-date label + per-day macro
 * tracker (PTN / FAT / CARB / CAL). Replaces the old date carousel.
 */
export default function ChatHeader({
  day,
  macros,
  onSelect,
}: {
  day: DaySummary;
  macros: DayMacros | undefined;
  onSelect: (date: string) => void;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="relative border-b-[3px] border-ink bg-lavender px-3 py-2">
      <div className="flex items-center gap-2">
        <button
          aria-label="Pick a date"
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen((v) => !v)}
          className={`pixel-press flex min-h-10 min-w-10 shrink-0 items-center justify-center border-[2px] border-ink shadow-pixel-sm focus:outline-none ${
            calendarOpen ? 'bg-purple text-cream' : 'bg-cream text-ink'
          }`}
        >
          <CalendarDays size={16} strokeWidth={2.5} />
        </button>

        <span className="shrink-0 font-pixel text-[10px] tracking-wider text-ink">
          {dateLabel(day)}
        </span>

        <div className="ml-auto grid min-w-0 flex-1 max-w-[230px] grid-cols-4 gap-1">
          <Stat label="PTN" value={macros?.protein_g ?? null} unit="g" />
          <Stat label="FAT" value={macros?.fat_g ?? null} unit="g" />
          <Stat label="CARB" value={macros?.carbs_g ?? null} unit="g" />
          <Stat label="CAL" value={macros?.calories ?? null} unit="" />
        </div>
      </div>

      {calendarOpen && (
        <CalendarDropdown
          selected={day.date}
          onPick={(date) => {
            setCalendarOpen(false);
            onSelect(date);
          }}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  );
}
