"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchActivities } from "@/lib/api/activities";
import type { Activity } from "@/types";

type AuditLevel = "info" | "advertencia" | "critico";

type AuditLogItem = {
    id: string;
    actor: string;
    action: string;
    target: string;
    details?: string;
    created_at: string;
    level: AuditLevel;
};

const levelConfig: Record<AuditLevel, { label: string; className: string }> = {
    info: {
        label: "Info",
        className: "text-primary border-primary/20 bg-primary/10",
    },
    advertencia: {
        label: "Advertencia",
        className: "text-warning border-warning/30 bg-warning/10",
    },
    critico: {
        label: "Crítico",
        className: "text-destructive border-destructive/30 bg-destructive/10",
    },
};

const actionLabels: Record<string, string> = {
    created: "Creó",
    updated: "Actualizó",
    deleted: "Eliminó",
    destroyed: "Eliminó",
};

const actionLevels: Record<string, AuditLevel> = {
    created: "info",
    updated: "advertencia",
    deleted: "critico",
    destroyed: "critico",
};

const trackableLabels: Record<string, string> = {
    Asset: "Bien",
    Registry: "Registro",
    InventoryProcess: "Proceso de inventario",
};

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const resolveActionLabel = (action: string) => {
    const key = action.toLowerCase();
    return actionLabels[key] ?? action;
};

const resolveActionLevel = (action: string): AuditLevel => {
    const key = action.toLowerCase();
    return actionLevels[key] ?? "info";
};

const buildDetailsLabel = (activity: Activity) => {
    if (!activity.details) return undefined;
    const details = activity.details as Record<string, unknown>;
    const parts: string[] = [];
    if (details.rpp_number) {
        parts.push(`RPP: ${details.rpp_number}`);
    } else if (details.name) {
        parts.push(`RPP: ${details.name}`);
    }
    if (details.asset_id) {
        parts.push(`Asset ID: ${details.asset_id}`);
    }
    if (details.registry_id) {
        parts.push(`Registro ID: ${details.registry_id}`);
    }
    if (details.inventory_process_id) {
        parts.push(`Proceso ID: ${details.inventory_process_id}`);
    }
    if (parts.length === 0) return undefined;
    if (parts.length === 2) {
        return `${parts[0]} y ${parts[1]}`;
    }
    return parts.join(" · ");
};

const buildTargetLabel = (activity: Activity) => {
    const targetType =
        trackableLabels[activity.trackable_type] ?? activity.trackable_type;
    return `${targetType} #${activity.trackable_id}`;
};

const mapActivityToLog = (activity: Activity): AuditLogItem => {
    const userName = activity.user?.name?.trim();
    const userEmail = activity.user?.email?.trim();
    const actor = userName
        ? userEmail
            ? `${userName} (${userEmail})`
            : userName
        : userEmail || `Usuario #${activity.user_id}`;
    return {
        id: String(activity.id),
        actor,
        action: resolveActionLabel(activity.action),
        target: buildTargetLabel(activity),
        details: buildDetailsLabel(activity),
        created_at: activity.created_at,
        level: resolveActionLevel(activity.action),
    };
};

export default function AdminActivitiesPage() {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        perPage: itemsPerPage,
    });

    useEffect(() => {
        let active = true;

        const loadActivities = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await fetchActivities({
                    page: currentPage,
                    per_page: itemsPerPage,
                });
                if (!active) return;
                setLogs(response.data.map(mapActivityToLog));
                const responsePage = response.pagination?.current_page ?? 1;
                const totalPages = response.pagination?.total_pages ?? 1;
                const totalCount = response.pagination?.total_count ?? 0;
                const perPage = response.pagination?.per_page ?? itemsPerPage;
                setPagination({
                    currentPage: responsePage,
                    totalPages,
                    totalCount,
                    perPage,
                });
            } catch (error) {
                if (!active) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Error al cargar actividades.",
                );
                setLogs([]);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadActivities();
        return () => {
            active = false;
        };
    }, [currentPage]);

    const totalPages = Math.max(1, pagination.totalPages || 1);
    const startIndex = (currentPage - 1) * pagination.perPage;
    const endIndex = Math.min(
        startIndex + pagination.perPage,
        pagination.totalCount || logs.length,
    );

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Actividades</h1>
                    <p className="text-sm text-muted-foreground">
                        Registro de eventos y acciones del sistema.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Actividad reciente</CardTitle>
                    <CardDescription>
                        Eventos más recientes del sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead>Objetivo</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Nivel</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-sm text-muted-foreground">
                                            Cargando actividades...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : loadError ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-sm text-destructive">
                                            {loadError}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                            <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
                                            <div>
                                                <p className="font-medium">
                                                    Sin registros por ahora
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Aún no hay actividades para
                                                    mostrar.
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            {log.actor}
                                        </TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p>{log.target}</p>
                                                {log.details ? (
                                                    <p className="text-xs text-muted-foreground">
                                                        {log.details}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(log.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    levelConfig[log.level]
                                                        .className,
                                                )}
                                            >
                                                {levelConfig[log.level].label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <div className="flex items-center justify-between border-t border-border px-4 py-3">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {logs.length === 0 ? 0 : startIndex + 1} a{" "}
                            {logs.length === 0 ? 0 : endIndex} de{" "}
                            {pagination.totalCount || logs.length} actividades
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            currentPage === page
                                                ? "default"
                                                : "ghost"
                                        }
                                        size="sm"
                                        className="w-8"
                                        onClick={() => setCurrentPage(page)}
                                        disabled={isLoading}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={
                                    currentPage === totalPages || isLoading
                                }
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
