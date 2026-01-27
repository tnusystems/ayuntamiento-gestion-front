"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { getBienesByExpediente, getExpedienteById } from "@/lib/mock-data2";

// Componente de Filtros
function BienesTableFilters({
    searchTerm,
    setSearchTerm,
    estatusFilter,
    setEstatusFilter,
    tipoFilter,
    setTipoFilter,
    categoriaFilter,
    setCategoriaFilter,
    categorias,
}: {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    estatusFilter: string;
    setEstatusFilter: (value: string) => void;
    tipoFilter: string;
    setTipoFilter: (value: string) => void;
    categoriaFilter: string;
    setCategoriaFilter: (value: string) => void;
    categorias: string[];
}) {
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                <input
                    placeholder="Buscar por nombre, ubicación o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-72"
                />
                <select
                    value={estatusFilter}
                    onChange={(e) => setEstatusFilter(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-40"
                >
                    <option value="todos">Todos los estatus</option>
                    <option value="activo">Activo</option>
                    <option value="baja">Baja</option>
                    <option value="en_tramite">En Trámite</option>
                </select>
                <select
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-40"
                >
                    <option value="todos">Todos los tipos</option>
                    <option value="inmueble">Inmueble</option>
                    <option value="mueble">Mueble</option>
                </select>
                <select
                    value={categoriaFilter}
                    onChange={(e) => setCategoriaFilter(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-40"
                >
                    <option value="todos">Todas las categorías</option>
                    {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

// Componente de Paginación
function BienesTablePagination({
    currentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    filteredBienes,
    setCurrentPage,
}: {
    currentPage: number;
    totalPages: number;
    startIndex: number;
    itemsPerPage: number;
    filteredBienes: any[];
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
}) {
    return (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a{" "}
                {Math.min(startIndex + itemsPerPage, filteredBienes.length)} de{" "}
                {filteredBienes.length} bienes
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                    ← Anterior
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-8 ${currentPage === page
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "hover:bg-accent hover:text-accent-foreground"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                    Siguiente →
                </button>
            </div>
        </div>
    );
}

// Componente de Tabla
function BienesTableContent({
    bienes,
    router,
}: {
    bienes: any[];
    router: any;
}) {
    const estatusConfig = {
        activo: {
            label: "Activo",
            className: "bg-green-100 text-green-800 border-green-200",
        },
        baja: {
            label: "Baja",
            className: "bg-red-100 text-red-800 border-red-200",
        },
        en_tramite: {
            label: "En Trámite",
            className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        },
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Bien
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Categoría
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Ubicación
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Valor Catastral
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Estatus
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {bienes.map((bien) => (
                        <tr
                            key={bien.id}
                            className="border-b border-border hover:bg-muted/50"
                        >
                            <td className="p-4 align-middle">
                                <div>
                                    <div className="font-medium">{bien.nombre}</div>
                                    <div className="text-sm text-muted-foreground capitalize">
                                        {bien.tipo}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 align-middle">{bien.categoria}</td>
                            <td className="p-4 align-middle">
                                <span className="text-sm text-gray-600">{bien.ubicacion}</span>
                            </td>
                            <td className="p-4 align-middle font-medium">
                                {formatCurrency(bien.valorCatastral)}
                            </td>
                            <td className="p-4 align-middle">
                                <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${estatusConfig[bien.estatus as keyof typeof estatusConfig]
                                            ?.className || "bg-gray-100 text-gray-800 border-gray-200"
                                        }`}
                                >
                                    {estatusConfig[bien.estatus as keyof typeof estatusConfig]
                                        ?.label || bien.estatus}
                                </span>
                            </td>
                            <td className="p-4 align-middle">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/bienes-inmuebles/${bien.id}`)}
                                >
                                    Ver Detalles
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AssetsPage() {
    const params = useParams();
    const router = useRouter();
    const expedienteId = params.id as string;

    // Estados para filtros y paginación
    const [searchTerm, setSearchTerm] = useState("");
    const [estatusFilter, setEstatusFilter] = useState<string>("todos");
    const [tipoFilter, setTipoFilter] = useState<string>("todos");
    const [categoriaFilter, setCategoriaFilter] = useState<string>("todos");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Obtener expediente y bienes
    const expediente = getExpedienteById(expedienteId);
    const bienes = getBienesByExpediente(expedienteId);

    if (!expediente) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Expediente no encontrado</h1>
                    <Button
                        onClick={() => router.push("/registry")}
                        className="mt-4"
                        variant="outline"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a expedientes
                    </Button>
                </div>
            </div>
        );
    }

    // Configuración de estatus
    const statusConfig = {
        activo: { label: "Activo", className: "bg-green-100 text-green-800" },
        baja: { label: "Baja", className: "bg-red-100 text-red-800" },
        en_tramite: {
            label: "En Trámite",
            className: "bg-yellow-100 text-yellow-800",
        },
    };

    // Filtrar bienes
    const categoriasUnicas = Array.from(new Set(bienes.map((b) => b.categoria)));

    const filteredBienes = bienes.filter((bien) => {
        const matchesSearch =
            bien.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bien.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bien.descripcion?.toLowerCase() || "").includes(
                searchTerm.toLowerCase(),
            );

        const matchesEstatus =
            estatusFilter === "todos" || bien.estatus === estatusFilter;

        const matchesTipo = tipoFilter === "todos" || bien.tipo === tipoFilter;

        const matchesCategoria =
            categoriaFilter === "todos" || bien.categoria === categoriaFilter;

        return matchesSearch && matchesEstatus && matchesTipo && matchesCategoria;
    });

    // Paginación
    const totalPages = Math.ceil(filteredBienes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBienes = filteredBienes.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        onClick={() => router.push("/registry")}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a expedientes
                    </Button>
                    <h1 className="text-3xl font-bold mt-4">{expediente.name}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge className={statusConfig[expediente.status].className}>
                            {statusConfig[expediente.status].label}
                        </Badge>
                        <p className="text-muted-foreground">
                            RPP: {expediente.rppNumber || "—"} • B:{" "}
                            {expediente.bNumber || "—"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <BienesTableFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                estatusFilter={estatusFilter}
                setEstatusFilter={setEstatusFilter}
                tipoFilter={tipoFilter}
                setTipoFilter={setTipoFilter}
                categoriaFilter={categoriaFilter}
                setCategoriaFilter={setCategoriaFilter}
                categorias={categoriasUnicas}
            />

            {/* Lista de Bienes en Tabla */}
            <Card>
                <CardHeader>
                    <CardTitle>Bienes del Expediente</CardTitle>
                    <CardDescription>
                        Lista de todos los bienes asociados a este expediente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {paginatedBienes.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No hay bienes en este expediente
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-white">
                                <BienesTableContent bienes={paginatedBienes} router={router} />

                                <BienesTablePagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    startIndex={startIndex}
                                    itemsPerPage={itemsPerPage}
                                    filteredBienes={filteredBienes}
                                    setCurrentPage={setCurrentPage}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
