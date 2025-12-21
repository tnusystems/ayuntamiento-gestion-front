"use client";

import { useState, useEffect, useRef } from "react";

type HeaderProps = {
  isSidebarOpen?: boolean;
  onOpenMobile: () => void;
};

export default function AppHeader({ onOpenMobile }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={[
        "h-14 bg-white border-b border-neutral-300 flex items-center justify-between px-4 lg:px-6",
        "transition-all duration-300 ease-out",
      ].join(" ")}
    >
      {/* Título de página y botón móvil */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-neutral-700 hover:text-neutral-900"
          onClick={onOpenMobile}
          aria-label="Abrir menu"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Menú de usuario */}
      <div className="relative" ref={userMenuRef}>
        <button
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          aria-expanded={isUserMenuOpen}
          aria-label="Menú de usuario"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-medium">
            U
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-sm font-medium block">Usuario Demo</span>
            <span className="text-xs text-neutral-500">Administrador</span>
          </div>
          <ChevronDown isOpen={isUserMenuOpen} />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white shadow-lg z-50">
            <div className="px-4 py-3 border-b border-neutral-100">
              <p className="text-sm font-medium text-neutral-900">
                Usuario Demo
              </p>
              <p className="text-xs text-neutral-500">demo@empresa.com</p>
            </div>
            <button className="w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-100 border-b border-neutral-100">
              Mi perfil
            </button>
            <button className="w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-100">
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function ChevronDown({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 transition-transform duration-200 ${
        isOpen ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
