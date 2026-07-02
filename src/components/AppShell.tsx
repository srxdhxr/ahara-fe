/**
 * App shell: fixed chrome, scrollable middle. One place owns the iPhone
 * geometry — safe-area insets (Dynamic Island / home indicator / curved
 * corners), dvh sizing, and overscroll containment.
 *
 *   ┌─────────────────────────────┐
 *   │ header      (pt-safe, fixed)│  grid-row: auto
 *   │ subheader          (fixed)  │  grid-row: auto
 *   │ main        (ONLY scroller) │  grid-row: 1fr, overflow-y-auto
 *   │ footer      (pb-safe, fixed)│  grid-row: auto
 *   └─────────────────────────────┘
 */
export default function AppShell({
  header,
  subheader,
  footer,
  children,
}: {
  header: React.ReactNode;
  subheader?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="dot-grid-faint flex h-dvh justify-center sm:items-center sm:py-8">
      <div
        className="grid h-full w-full grid-rows-[auto_auto_1fr_auto] overflow-hidden
                   border-ink bg-cream px-safe
                   sm:h-[min(85dvh,800px)] sm:max-w-md sm:border-[3px] sm:shadow-pixel"
      >
        {/* header owns the notch area: safe-area padding INSIDE its bg */}
        <div className="pt-safe border-b-[3px] border-ink bg-lavender">{header}</div>
        {/* grid rows are positional — always render all four children */}
        <div>{subheader}</div>
        <main className="min-h-0 overflow-y-auto overscroll-contain">{children}</main>
        {/* footer owns the home-indicator area (chrome only when present) */}
        <div className={footer ? 'pb-safe border-t-[3px] border-ink bg-lavender' : 'pb-safe'}>
          {footer}
        </div>
      </div>
    </div>
  );
}
