import React from "react";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen pb-24">
      {/* Header with Logo */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[#E8DEFF]/50">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center h-14 sm:h-16">
            <img 
              src="/favicon.png" 
              alt="Ahara" 
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <span className="ml-2 text-lg sm:text-xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
              Ahara
            </span>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-2xl px-4 pt-4 sm:pt-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

