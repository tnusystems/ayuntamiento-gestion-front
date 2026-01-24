import type { Bien } from "@/lib/mock-data";

export type { Bien };

export const estatusConfig = {
    activo: { label: "Activo", className: "bg-green-100 text-green-800 border-green-200" },
    baja: { label: "Baja", className: "bg-red-100 text-red-800 border-red-200" },
    en_tramite: { label: "En Trámite", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
} as const;

export type EstatusKeys = keyof typeof estatusConfig;