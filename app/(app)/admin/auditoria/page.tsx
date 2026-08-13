"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { fetchChangeLogs } from "@/lib/api/changelogs";
import { mockChangeLogs, MOCK_FALLBACK_MESSAGE } from "@/lib/mock-fallbacks";
import type { ChangeLog } from "@/types";

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
    create: "Creó",
    update: "Actualizó",
    delete: "Eliminó",
    destroy: "Eliminó",
};

const actionLevels: Record<string, AuditLevel> = {
    create: "info",
    update: "advertencia",
    delete: "critico",
    destroy: "critico",
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

const resolveActionLabel = (action?: string | null) => {
    const key = action?.toLowerCase() ?? "";
    return actionLabels[key] ?? action;
};

const resolveActionLevel = (action?: string | null): AuditLevel => {
    const key = action?.toLowerCase() ?? "";
    return actionLevels[key] ?? "info";
};

const buildDetailsLabel = (log: ChangeLog) => {
    const item = log.item as Record<string, unknown> | null | undefined;
    if (!item) return undefined;
    const parts: string[] = [];
    const rpp = typeof item.rpp_number === "string" ? item.rpp_number : null;
    const name = typeof item.name === "string" ? item.name : null;
    const status = typeof item.status === "string" ? item.status : null;
    const assetId = typeof item.asset_id === "number" ? item.asset_id : null;
    if (rpp) {
        parts.push(`RPP: ${rpp}`);
    } else if (name) {
        parts.push(`Nombre: ${name}`);
    }
    if (assetId !== null) {
        parts.push(`Asset ID: ${assetId}`);
    }
    if (status) {
        parts.push(`Estado: ${status}`);
    }
    if (parts.length === 0) return undefined;
    if (parts.length === 2) {
        return `${parts[0]} y ${parts[1]}`;
    }
    return parts.join(" · ");
};

const buildTargetLabel = (log: ChangeLog) => {
    const targetType =
        trackableLabels[log.item_type ?? ""] ?? log.item_type ?? "Elemento";
    const targetId =
        log.item_id !== null && log.item_id !== undefined
            ? `#${log.item_id}`
            : "";
    return `${targetType} ${targetId}`.trim();
};

const mapChangeLogToLog = (log: ChangeLog): AuditLogItem => {
    const userName = log.user?.name?.trim();
    const userEmail = log.user?.email?.trim();
    const actor = userName
        ? userEmail
            ? `${userName} (${userEmail})`
            : userName
        : userEmail || `Usuario #${log.user?.id ?? "—"}`;
    return {
        id: String(log.id),
        actor,
        action: resolveActionLabel(log.event) ?? "—",
        target: buildTargetLabel(log),
        details: buildDetailsLabel(log),
        created_at: log.created_at ?? "",
        level: resolveActionLevel(log.event),
    };
};

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        let active = true;

        const loadChangeLogs = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await fetchChangeLogs();
                if (!active) return;
                setLogs(response.data.map(mapChangeLogToLog));
            } catch (error) {
                if (!active) return;
                setLogs(mockChangeLogs.map(mapChangeLogToLog));
                setLoadError(MOCK_FALLBACK_MESSAGE);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadChangeLogs();
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Auditoría</h1>
                    <p className="text-sm text-muted-foreground">
                        Registro de cambios y acciones sobre las entidades.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Auditoría reciente</CardTitle>
                    <CardDescription>
                        Cambios recientes en el sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadError ? (
                        <div className="mb-4 text-sm text-destructive">
                            {loadError}
                        </div>
                    ) : null}
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
                                    <TableRow
                                        key={log.id}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            router.push(
                                                `/admin/auditoria/${log.id}`,
                                            )
                                        }
                                    >
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
                </CardContent>
            </Card>
        </div>
    );
}
