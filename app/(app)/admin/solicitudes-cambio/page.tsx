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
import { fetchApprovalRequests } from "@/lib/api/approval-requests";
import type { ApprovalRequest } from "@/types";

type ApprovalStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "executed"
    | "failed"
    | "canceled";

type ApprovalItem = {
    id: string;
    subject: string;
    action: string;
    details: string;
    requested_by: string;
    requested_at?: string | null;
    status: ApprovalStatus;
};

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

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const formatAction = (value?: string | null) => {
    if (!value) return "—";
    return value.replace(/\./g, " ");
};

const buildDetails = (approval: ApprovalRequest) => {
    const attrs = approval.payload?.attributes;
    if (!attrs || typeof attrs !== "object") return "—";
    const details = attrs as Record<string, unknown>;
    const parts: string[] = [];
    if (details.rpp_number) {
        parts.push(`RPP: ${details.rpp_number}`);
    }
    if (details.name) {
        parts.push(`Nombre: ${details.name}`);
    }
    if (details.b_number) {
        parts.push(`B: ${details.b_number}`);
    }
    if (details.e_number) {
        parts.push(`Escritura: ${details.e_number}`);
    }
    if (details.co_number) {
        parts.push(`Certificado: ${details.co_number}`);
    }
    return parts.length > 0 ? parts.join(" · ") : "—";
};

const mapApprovalToItem = (approval: ApprovalRequest): ApprovalItem => {
    const subjectType = approval.subject_type
        ? (subjectLabels[approval.subject_type] ?? approval.subject_type)
        : "Solicitud";
    const subjectId =
        approval.subject_id !== null && approval.subject_id !== undefined
            ? ` #${approval.subject_id}`
            : " (nuevo)";
    const requesterName = approval.requested_by?.name?.trim();
    const requesterEmail = approval.requested_by?.email?.trim();
    const requestedBy = requesterName
        ? requesterEmail
            ? `${requesterName} (${requesterEmail})`
            : requesterName
        : requesterEmail || `Usuario #${approval.requested_by_id ?? "—"}`;
    return {
        id: String(approval.id),
        subject: `${subjectType}${subjectId}`,
        action: formatAction(approval.action),
        details: buildDetails(approval),
        requested_by: requestedBy,
        requested_at: approval.requested_at ?? approval.created_at ?? null,
        status: (approval.status as ApprovalStatus) ?? "pending",
    };
};

export default function AdminChangeRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<ApprovalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadApprovals = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await fetchApprovalRequests();
                if (!active) return;
                setRequests(response.data.map(mapApprovalToItem));
            } catch (error) {
                if (!active) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Error al cargar aprobaciones.",
                );
                setRequests([]);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadApprovals();
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Solicitudes de aprobación
                </h1>
                <p className="text-sm text-muted-foreground">
                    Revisión y seguimiento de solicitudes pendientes.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Aprobaciones registradas</CardTitle>
                    <CardDescription>
                        Listado de solicitudes de aprobación del sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Solicitud</TableHead>
                                <TableHead>Entidad</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead>Detalle</TableHead>
                                <TableHead>Solicitante</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-sm text-muted-foreground">
                                            Cargando aprobaciones...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : loadError ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-sm text-destructive">
                                            {loadError}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                            <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
                                            <div>
                                                <p className="font-medium">
                                                    Sin aprobaciones por ahora
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Aún no hay solicitudes de
                                                    aprobación para revisar.
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => {
                                    const statusKey =
                                        request.status || "pending";
                                    const status =
                                        statusConfig[statusKey] ||
                                        statusConfig.pending;

                                    return (
                                        <TableRow
                                            key={request.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() =>
                                                router.push(
                                                    `/admin/solicitudes-cambio/${request.id}`,
                                                )
                                            }
                                        >
                                            <TableCell className="font-medium">
                                                {request.id}
                                            </TableCell>
                                            <TableCell>
                                                {request.subject}
                                            </TableCell>
                                            <TableCell>
                                                {request.action}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {request.details}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {request.requested_by}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    request.requested_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        status.className,
                                                    )}
                                                >
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
