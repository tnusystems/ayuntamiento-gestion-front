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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    approveApprovalRequest,
    cancelApprovalRequest,
    fetchApprovalRequest,
    rejectApprovalRequest,
    retryApprovalRequest,
} from "@/lib/api/approval-requests";
import {
    fetchCatalogs,
    type LookupCatalogs,
    type LookupKind,
} from "@/lib/api/lookup-values";
import { fetchOperationTypes } from "@/lib/api/operation-types";
import type { ApprovalRequest, OperationType } from "@/types";

type ApprovalStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "executed"
    | "failed"
    | "canceled";

const statusConfig: Record<
    ApprovalStatus,
    { label: string; className: string }
> = {
    pending: {
        label: "Pendiente",
        className: "text-warning border-warning/30 bg-warning/10",
    },
    approved: {
        label: "Aprobado",
        className: "text-success border-success/30 bg-success/10",
    },
    rejected: {
        label: "Rechazado",
        className: "text-destructive border-destructive/30 bg-destructive/10",
    },
    executed: {
        label: "Ejecutado",
        className: "text-primary border-primary/20 bg-primary/10",
    },
    failed: {
        label: "Fallido",
        className: "text-destructive border-destructive/30 bg-destructive/10",
    },
    canceled: {
        label: "Cancelado",
        className: "text-muted-foreground border-border bg-muted/50",
    },
};

const subjectLabels: Record<string, string> = {
    Registry: "Registro",
    Asset: "Bien",
    InventoryProcess: "Proceso de inventario",
};

const actionLabels: Record<string, string> = {
    "inventory_process.create": "Crear proceso de inventario",
    "inventory_process.update": "Actualizar proceso de inventario",
    "asset.create": "Crear bien",
    "asset.update": "Actualizar bien",
    "registry.create": "Crear registro",
    "registry.update": "Actualizar registro",
};

const fieldLabels: Record<string, string> = {
    id: "ID",
    notes: "Notas",
    reason: "Razón",
    status: "Estado",
    action: "Acción",
    opened_at: "Fecha de apertura",
    requested_at: "Fecha de solicitud",
    decided_at: "Fecha de decisión",
    executed_at: "Fecha de ejecución",
    created_at: "Fecha de creación",
    updated_at: "Fecha de actualización",
    process_type: "Tipo de proceso",
    inventory_status: "Estado de inventario",
    owner_name: "Propietario",
    operation_type_id: "Tipo de operación",
    registry_id: "Registro",
    zone_id: "Zona",
    domain_id: "Dominio",
    stage_definition_id: "Etapa del trámite",
    land_use_id: "Uso de suelo",
    verification_status_id: "Estado de verificación",
    rpp_number: "Número RPP",
    c_number: "Número catastral",
    lot: "Lote",
    block: "Manzana",
    colony: "Colonia",
    street: "Calle",
    total_area: "Superficie total",
    built_area: "Superficie construida",
    cadastral_value: "Valor catastral",
    commercial_value: "Valor comercial",
    latitude: "Latitud",
    longitude: "Longitud",
};

const fieldCatalogMap: Partial<Record<string, LookupKind | "operation_type">> = {
    domain_id: "domain",
    zone_id: "zone",
    stage_definition_id: "stage_definition",
    land_use_id: "situation",
    verification_status_id: "verification_status",
    operation_type_id: "operation_type",
};

const valueLabels: Record<string, Record<string, string>> = {
    status: {
        ABIERTA: "Abierta",
        CERRADA: "Cerrada",
        PENDIENTE: "Pendiente",
        APROBADA: "Aprobada",
        RECHAZADA: "Rechazada",
        EJECUTADA: "Ejecutada",
        open: "Abierta",
        closed: "Cerrada",
        pending: "Pendiente",
        approved: "Aprobada",
        rejected: "Rechazada",
        executed: "Ejecutada",
    },
    process_type: {
        alta: "Alta",
        baja: "Baja",
    },
    inventory_status: {
        active: "Activo",
        maintenance: "Mantenimiento",
        baja: "Baja",
    },
};

