"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BienDetailHeaderProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bien: any;
    estatusConfig: {
        [key: string]: { label: string; className: string };
    };
    canBaja: boolean;
    canReactivate?: boolean;
    onBajaClick: () => void;
    onReactivateClick?: () => void;
    backPath: string;
    hideCreateProcess?: boolean;
    viewLocationHref?: string;
    canEdit?: boolean;
}

export default function BienDetailHeader({
    bien,
    estatusConfig,
    canBaja,
    canReactivate = false,
    onBajaClick,
    onReactivateClick,
    backPath,
    hideCreateProcess = false,
    viewLocationHref,
    canEdit = true,
}: BienDetailHeaderProps) {
    const statusKey = estatusConfig[bien.estatus] ? bien.estatus : "activo";

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={backPath}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-xl",
                            bien.tipo === "inmueble"
                                ? "bg-primary/10 text-primary"
                                : "bg-info/10 text-info",
                        )}
                    >
                        <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">
                                {bien.nombre}
                            </h1>
                            <Badge
                                variant="outline"
                                className={estatusConfig[statusKey].className}
                            >
                                {estatusConfig[statusKey].label}
                            </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-mono">
                                {bien.rppNumero ?? "—"}
                            </span>
                            <span>•</span>
                            <span className="font-mono">
                                {bien.cNumero ?? "—"}
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                                {bien.tipo || "—"} / {bien.categoria || "—"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-3 sm:ml-auto">
                {canEdit && canBaja && (
                    <Button
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
                        onClick={onBajaClick}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Dar de Baja
                    </Button>
                )}
                {canEdit && canReactivate ? (
                    <Button variant="outline" onClick={onReactivateClick}>
                        Reactivar
                    </Button>
                ) : null}
                {!hideCreateProcess && canEdit ? (
                    <Button asChild>
                        <Link href={`/assets/process/${bien.id}`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Proceso
                        </Link>
                    </Button>
                ) : null}
                {viewLocationHref ? (
                    <Button variant="outline" asChild>
                        <Link href={viewLocationHref}>
                            Ver localizacion del bien
                        </Link>
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
