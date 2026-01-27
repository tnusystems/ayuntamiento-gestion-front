//components/bienes/bien-detail/bien-procesos.tsx

"use client";

import Link from "next/link";
import { FileText, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BienProcesosProps {
    bienId: string;
    procesos?: Array<{
        id?: string | number;
        tipo?: string;
        status?: string | null;
        opened_at?: string | null;
        closed_at?: string | null;
        notes?: string | null;
    }>;
}

const procesoEstatusConfig = {
    borrador: {
        label: "Borrador",
        icon: FileText,
        className: "text-muted-foreground",
    },
    en_revision: {
        label: "En Revisión",
        icon: Clock,
        className: "text-warning",
    },
    aprobado: {
        label: "Aprobado",
        icon: CheckCircle2,
        className: "text-success",
    },
    rechazado: {
        label: "Rechazado",
        icon: XCircle,
        className: "text-destructive",
    },
    ABIERTA: {
        label: "Abierta",
        icon: Clock,
        className: "text-warning",
    },
    CERRADA: {
        label: "Cerrada",
        icon: CheckCircle2,
        className: "text-success",
    },
};

export default function BienProcesos({
    bienId,
    procesos = [],
}: BienProcesosProps) {
    const bienProcesos = procesos;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Procesos Asociados</CardTitle>
                <CardDescription>
                    Historial de trámites realizados sobre este bien
                </CardDescription>
            </CardHeader>
            <CardContent>
                {bienProcesos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-muted-foreground">
                            No hay procesos registrados
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={`/assets/process/${bienId}`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Primer Proceso
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bienProcesos.map((proceso) => {
                            const statusKey = (proceso.status || "")
                                .toString()
                                .toUpperCase() as keyof typeof procesoEstatusConfig;
                            const statusConfig =
                                procesoEstatusConfig[statusKey] ||
                                procesoEstatusConfig.borrador;
                            const StatusIcon = statusConfig.icon;
                            const fecha =
                                proceso.closed_at ||
                                proceso.opened_at ||
                                new Date().toISOString();
                            return (
                                <div
                                    key={
                                        proceso.id ?? `${proceso.tipo}-${fecha}`
                                    }
                                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
                                                statusConfig.className,
                                            )}
                                        >
                                            <StatusIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {proceso.tipo || "Proceso"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {proceso.notes || "Sin notas"} •{" "}
                                                {formatDate(fecha)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant="outline"
                                            className={statusConfig.className}
                                        >
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