const formatFieldKey = (key: string) => {
    if (!key) return "—";
    if (fieldLabels[key]) return fieldLabels[key];
    if (key.endsWith("_id")) {
        const base = key.slice(0, -3).replace(/_/g, " ");
        return `${base.charAt(0).toUpperCase()}${base.slice(1)} ID`;
    }
    const normalized = key.replace(/_/g, " ");
    return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
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
    if (!value) return "—";
    if (actionLabels[value]) return actionLabels[value];
    return value.replace(/\./g, " ");
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

const findLabelByValue = (
    labels: Record<string, string>,
    value: string,
): string | null => {
    if (labels[value]) return labels[value];
    const lowered = value.toLowerCase();
    const match = Object.entries(labels).find(
        ([key]) => key.toLowerCase() === lowered,
    );
    return match?.[1] ?? null;
};

const formatPerson = (
    person?: {
        id?: number | string | null;
        name?: string | null;
        email?: string | null;
    } | null,
    fallbackId?: number | string | null,
) => {
    if (!person) {
        return fallbackId ? `Usuario #${fallbackId}` : "—";
    }
    const name = person.name?.trim();
    const email = person.email?.trim();
    if (name && email) return `${name} (${email})`;
    if (name) return name;
    if (email) return email;
    return person.id
        ? `Usuario #${person.id}`
        : fallbackId
          ? `Usuario #${fallbackId}`
          : "—";
};

const formatSubjectSummary = (subject?: Record<string, unknown> | null) => {
    if (!subject) return "—";
    const parts: string[] = [];
    const name = typeof subject.name === "string" ? subject.name.trim() : "";
    const rpp =
        typeof subject.rpp_number === "string" ? subject.rpp_number.trim() : "";
    const status =
        typeof subject.status === "string" ? subject.status.trim() : "";
    if (rpp) parts.push(`RPP: ${rpp}`);
    if (name) parts.push(name);
    if (status) parts.push(status);
    return parts.length > 0 ? parts.join(" · ") : "—";
};

export default function ApprovalRequestDetailPage() {
    const params = useParams();
    const requestId = useMemo(() => {
        const raw = params?.id;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params]);
    const [request, setRequest] = useState<ApprovalRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [comment, setComment] = useState("");
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionNotice, setActionNotice] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<
        "approve" | "reject" | "retry" | "cancel" | null
    >(null);
    const [catalogs, setCatalogs] = useState<LookupCatalogs | null>(null);
    const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);

    useEffect(() => {
        let active = true;

        const loadLookups = async () => {
            try {
                const [catalogsResponse, operationTypesResponse] =
                    await Promise.all([fetchCatalogs(), fetchOperationTypes()]);
                if (!active) return;
                setCatalogs(catalogsResponse);
                setOperationTypes(operationTypesResponse);
            } catch {
                if (!active) return;
                setCatalogs(null);
                setOperationTypes([]);
            }
        };

        void loadLookups();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadRequest = async (id: string) => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await fetchApprovalRequest(id);
                if (!active) return;
                setRequest(response);
            } catch (error) {
                if (!active) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Error al cargar la solicitud.",
                );
                setRequest(null);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        if (requestId) {
            void loadRequest(requestId);
        } else {
            setIsLoading(false);
            setLoadError("Solicitud no encontrada.");
        }

        return () => {
            active = false;
        };
    }, [requestId]);

    const refreshRequest = async (id: string) => {
        const response = await fetchApprovalRequest(id);
        setRequest(response);
    };

    const handleApprove = async () => {
        if (!requestId) return;
        if (!comment.trim()) {
            setActionError("Agrega un comentario para aprobar la solicitud.");
            return;
        }
        setActionError(null);
        setActionNotice(null);
        setActionLoading("approve");
        try {
            await approveApprovalRequest(requestId, comment.trim());
            await refreshRequest(requestId);
            setActionNotice("Solicitud aprobada.");
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "No se pudo aprobar la solicitud.",
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!requestId) return;
        if (!comment.trim()) {
            setActionError("Agrega un comentario para rechazar la solicitud.");
            return;
        }
        setActionError(null);
        setActionNotice(null);
        setActionLoading("reject");
        try {
            await rejectApprovalRequest(requestId, comment.trim());
            await refreshRequest(requestId);
            setActionNotice("Solicitud rechazada.");
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "No se pudo rechazar la solicitud.",
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleRetry = async () => {
        if (!requestId) return;
        setActionError(null);
        setActionNotice(null);
        setActionLoading("retry");
        try {
            await retryApprovalRequest(requestId);
            await refreshRequest(requestId);
            setActionNotice("Reintento enviado.");
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "No se pudo reintentar la solicitud.",
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async () => {
        if (!requestId) return;
        setActionError(null);
        setActionNotice(null);
        setActionLoading("cancel");
        try {
            await cancelApprovalRequest(requestId);
            await refreshRequest(requestId);
            setActionNotice("Solicitud cancelada.");
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "No se pudo cancelar la solicitud.",
            );
        } finally {
            setActionLoading(null);
        }
    };

    const statusKey = (request?.status as ApprovalStatus) ?? "pending";
    const status = statusConfig[statusKey] ?? statusConfig.pending;
    const requesterName = request?.requested_by?.name?.trim();
    const requesterEmail = request?.requested_by?.email?.trim();
    const requestedBy = requesterName
        ? requesterEmail
            ? `${requesterName} (${requesterEmail})`
            : requesterName
        : requesterEmail || `Usuario #${request?.requested_by_id ?? "—"}`;
    const subjectType = request?.subject_type
        ? (subjectLabels[request.subject_type] ?? request.subject_type)
        : "Solicitud";
    const subjectId =
        request?.subject_id !== null && request?.subject_id !== undefined
            ? `#${request.subject_id}`
            : "Nuevo";
    const payloadValue =
        request?.payload && typeof request.payload === "object"
            ? (request.payload as Record<string, unknown>)
            : null;
    const payloadContent =
        payloadValue && typeof payloadValue.changes === "object"
            ? (payloadValue.changes as Record<string, unknown>)
            : payloadValue && typeof payloadValue.attributes === "object"
              ? (payloadValue.attributes as Record<string, unknown>)
              : payloadValue;
    const payloadEntries = payloadContent ? Object.entries(payloadContent) : [];
    const isBusy = isLoading || actionLoading !== null;
    const subjectDetails =
        request?.subject && typeof request.subject === "object"
            ? (request.subject as Record<string, unknown>)
            : null;
    const subjectDetailEntries = subjectDetails
        ? Object.entries(subjectDetails)
        : [];
    const catalogMaps = useMemo(() => {
        const result: Partial<Record<LookupKind, Map<string, string>>> = {};
        if (!catalogs) {
            return result;
        }
        (Object.entries(catalogs) as [LookupKind, LookupCatalogs[LookupKind]][]).forEach(
            ([kind, values]) => {
                result[kind] = new Map(
                    values.map((item) => [
                        String(item.id),
                        item.name ?? String(item.key ?? item.id),
                    ]),
                );
            },
        );
        return result;
    }, [catalogs]);
    const operationTypeMap = useMemo(
        () =>
            new Map(
                operationTypes.map((item) => [
                    String(item.id),
                    item.name ?? item.key ?? String(item.id),
                ]),
            ),
        [operationTypes],
    );

    const formatTranslatedValue = (key: string, value: unknown) => {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        const catalogKey = fieldCatalogMap[key];
        const valueAsText =
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
                ? String(value)
                : "";

        if (catalogKey && valueAsText) {
            const catalogLabel =
                catalogKey === "operation_type"
                    ? operationTypeMap.get(valueAsText)
                    : catalogMaps[catalogKey]?.get(valueAsText);
            if (catalogLabel) {
                return `${catalogLabel} (#${valueAsText})`;
            }
            if (typeof value === "number" || /^\d+$/.test(valueAsText)) {
                return `#${valueAsText}`;
            }
        }

        if (typeof value === "string") {
            const labelsByField = valueLabels[key];
            if (labelsByField) {
                const translated = findLabelByValue(labelsByField, value);
                if (translated) return translated;
            }
            if (/_at$|_date$/i.test(key)) {
                return formatDateTime(value);
            }
        }

        return formatAttributeValue(value);
    };

    return (
        <div className="container mx-auto space-y-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Solicitud #{requestId ?? "—"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Detalle de la solicitud de aprobación.
                    </p>
                </div>
                <Button variant="ghost" asChild>
                    <Link href="/admin/solicitudes-cambio">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Cargando solicitud...
                    </CardContent>
                </Card>
            ) : loadError ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-destructive">
                        {loadError}
                    </CardContent>
                </Card>
            ) : !request ? (
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
                    {statusKey !== "executed" && statusKey !== "rejected" ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Acciones</CardTitle>
                                <CardDescription>
                                    Aprueba o rechaza la solicitud con un
                                    comentario.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Agrega un comentario..."
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(event.target.value)
                                    }
                                    disabled={isBusy}
                                />
                                {actionError ? (
                                    <div className="text-sm text-destructive">
                                        {actionError}
                                    </div>
                                ) : null}
                                {actionNotice ? (
                                    <div className="text-sm text-success">
                                        {actionNotice}
                                    </div>
                                ) : null}
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isBusy}
                                    >
                                        {actionLoading === "approve"
                                            ? "Aprobando..."
                                            : "Aprobar"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleReject}
                                        disabled={isBusy}
                                    >
                                        {actionLoading === "reject"
                                            ? "Rechazando..."
                                            : "Rechazar"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleRetry}
                                        disabled={isBusy}
                                    >
                                        {actionLoading === "retry"
                                            ? "Reintentando..."
                                            : "Reintentar"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isBusy}
                                    >
                                        {actionLoading === "cancel"
                                            ? "Cancelando..."
                                            : "Cancelar"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen</CardTitle>
                            <CardDescription>
                                Estado y datos generales de la solicitud.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Estado
                                </p>
                                <Badge
                                    variant="outline"
                                    className={cn(status.className)}
                                >
                                    {status.label}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Acción
                                </p>
                                <p className="font-medium">
                                    {formatAction(request.action)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Entidad
                                </p>
                                <p className="font-medium">
                                    {subjectType} {subjectId}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Solicitante
                                </p>
                                <p className="font-medium">{requestedBy}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Aprobado por
                                </p>
                                <p className="font-medium">
                                    {formatPerson(
                                        request.approved_by,
                                        request.approved_by_id,
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Ejecutado por
                                </p>
                                <p className="font-medium">
                                    {formatPerson(
                                        request.executed_by,
                                        request.executed_by_id,
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Solicitado
                                </p>
                                <p className="font-medium">
                                    {formatDateTime(request.requested_at)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Decidido
                                </p>
                                <p className="font-medium">
                                    {formatDateTime(request.decided_at)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Ejecutado
                                </p>
                                <p className="font-medium">
                                    {formatDateTime(request.executed_at)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Comentario
                                </p>
                                <p className="font-medium">
                                    {valueOrDash(request.decision_comment)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Razón
                                </p>
                                <p className="font-medium">
                                    {valueOrDash(request.reason)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Fallo
                                </p>
                                <p className="font-medium">
                                    {valueOrDash(request.failure_message)}
                                </p>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <p className="text-xs uppercase text-muted-foreground">
                                    Resultado
                                </p>
                                <p className="font-medium">
                                    {formatSubjectSummary(subjectDetails)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cambios</CardTitle>
                                <CardDescription>
                                    Información enviada en el payload.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {payloadEntries.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">
                                        No hay atributos para mostrar.
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
                                            {payloadEntries.map(
                                                ([key, value]) => (
                                                    <TableRow key={key}>
                                                        <TableCell className="font-medium">
                                                            {formatFieldKey(key)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatTranslatedValue(
                                                                key,
                                                                value,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Entidad actual</CardTitle>
                                <CardDescription>
                                    Información generada cuando la solicitud ya
                                    fue ejecutada.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!subjectDetails ? (
                                    <div className="text-sm text-muted-foreground">
                                        No hay información adicional para
                                        mostrar.
                                    </div>
                                ) : subjectDetailEntries.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">
                                        La entidad no tiene campos disponibles.
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
                                            {subjectDetailEntries.map(
                                                ([key, value]) => (
                                                    <TableRow key={key}>
                                                        <TableCell className="font-medium">
                                                            {formatFieldKey(key)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatTranslatedValue(
                                                                key,
                                                                value,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
