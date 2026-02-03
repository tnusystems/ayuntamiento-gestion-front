"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchChangeLogDetail } from "@/lib/api/changelogs";
import type { ChangeLog } from "@/types";

type AuditLevel = "info" | "advertencia" | "critico";

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

const formatDateTime = (value?: string | null) => {
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

const valueOrDash = (value?: string | number | null) =>
    value === null || value === undefined || value === "" ? "—" : String(value);

const formatAction = (value?: string | null) => {
    const key = value?.toLowerCase() ?? "";
    return actionLabels[key] ?? value ?? "—";
};

const resolveActionLevel = (value?: string | null): AuditLevel => {
    const key = value?.toLowerCase() ?? "";
    return actionLevels[key] ?? "info";
};

const formatAttributeValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }
    try {
        return JSON.stringify(value);
    } catch {
        return "—";
    }
};

const normalizeRecord = (value: unknown) =>
    value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : null;

const extractChangeSections = (changes?: Record<string, unknown> | null) => {
    if (!changes) return null;
    if (typeof changes.error === "string") {
        return { error: changes.error };
    }
    const before =
        normalizeRecord(changes.before) ??
        normalizeRecord(changes.previous) ??
        normalizeRecord(changes.old);
    const after =
        normalizeRecord(changes.after) ??
        normalizeRecord(changes.current) ??
        normalizeRecord(changes.new);
    if (before || after) {
        return { before, after };
    }
    const entries = Object.entries(changes);
    return { entries };
};

const extractComparisonSections = (
    comparison?: {
        current_state?: Record<string, unknown>;
        versioned_state?: Record<string, unknown>;
        differences?: unknown[];
    } | null,
) => {
    if (!comparison) return null;
    const before = normalizeRecord(comparison.versioned_state);
    const after = normalizeRecord(comparison.current_state);
    const differences = Array.isArray(comparison.differences)
        ? comparison.differences
        : [];
    if (before || after || differences.length > 0) {
        return { before, after, differences };
    }
    return null;
};

const buildUserLabel = (log: ChangeLog) => {
    const name = log.user?.name?.trim();
    const email = log.user?.email?.trim();
    if (name && email) return `${name} (${email})`;
    if (name) return name;
    if (email) return email;
    return log.user?.id ? `Usuario #${log.user.id}` : "—";
};

export default function AuditDetailPage() {
    const params = useParams();
    const changeId = useMemo(() => {
        const raw = params?.id;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params]);
    const [change, setChange] = useState<ChangeLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadChange = async (id: string) => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await fetchChangeLogDetail(id);
                if (!active) return;
                setChange(response);
            } catch (error) {
                if (!active) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Error al cargar el detalle.",
                );
                setChange(null);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        if (changeId) {
            void loadChange(changeId);
        } else {
            setIsLoading(false);
            setLoadError("Registro no encontrado.");
        }

        return () => {
            active = false;
        };
    }, [changeId]);

    const statusLevel = resolveActionLevel(change?.event ?? null);
    const status = levelConfig[statusLevel];
    const itemType =
        trackableLabels[change?.item_type ?? ""] ??
        change?.item_type ??
        "Elemento";
    const itemId =
        change?.item_id !== null && change?.item_id !== undefined
            ? `#${change.item_id}`
            : "—";
    const item = normalizeRecord(change?.item);
    const itemEntries = item ? Object.entries(item) : [];
    const changes = normalizeRecord(change?.changes);
    const changeSections = extractChangeSections(changes);
    const comparisonSections = extractComparisonSections(
        change?.comparison ?? null,
    );

    return (
        <div className="container mx-auto space-y-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Auditoría #{changeId ?? "—"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Detalle del cambio registrado.
                    </p>
                </div>
                <Button variant="ghost" asChild>
                    <Link href="/admin/auditoria">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Cargando auditoría...
                    </CardContent>
                </Card>
            ) : loadError ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-destructive">
                        {loadError}
                    </CardContent>
                </Card>
            ) : !change ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
                            Sin información disponible.
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen</CardTitle>
                            <CardDescription>
                                Datos generales del evento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Evento
                                </p>
                                <Badge
                                    variant="outline"
                                    className={cn(status.className)}
                                >
                                    {formatAction(change.event)}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Entidad
                                </p>
                                <p className="font-medium">
                                    {itemType} {itemId}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Usuario
                                </p>
                                <p className="font-medium">
                                    {buildUserLabel(change)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Fecha
                                </p>
                                <p className="font-medium">
                                    {formatDateTime(change.created_at)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cambios</CardTitle>
                            <CardDescription>
                                Antes y después (si está disponible).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {!changeSections && !comparisonSections ? (
                                <div className="text-sm text-muted-foreground">
                                    No hay cambios para mostrar.
                                </div>
                            ) : changeSections && "error" in changeSections ? (
                                <div className="text-sm text-destructive">
                                    {changeSections.error}
                                </div>
                            ) : comparisonSections?.before ||
                              comparisonSections?.after ? (
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">
                                            Antes
                                        </p>
                                        {comparisonSections.before ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Campo
                                                        </TableHead>
                                                        <TableHead>
                                                            Valor
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.entries(
                                                        comparisonSections.before,
                                                    ).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell className="font-medium">
                                                                {key}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatAttributeValue(
                                                                    value,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                Sin datos previos.
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">
                                            Después
                                        </p>
                                        {comparisonSections.after ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Campo
                                                        </TableHead>
                                                        <TableHead>
                                                            Valor
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.entries(
                                                        comparisonSections.after,
                                                    ).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell className="font-medium">
                                                                {key}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatAttributeValue(
                                                                    value,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                Sin datos posteriores.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : changeSections?.before ||
                              changeSections?.after ? (
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">
                                            Antes
                                        </p>
                                        {changeSections.before ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Campo
                                                        </TableHead>
                                                        <TableHead>
                                                            Valor
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.entries(
                                                        changeSections.before,
                                                    ).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell className="font-medium">
                                                                {key}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatAttributeValue(
                                                                    value,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                Sin datos previos.
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">
                                            Después
                                        </p>
                                        {changeSections.after ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Campo
                                                        </TableHead>
                                                        <TableHead>
                                                            Valor
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.entries(
                                                        changeSections.after,
                                                    ).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell className="font-medium">
                                                                {key}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatAttributeValue(
                                                                    value,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                Sin datos posteriores.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : comparisonSections?.differences?.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Campo</TableHead>
                                            <TableHead>Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {comparisonSections.differences.map(
                                            (entry, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">
                                                        Diferencia {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatAttributeValue(
                                                            entry,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            ) : changeSections?.entries?.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Campo</TableHead>
                                            <TableHead>Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {changeSections.entries.map(
                                            ([key, value]) => (
                                                <TableRow key={key}>
                                                    <TableCell className="font-medium">
                                                        {key}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatAttributeValue(
                                                            value,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No hay cambios para mostrar.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Entidad</CardTitle>
                            <CardDescription>
                                Estado actual de la entidad relacionada.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {itemEntries.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    No hay información adicional.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Campo</TableHead>
                                            <TableHead>Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {itemEntries.map(([key, value]) => (
                                            <TableRow key={key}>
                                                <TableCell className="font-medium">
                                                    {key}
                                                </TableCell>
                                                <TableCell>
                                                    {formatAttributeValue(
                                                        value,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
