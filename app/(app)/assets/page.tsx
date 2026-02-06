"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { fetchAssets } from "@/lib/api/assets";
import {
    BienesTableContent,
    type BienRow,
} from "@/components/assets/bienes-table-content";

const ITEMS_PER_PAGE = 10;
const ORDER_BY = "created_at";
const SEARCH_DEBOUNCE_MS = 350;

type AssetItem = Awaited<ReturnType<typeof fetchAssets>>["data"][number];

type InventoryProcessFilter = "todos" | "alta" | "baja";

type OrderDirection = "asc" | "desc";

function resolveProcessType(value?: string | null): InventoryProcessFilter {
    if (value === "alta" || value === "baja") return value;
    return "todos";
}

function resolveOrder(value?: string | null): OrderDirection {
    return value === "asc" ? "asc" : "desc";
}

function resolveStatus(asset: AssetItem) {
    const processType =
        typeof (
            asset as {
                latest_inventory_process?: {
                    process_type?: string;
                };
            }
        ).latest_inventory_process?.process_type === "string"
            ? (
                  asset as {
                      latest_inventory_process?: {
                          process_type?: string;
                      };
                  }
              ).latest_inventory_process?.process_type
            : "";
    const rawStatus =
        typeof asset.inventory_status === "string"
            ? asset.inventory_status
            : "";

    if (processType === "baja") return "baja";
    if (processType === "en_tramite") return "en_tramite";
    if (processType === "activo" || processType === "alta") return "activo";
    if (rawStatus === "active") return "activo";
    if (rawStatus === "maintenance") return "en_tramite";
    if (rawStatus === "baja") return "baja";
    return rawStatus || "activo";
}

export default function AssetsGlobalPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState("");
    const [inventoryProcessType, setInventoryProcessType] =
        useState<InventoryProcessFilter>(() =>
            resolveProcessType(searchParams.get("inventory_process_type")),
        );
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(() =>
        resolveOrder(searchParams.get("order")),
    );
    const [currentPage, setCurrentPage] = useState(1);

    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(handle);
    }, [searchTerm]);

    const listParams = useMemo(
        () => ({
            page: currentPage,
            per_page: ITEMS_PER_PAGE,
            q: debouncedSearch.trim() || undefined,
            inventory_process_type:
                inventoryProcessType === "todos"
                    ? undefined
                    : inventoryProcessType,
            order: orderDirection,
            order_by: ORDER_BY,
        }),
        [currentPage, inventoryProcessType, orderDirection, debouncedSearch],
    );

    const { data, error, isLoading } = useSWR(
        ["assets", listParams],
        ([, params]) => fetchAssets(params),
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        },
    );

    const assets = data?.data ?? [];
    const totalPages = data?.pagination?.total_pages
        ? Math.max(data.pagination.total_pages, 1)
        : 1;
    const totalCount = data?.pagination?.total_count ?? assets.length;
    const loadError = error instanceof Error ? error.message : null;

    const normalizedAssets = useMemo<BienRow[]>(
        () =>
            assets.map((asset) => {
                const categoryValue = asset.c_number ?? "—";
                const ubicacionValue =
                    [asset.street, asset.colony].filter(Boolean).join(", ") ||
                    asset.location?.name ||
                    asset.location?.address ||
                    "—";
                const nombreValue =
                    asset.description ||
                    asset.colony ||
                    asset.street ||
                    `Bien ${asset.id}`;
                const tipoValue = asset.operation_type_name || "—";
                const valorCatastralNumber = Number(asset.cadastral_value);
                const valorCatastral = Number.isFinite(valorCatastralNumber)
                    ? valorCatastralNumber
                    : 0;

                return {
                    id: asset.id,
                    registryId: (asset as { registry_id?: string | number })
                        .registry_id,
                    nombre: nombreValue,
                    tipo: tipoValue,
                    categoria: categoryValue,
                    ubicacion: ubicacionValue,
                    valorCatastral,
                    estatus: resolveStatus(asset),
                    descripcion: asset.description,
                };
            }),
        [assets],
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Todos los bienes</h1>
                    <p className="text-muted-foreground">
                        Lista completa de bienes sin filtrar por registro.
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/registry")}
                    variant="outline"
                >
                    Ver registros
                </Button>
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                    <input
                        placeholder="Buscar por nombre, ubicación o descripción..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-72"
                    />
                    <select
                        value={inventoryProcessType}
                        onChange={(e) => {
                            setInventoryProcessType(
                                resolveProcessType(e.target.value),
                            );
                            setCurrentPage(1);
                        }}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-40"
                    >
                        <option value="todos">Todos los procesos</option>
                        <option value="alta">Alta</option>
                        <option value="baja">Baja</option>
                    </select>
                    <select
                        value={orderDirection}
                        onChange={(e) => {
                            setOrderDirection(resolveOrder(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-40"
                    >
                        <option value="desc">Ordenar: reciente</option>
                        <option value="asc">Ordenar: antiguo</option>
                    </select>
                </div>
                <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} · Total {totalCount}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de bienes</CardTitle>
                    <CardDescription>
                        Resultados con filtros de proceso y orden.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                Cargando bienes...
                            </p>
                        </div>
                    ) : loadError ? (
                        <div className="text-center py-8">
                            <p className="text-destructive">{loadError}</p>
                        </div>
                    ) : normalizedAssets.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No hay bienes para mostrar.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-white">
                                <BienesTableContent
                                    bienes={normalizedAssets}
                                    router={router}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-3">
                <Button
                    variant="outline"
                    onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                >
                    ← Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a{" "}
                    {startIndex + normalizedAssets.length} de {totalCount}
                </div>
                <Button
                    variant="outline"
                    onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                >
                    Siguiente →
                </Button>
            </div>
        </div>
    );
}
