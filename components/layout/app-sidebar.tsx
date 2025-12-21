"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
  isMobileOpen: boolean;
  currentPath?: string;
  onToggle: () => void;
  onCloseMobile: () => void;
};

const navItems = [
  {
    label: "Tablero",
    icon: GridIcon,
    path: "/dashboard",
  },
  {
    label: "Bienes inmuebles",
    icon: BuildingIcon,
    path: "/bienes-inmuebles",
  },
  {
    label: "Archivos",
    icon: FolderIcon,
    path: "/archivos",
  },
  {
    label: "Mapa",
    icon: PinIcon,
    path: "/mapa",
  },
];

export default function AppSidebar({
  isOpen,
  isMobileOpen,
  currentPath,
  onToggle,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname;

  const sidebarWidth = isOpen ? "w-60" : "w-20";

  return (
    <>
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-neutral-300 flex flex-col py-5",
          "transition-all duration-300 ease-out",
          sidebarWidth,
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static",
        ].join(" ")}
      >
        <div
          className="px-4 flex items-center justify-between gap-2 min-h-8 cursor-pointer"
          onClick={onToggle}
          aria-label="Alternar sidebar"
        >
          <div className="flex items-center gap-3">
            <Image
              src={"/icons/logo_ayuntamiento_hermosillo.png"}
              alt={""}
              width={200}
              height={100}
            />
          </div>
        </div>

        <div className="mt-8 px-4 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          {isOpen ? "Menu" : ""}
        </div>

        <nav className="mt-3 flex flex-col gap-2 px-2">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <Link
                key={item.label}
                href={item.path}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-neutral-100",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 ml-[-4px]"
                    : "text-neutral-700",
                ].join(" ")}
                onClick={onCloseMobile}
              >
                <span
                  className={[
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "border border-neutral-200 bg-white",
                  ].join(" ")}
                >
                  <item.icon />
                </span>
                {isOpen && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Cerrar menu"
        />
      )}
    </>
  );
}

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 21h14" />
      <path d="M7 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M9 9h2M13 9h2M9 13h2M13 13h2M9 17h2M13 17h2" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="10" r="3" />
      <path d="M12 21s6-5.25 6-10a6 6 0 1 0-12 0c0 4.75 6 10 6 10z" />
    </svg>
  );
}

function ChevronLeftIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-5 h-5 transition-transform duration-300 ${
        !isOpen ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d={isOpen ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
