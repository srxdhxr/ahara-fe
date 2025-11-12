import React from "react";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen pb-24">
      <main className="mx-auto max-w-2xl px-4 pt-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

