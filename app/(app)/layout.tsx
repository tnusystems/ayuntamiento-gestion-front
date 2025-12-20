"use client";

import { useState } from "react";

import AppHeader from "@/components/layout/app-header";
import AppSidebar from "@/components/layout/app-sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900">
      <div className="flex min-h-screen">
        <AppSidebar
          isOpen={isSidebarOpen}
          isMobileOpen={isMobileOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col">
          <AppHeader onOpenMobile={() => setIsMobileOpen(true)} />

          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
