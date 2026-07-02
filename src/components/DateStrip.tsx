import { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import type { DaySummary } from '../api/types';
import CalendarDropdown from './CalendarDropdown';

export default function DateStrip({
  days,
  selected,
  onSelect,
}: {
  days: DaySummary[];
  selected: string;
  onSelect: (date: string) => void;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Drag-to-scroll: pointer events cover mouse + touch. A click that follows
  // a real drag (>5px) is suppressed so tabs don't fire on drag release.
  const stripRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  // Keep the selected tab visible — calendar picks can land off-screen
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const idx = days.findIndex((d) => d.date === selected);
    if (idx < 0) return;
    requestAnimationFrame(() => {
      const btn = strip.children[idx] as HTMLElement | undefined;
      if (!btn) return;
      const left = btn.offsetLeft - 12;
      const right = btn.offsetLeft + btn.offsetWidth + 12;
      if (left < strip.scrollLeft) strip.scrollLeft = left;
      else if (right > strip.scrollLeft + strip.clientWidth)
        strip.scrollLeft = right - strip.clientWidth;
    });
  }, [selected, days]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = stripRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = stripRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const handleTab = (date: string) => {
    if (drag.current.moved) return; // it was a drag, not a click
    onSelect(date);
  };

  return (
    <div className="relative flex items-center gap-2 border-b-[3px] border-ink bg-lavender px-3 py-2">
      <div
        ref={stripRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        // pb-1.5/px-1: room for the tabs' 2px offset shadows so they never clip
        className="no-scrollbar flex flex-1 cursor-grab touch-pan-x select-none items-center gap-2 overflow-x-auto px-1 pb-1.5 pt-1 active:cursor-grabbing"
        role="tablist"
        aria-label="Days"
      >
        {days.map((d) => {
          const isSelected = d.date === selected;
          return (
            <button
              key={d.date}
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleTab(d.date)}
              className={`pixel-press min-h-10 shrink-0 whitespace-nowrap border-[3px] border-ink px-3.5 py-2 font-pixel text-[10px] tracking-wider shadow-pixel-sm focus:outline-none focus-visible:bg-lavender ${
                isSelected ? 'bg-purple text-cream' : 'bg-cream text-ink'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <button
        aria-label="Pick a date"
        aria-expanded={calendarOpen}
        onClick={() => setCalendarOpen((v) => !v)}
        className={`pixel-press mb-0.5 flex min-h-10 shrink-0 items-center justify-center border-[3px] border-ink px-2.5 py-2 shadow-pixel-sm focus:outline-none focus-visible:bg-lavender ${
          calendarOpen ? 'bg-purple text-cream' : 'bg-cream text-ink'
        }`}
      >
        <CalendarDays size={16} strokeWidth={2.5} />
      </button>

      {calendarOpen && (
        <CalendarDropdown
          selected={selected}
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
