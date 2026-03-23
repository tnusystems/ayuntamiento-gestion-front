"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchRegistries } from "@/lib/api/registries";

type RegistryItem = Awaited<ReturnType<typeof fetchRegistries>>["data"][number];

const statusConfig: Record<string, { label: string; className: string }> = {
    activo: {
        label: "Activo",
        className: "bg-success/10 text-success border-success/20",
    },
    baja: {
        label: "Baja",
        className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    en_tramite: {
        label: "En Trámite",
        className: "bg-warning/10 text-warning-foreground border-warning/20",
    },
    default: {
        label: "Sin estatus",
        className: "bg-muted/50 text-muted-foreground border-border",
    },
};

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
    }).format(date);
};

export default function RegistryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("todos");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [data, setData] = useState<RegistryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        perPage: itemsPerPage,
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        let active = true;
        const loadRegistry = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await fetchRegistries({
                    page: currentPage,
                    per_page: itemsPerPage,
                    q: debouncedSearch || undefined,
                    status: statusFilter !== "todos" ? statusFilter : undefined,
                });

                if (!active) return;
                setData(response.data ?? []);
                const responsePage = response.pagination?.current_page ?? currentPage;
                if (responsePage !== currentPage) {
                    setCurrentPage(responsePage);
                }
                setPagination({
                    currentPage: responsePage,
                    totalPages: Math.max(1, response.pagination?.total_pages ?? 1),
                    totalCount: response.pagination?.total_count ?? response.data.length,
                    perPage: response.pagination?.per_page ?? itemsPerPage,
                });
            } catch (error) {
                if (!active) return;
                if (error instanceof Error && error.name === "AbortError") {
                    return;
                }
                setLoadError(
                    error instanceof Error ? error.message : "Error al cargar registros.",
                );
                setData([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalCount: 0,
                    perPage: itemsPerPage,
                });
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadRegistry();
        return () => {
            active = false;
        };
    }, [currentPage, debouncedSearch, itemsPerPage, statusFilter]);

    const displayFrom =
        pagination.totalCount === 0
            ? 0
            : (pagination.currentPage - 1) * pagination.perPage + 1;
    const displayTo =
        pagination.totalCount === 0
            ? 0
            : (pagination.currentPage - 1) * pagination.perPage + data.length;

    return (
        <div className="space-y-4 overflow-x-hidden">
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row">
                    <Input
                        placeholder="Buscar por nombre, RPP o B número..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full md:w-72"
                        disabled={isLoading}
                    />
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-full md:w-44">
                            <SelectValue placeholder="Estatus" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los estatus</SelectItem>
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="baja">Baja</SelectItem>
                            <SelectItem value="en_tramite">En trámite</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button asChild className="w-full md:w-auto">
                    <Link href="/registry/new">Registrar Nuevo</Link>
                </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="space-y-3 p-4 lg:hidden">
                    {isLoading ? (
                        <p className="rounded-md border border-border px-4 py-6 text-center text-sm text-muted-foreground">
                            Cargando registros...
                        </p>
                    ) : loadError ? (
                        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
                            {loadError}
                        </p>
                    ) : data.length === 0 ? (
                        <p className="rounded-md border border-border px-4 py-6 text-center text-sm text-muted-foreground">
                            No hay registros para mostrar.
                        </p>
                    ) : (
                        data.map((item) => {
                            const statusValue = item.status ?? "default";
                            const statusKey = statusConfig[statusValue]
                                ? statusValue
                                : "default";

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="w-full rounded-md border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted/40"
                                    onClick={() => router.push(`/assets/${item.id}`)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-medium leading-tight">
                                            {item.name ?? "—"}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className={statusConfig[statusKey].className}
                                        >
                                            {statusConfig[statusKey].label}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 space-y-1.5 text-sm">
                                        <p>
                                            <span className="text-xs text-muted-foreground">
                                                RPP:
                                            </span>{" "}
                                            <span className="font-mono">
                                                {item.rpp_number ?? "—"}
                                            </span>
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="text-xs">Libro B:</span>{" "}
                                            <span className="font-mono">
                                                {item.b_number ?? "—"}
                                            </span>
                                            {" · "}
                                            <span className="text-xs">Escritura:</span>{" "}
                                            <span className="font-mono">
                                                {item.e_number ?? "—"}
                                            </span>
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="text-xs">Actualizado:</span>{" "}
                                            {formatDate(item.updated_at)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Baja: {item.st_baja ? "Sí" : "No"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="hidden lg:block">
                    <Table className="[&_td]:whitespace-normal">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-4">Nombre</TableHead>
                                <TableHead>RPP</TableHead>
                                <TableHead>Libro (B)</TableHead>
                                <TableHead>Escritura</TableHead>
                                <TableHead>Certificado</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Estatus</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        Cargando registros...
                                    </TableCell>
                                </TableRow>
                            ) : loadError ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-destructive"
                                    >
                                        {loadError}
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No hay registros para mostrar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => {
                                    const statusValue = item.status ?? "default";
                                    const statusKey = statusConfig[statusValue]
                                        ? statusValue
                                        : "default";
                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.push(`/assets/${item.id}`)}
                                        >
                                            <TableCell className="pl-4 font-medium">
                                                {item.name ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            RPP Número:
                                                        </span>
                                                        <span className="font-mono">
                                                            {item.rpp_number ?? "—"}
                                                        </span>
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="text-xs">Volumen:</span>{" "}
                                                        {item.rpp_volume ?? "—"} ·{" "}
                                                        <span className="text-xs">Sección:</span>{" "}
                                                        {item.rpp_section ?? "—"}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="text-xs">RPP Fecha:</span>{" "}
                                                        {formatDate(item.rpp_date)}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            Libro B:
                                                        </span>
                                                        <span className="font-mono">
                                                            {item.b_number ?? "—"}
                                                        </span>
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="text-xs">Volumen:</span>{" "}
                                                        {item.b_volume ?? "—"}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="text-xs">Fecha:</span>{" "}
                                                        {formatDate(item.b_date)}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            Escritura:
                                                        </span>
                                                        <span className="font-mono">
                                                            {item.e_number ?? "—"}
                                                        </span>
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="text-xs">Notaría:</span>{" "}
                                                        {item.e_notary ?? "—"}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="text-xs">Fecha:</span>{" "}
                                                        {formatDate(item.e_date)}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            Certificado:
                                                        </span>
                                                        <span className="font-mono">
                                                            {item.co_number ?? "—"}
                                                        </span>
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="text-xs">Fecha:</span>{" "}
                                                        {formatDate(item.co_date)}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    <p>
                                                        <span className="text-xs">Alta:</span>{" "}
                                                        {formatDate(item.fecha_alta)}
                                                    </p>
                                                    <p>
                                                        <span className="text-xs">Creado:</span>{" "}
                                                        {formatDate(item.created_at)}
                                                    </p>
                                                    <p>
                                                        <span className="text-xs">Actualizado:</span>{" "}
                                                        {formatDate(item.updated_at)}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={statusConfig[statusKey].className}
                                                    >
                                                        {statusConfig[statusKey].label}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground">
                                                        Baja: {item.st_baja ? "Sí" : "No"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-center text-sm text-muted-foreground sm:text-left">
                        Mostrando {displayFrom} a {displayTo} de {pagination.totalCount}{" "}
                        registros
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={pagination.currentPage <= 1 || isLoading}
                            className="w-full sm:w-auto"
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                            }
                            disabled={
                                pagination.currentPage >= pagination.totalPages || isLoading
                            }
                            className="w-full sm:w-auto"
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
