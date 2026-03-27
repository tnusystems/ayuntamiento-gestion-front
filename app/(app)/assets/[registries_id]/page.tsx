"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { searchAssets, type AssetSearchResult } from "@/lib/api/assets";
import { fetchRegistry } from "@/lib/api/registries";
import {
    BienesTableContent,
    type BienRow,
} from "@/components/assets/bienes-table-content";

type RegistryItem = Awaited<ReturnType<typeof fetchRegistry>>;
type AssetItem = AssetSearchResult["asset"] & {
    is_active?: boolean;
    inventory_status?: string | null;
};

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
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap">
                <input
                    placeholder="Buscar por clave catastral o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[220px] sm:flex-1"
                />
                <select
                    value={estatusFilter}
                    onChange={(e) => setEstatusFilter(e.target.value)}
                    className="flex h-10 w-full min-w-0 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[180px]"
                >
                    <option value="todos">Todos los estatus</option>
                    <option value="activo">Activo</option>
                    <option value="baja">Baja</option>
                    <option value="en_tramite">En Trámite</option>
                </select>
                <select
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                    className="flex h-10 w-full min-w-0 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[180px]"
                >
                    <option value="todos">Todos los tipos</option>
                    <option value="inmueble">Inmueble</option>
                    <option value="mueble">Mueble</option>
                </select>
                <select
                    value={categoriaFilter}
                    onChange={(e) => setCategoriaFilter(e.target.value)}
                    className="flex h-10 w-full min-w-0 max-w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[220px]"
                >
                    <option value="todos">Todas las claves catastrales</option>
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
    filteredBienes: BienRow[];
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-8 ${
                                    currentPage === page
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                }`}
                            >
                                {page}
                            </button>
                        ),
                    )}
                </div>
                <button
                    onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                    Siguiente →
                </button>
            </div>
        </div>
    );
}

export default function AssetsPage() {
    const params = useParams();
    const router = useRouter();
    const expedienteId = params.registries_id as string;

    // Estados para filtros y paginación
    const [searchTerm, setSearchTerm] = useState("");
    const [estatusFilter, setEstatusFilter] = useState<string>("todos");
    const [tipoFilter, setTipoFilter] = useState<string>("todos");
    const [categoriaFilter, setCategoriaFilter] = useState<string>("todos");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [expediente, setExpediente] = useState<RegistryItem>(null);
    const [bienes, setBienes] = useState<AssetItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadData = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const registryResponse = await fetchRegistry(expedienteId);
                const rppNumber = registryResponse?.rpp_number?.trim();
                const assetsResponse = rppNumber
                    ? await searchAssets({
                          rpp_number: rppNumber,
                      })
                    : { results: [] };

                if (!active) return;
                setExpediente(registryResponse ?? null);
                setBienes(
                    assetsResponse.results.map((result) => ({
                        ...result.asset,
                        is_active: result.is_active,
                    })),
                );
            } catch (error) {
                if (!active) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Error al cargar bienes del expediente.",
                );
                setExpediente(null);
                setBienes([]);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        void loadData();
        return () => {
            active = false;
        };
    }, [expedienteId]);

    const normalizedBienes = useMemo<BienRow[]>(
        () =>
            bienes.map((bien) => {
                const bienExtended = bien as AssetItem & {
                    description?: string | null;
                    operation_type_name?: string | null;
                    location?: {
                        name?: string | null;
                        address?: string | null;
                    };
                    latest_inventory_process?: {
                        process_type?: string | null;
                    };
                };
                const categoryValue = bien.c_number ?? "—";
                const ubicacionValue =
                    [bien.street, bien.colony].filter(Boolean).join(", ") ||
                    bienExtended.location?.name ||
                    bienExtended.location?.address ||
                    "—";
                const nombreValue =
                    bienExtended.description ||
                    bien.colony ||
                    bien.street ||
                    `Bien ${bien.id}`;
                const tipoValue = bienExtended.operation_type_name || "—";
                const valorCatastralNumber = Number(bien.cadastral_value);
                const valorCatastral = Number.isFinite(valorCatastralNumber)
                    ? valorCatastralNumber
                    : 0;

                const processType =
                    typeof bienExtended.latest_inventory_process?.process_type ===
                    "string"
                        ? bienExtended.latest_inventory_process?.process_type
                        : "";
                const rawStatus =
                    typeof bien.inventory_status === "string"
                        ? bien.inventory_status
                        : "";
                const estatus =
                    bien.is_active === false
                        ? "baja"
                        : processType === "baja"
                        ? "baja"
                        : processType === "en_tramite"
                          ? "en_tramite"
                          : processType === "activo"
                            ? "activo"
                            : rawStatus === "active"
                              ? "activo"
                              : rawStatus === "maintenance"
                                ? "en_tramite"
                                : rawStatus === "baja"
                                  ? "baja"
                                  : rawStatus || "activo";

                return {
                    id: bien.id,
                    nombre: nombreValue,
                    tipo: tipoValue,
                    categoria: categoryValue,
                    ubicacion: ubicacionValue,
                    valorCatastral,
                    estatus,
                    descripcion: bienExtended.description ?? undefined,
                };
            }),
        [bienes],
    );

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <p className="text-muted-foreground">
                        Cargando expediente...
                    </p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center space-y-4">
                    <p className="text-destructive">{loadError}</p>
                    <Button
                        onClick={() => router.push("/registry")}
                        variant="outline"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a expedientes
                    </Button>
                </div>
            </div>
        );
    }

    if (!expediente) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">
                        Expediente no encontrado
                    </h1>
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
        default: {
            label: "Sin estatus",
            className: "bg-gray-100 text-gray-800",
        },
    } as const;
    const statusKey: keyof typeof statusConfig =
        expediente.status &&
        Object.prototype.hasOwnProperty.call(statusConfig, expediente.status)
            ? (expediente.status as keyof typeof statusConfig)
            : "default";

    // Filtrar bienes
    const categoriasUnicas = Array.from(
        new Set(normalizedBienes.map((b) => b.categoria).filter(Boolean)),
    );

    const filteredBienes = normalizedBienes.filter((bien) => {
        const matchesSearch =
            bien.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bien.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstatus =
            estatusFilter === "todos" || bien.estatus === estatusFilter;

        const matchesTipo = tipoFilter === "todos" || bien.tipo === tipoFilter;

        const matchesCategoria =
            categoriaFilter === "todos" || bien.categoria === categoriaFilter;

        return (
            matchesSearch && matchesEstatus && matchesTipo && matchesCategoria
        );
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
                    <h1 className="text-3xl font-bold mt-4">
                        {expediente.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge className={statusConfig[statusKey].className}>
                            {statusConfig[statusKey].label}
                        </Badge>
                        <p className="text-muted-foreground">
                            RPP: {expediente.rpp_number ?? "—"} • B:{" "}
                            {expediente.b_number ?? "—"}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => router.push(`/assets/new/${expedienteId}`)}
                >
                    Agregar asset
                </Button>
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
                    <CardTitle>Bienes del Expediente (SIGBI)</CardTitle>
                    <CardDescription>
                        Lista de todos los bienes asociados a este expediente en SIGBI.
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
                                <BienesTableContent
                                    bienes={paginatedBienes}
                                    router={router}
                                    expedienteId={expedienteId}
                                />

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
