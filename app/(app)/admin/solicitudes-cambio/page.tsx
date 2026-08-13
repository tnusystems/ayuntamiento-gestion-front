"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { fetchApprovalRequests } from "@/lib/api/approval-requests";
import { mockApprovalRequests, MOCK_FALLBACK_MESSAGE } from "@/lib/mock-fallbacks";
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

const getStatusConfig = (status?: string | null) => {
    if (!status) return statusConfig.pending;
    return statusConfig[status as ApprovalStatus] ?? statusConfig.pending;
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

        const loadApprovals = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await fetchApprovalRequests({
                    page: currentPage,
                    per_page: itemsPerPage,
                });
                if (!active) return;
                setRequests(response.data.map(mapApprovalToItem));
                const responsePage = response.pagination?.current_page ?? currentPage;
                const totalPages = Math.max(
                    1,
                    response.pagination?.total_pages ?? 1,
                );
                const totalCount = response.pagination?.total_count ?? response.data.length;
                const perPage = response.pagination?.per_page ?? itemsPerPage;
                setPagination({
                    currentPage: responsePage,
                    totalPages,
                    totalCount,
                    perPage,
                });
            } catch (error) {
                if (!active) return;
                setRequests(mockApprovalRequests.map(mapApprovalToItem));
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalCount: mockApprovalRequests.length,
                    perPage: itemsPerPage,
                });
                setLoadError(MOCK_FALLBACK_MESSAGE);
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
    }, [currentPage]);

    const totalPages = Math.max(1, pagination.totalPages || 1);
    const activePage = pagination.currentPage || currentPage;
    const displayFrom =
        pagination.totalCount === 0
            ? 0
            : (activePage - 1) * pagination.perPage + 1;
    const displayTo =
        pagination.totalCount === 0
            ? 0
            : Math.min(displayFrom + requests.length - 1, pagination.totalCount);

    return (
        <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-8">
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
                <CardContent className="space-y-4">
                    {loadError ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            {loadError}
                        </div>
                    ) : null}
                    <div className="space-y-3 lg:hidden">
                        {isLoading ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                Cargando aprobaciones...
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
                                <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
                                <div>
                                    <p className="font-medium">
                                        Sin aprobaciones por ahora
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Aún no hay solicitudes de aprobación
                                        para revisar.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            requests.map((request) => {
                                const status = getStatusConfig(request.status);

                                return (
                                    <button
                                        key={request.id}
                                        type="button"
                                        className="w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/40"
                                        onClick={() =>
                                            router.push(
                                                `/admin/solicitudes-cambio/${request.id}`,
                                            )
                                        }
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Solicitud #{request.id}
                                                </p>
                                                <p className="font-medium">
                                                    {request.subject}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(status.className)}
                                            >
                                                {status.label}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 space-y-1.5 text-sm">
                                            <p className="break-words">
                                                <span className="text-muted-foreground">
                                                    Acción:
                                                </span>{" "}
                                                {request.action}
                                            </p>
                                            <p className="break-words">
                                                <span className="text-muted-foreground">
                                                    Solicitante:
                                                </span>{" "}
                                                {request.requested_by}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">
                                                    Fecha:
                                                </span>{" "}
                                                {formatDate(request.requested_at)}
                                            </p>
                                            <p className="break-words text-muted-foreground">
                                                {request.details}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="hidden lg:block">
                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20 whitespace-normal">
                                        Solicitud
                                    </TableHead>
                                    <TableHead className="w-[14%] whitespace-normal">
                                        Entidad
                                    </TableHead>
                                    <TableHead className="w-[12%] whitespace-normal">
                                        Acción
                                    </TableHead>
                                    <TableHead className="w-[28%] whitespace-normal">
                                        Detalle
                                    </TableHead>
                                    <TableHead className="w-[22%] whitespace-normal">
                                        Solicitante
                                    </TableHead>
                                    <TableHead className="w-[12%] whitespace-normal">
                                        Fecha
                                    </TableHead>
                                    <TableHead className="w-[10%] whitespace-normal">
                                        Estado
                                    </TableHead>
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
                                ) : requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                                <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
                                                <div>
                                                    <p className="font-medium">
                                                        Sin aprobaciones por
                                                        ahora
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Aún no hay solicitudes
                                                        de aprobación para
                                                        revisar.
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((request) => {
                                        const status = getStatusConfig(
                                            request.status,
                                        );

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
                                                <TableCell className="font-medium whitespace-normal align-top">
                                                    {request.id}
                                                </TableCell>
                                                <TableCell className="whitespace-normal break-words align-top">
                                                    {request.subject}
                                                </TableCell>
                                                <TableCell className="whitespace-normal break-words align-top">
                                                    {request.action}
                                                </TableCell>
                                                <TableCell className="whitespace-normal break-words align-top">
                                                    <span className="text-sm break-words">
                                                        {request.details}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="whitespace-normal break-all align-top">
                                                    {request.requested_by}
                                                </TableCell>
                                                <TableCell className="whitespace-normal align-top">
                                                    {formatDate(
                                                        request.requested_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-normal align-top">
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
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
                        <p className="text-center text-sm text-muted-foreground sm:text-left">
                            Mostrando {displayFrom} a {displayTo} de {pagination.totalCount} solicitudes
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((page) => Math.max(1, page - 1))
                                }
                                disabled={activePage <= 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Anterior
                                </span>
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Página {activePage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((page) =>
                                        Math.min(totalPages, page + 1),
                                    )
                                }
                                disabled={activePage >= totalPages || isLoading}
                            >
                                <span className="hidden sm:inline">
                                    Siguiente
                                </span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
