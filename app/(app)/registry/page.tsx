"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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

type RegistryItem = {
    id: number;
    name: string;
    rpp_number: string;
    rpp_volume: string;
    rpp_section: string;
    rpp_date: string;
    rpp_antecedent: string;
    rpp_antecedent_1: string;
    rpp_antecedent_2: string;
    rpp_antecedent_3: string;
    rpp_antecedent_4: string;
    rpp_antecedent_5: string;
    b_number: string;
    b_volume: string;
    b_date: string;
    e_number: string;
    e_notary: string;
    e_date: string;
    co_number: string;
    co_date: string;
    status: string;
    fecha_alta: string;
    st_baja: boolean;
    created_at: string;
    updated_at: string;
};

const registryItems: RegistryItem[] = [
    {
        id: 0,
        name: "string",
        rpp_number: "string",
        rpp_volume: "string",
        rpp_section: "string",
        rpp_date: "2026-01-23T16:52:39.460Z",
        rpp_antecedent: "string",
        rpp_antecedent_1: "string",
        rpp_antecedent_2: "string",
        rpp_antecedent_3: "string",
        rpp_antecedent_4: "string",
        rpp_antecedent_5: "string",
        b_number: "string",
        b_volume: "string",
        b_date: "2026-01-23T16:52:39.460Z",
        e_number: "string",
        e_notary: "string",
        e_date: "2026-01-23T16:52:39.460Z",
        co_number: "string",
        co_date: "2026-01-23T16:52:39.460Z",
        status: "string",
        fecha_alta: "2026-01-23T16:52:39.460Z",
        st_baja: true,
        created_at: "2026-01-23T16:52:39.460Z",
        updated_at: "2026-01-23T16:52:39.460Z",
    },
];

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

const formatDate = (value: string) => {
    if (!value) return "—";
    const date = new Date(value);
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
    }).format(date);
};

export default function RegistryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("todos");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredItems = useMemo(() => {
        return registryItems.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.rpp_number
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                item.b_number.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "todos" || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                    <Input
                        placeholder="Buscar por nombre, RPP o B número..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full sm:w-72"
                    />
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="Estatus" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">
                                Todos los estatus
                            </SelectItem>
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="baja">Baja</SelectItem>
                            <SelectItem value="en_tramite">
                                En trámite
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button>Registrar Nuevo</Button>
            </div>

            <div className="rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Nombre</TableHead>
                            <TableHead>RPP</TableHead>
                            <TableHead>Libro (B)</TableHead>
                            <TableHead>Escritura</TableHead>
                            <TableHead>Certificado</TableHead>
                            <TableHead>Fechas</TableHead>
                            <TableHead>Estatus</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedItems.map((item) => {
                            const statusKey = statusConfig[item.status]
                                ? item.status
                                : "default";
                            return (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p className="font-mono">
                                                {item.rpp_number}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Vol. {item.rpp_volume} · Secc.{" "}
                                                {item.rpp_section}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(item.rpp_date)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p className="font-mono">
                                                {item.b_number}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Vol. {item.b_volume}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(item.b_date)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p className="font-mono">
                                                {item.e_number}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {item.e_notary}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(item.e_date)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p className="font-mono">
                                                {item.co_number}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(item.co_date)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-muted-foreground">
                                            <p>
                                                Alta:{" "}
                                                {formatDate(item.fecha_alta)}
                                            </p>
                                            <p>
                                                Creado:{" "}
                                                {formatDate(item.created_at)}
                                            </p>
                                            <p>
                                                Actualizado:{" "}
                                                {formatDate(item.updated_at)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    statusConfig[statusKey]
                                                        .className
                                                }
                                            >
                                                {statusConfig[statusKey].label}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                Baja:{" "}
                                                {item.st_baja ? "Sí" : "No"}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {startIndex + 1} a{" "}
                        {Math.min(
                            startIndex + itemsPerPage,
                            filteredItems.length,
                        )}{" "}
                        de {filteredItems.length} registros
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1),
                                )
                            }
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
