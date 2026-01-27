"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Building2,
    Folder,
    Grid,
    Grid2X2CheckIcon,
    Map,
    Users,
    File,
} from "lucide-react";

type SidebarProps = {
    isOpen: boolean;
    isMobileOpen: boolean;
    currentPath?: string;
    onToggle: () => void;
    onCloseMobile: () => void;
};

const baseNavItems = [
    {
        label: "Tablero",
        icon: Grid2X2CheckIcon,
        path: "/dashboard",
    },
    {
        label: "Registros",
        icon: File,
        path: "/registry",
    },

    {
        label: "Mapas",
        icon: Map,
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
    const { data: session } = useSession();
    const userName = session?.user?.name?.trim().toLowerCase() ?? "";
    const userRole = session?.user?.role?.trim().toLowerCase() ?? "";
    const isAdmin =
        userName === "admin" ||
        userRole === "admin" ||
        userRole === "administrador";
    const navItems = isAdmin
        ? [
              ...baseNavItems,
              { label: "Usuarios", icon: Users, path: "/usuarios" },
          ]
        : baseNavItems;
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
                                    <span className="whitespace-nowrap">
                                        {item.label}
                                    </span>
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
