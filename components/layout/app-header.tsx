"use client";

import { useState } from "react";

type HeaderProps = {
  onOpenMobile: () => void;
};

export default function AppHeader({ onOpenMobile }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-neutral-300 flex items-center justify-between px-4 lg:px-6">
      <button className="lg:hidden text-neutral-700" onClick={onOpenMobile} aria-label="Abrir menu">
        <MenuIcon />
      </button>
      <div className="relative ml-auto">
        <button
          className="flex items-center gap-2 text-neutral-600"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          aria-expanded={isUserMenuOpen}
        >
          <div className="w-7 h-7 rounded-full bg-neutral-300" />
          <span className="text-sm font-medium">Usuario</span>
          <ChevronDown />
        </button>
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 rounded-md border border-neutral-200 bg-white shadow-lg">
            <button className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
              Perfil
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
              Cerrar sesion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
