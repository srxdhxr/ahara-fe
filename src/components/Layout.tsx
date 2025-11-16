import React from "react";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] pb-20" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      {/* Header with Logo */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[#E8DEFF]/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center h-12">
            <img
              src="/favicon.png"
              alt="Ahara"
              className="h-7 w-7"
            />
            <span className="ml-2 text-lg font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
              Ahara
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-3">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

