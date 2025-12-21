"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/components/layout/app-header";
import AppSidebar from "@/components/layout/app-sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="flex min-h-screen">
        <AppSidebar
          isOpen={isSidebarOpen}
          isMobileOpen={isMobileOpen}
          currentPath={pathname}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col transition-all duration-300 ease-out">
          <AppHeader
            isSidebarOpen={isSidebarOpen}
            onOpenMobile={() => setIsMobileOpen(true)}
          />

          <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
