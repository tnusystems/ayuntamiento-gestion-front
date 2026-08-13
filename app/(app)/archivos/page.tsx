"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Download,
    ExternalLink,
    FileText,
    Loader2,
    RefreshCw,
    Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchAsset, searchAssets } from "@/lib/api/assets";
import {
    assignDocumentToAttachable,
    fetchSystemDocuments,
    type DocumentAttachableType,
    type SystemDocument,
} from "@/lib/api/documents";
import { getApiBaseUrl } from "@/lib/api/baseUrl";
import { fetchRegistry } from "@/lib/api/registries";
import { cn } from "@/lib/utils";
import {
    mockAssets,
    mockRegistries,
    mockSystemDocuments,
    MOCK_FALLBACK_MESSAGE,
} from "@/lib/mock-fallbacks";

type DocumentAttachableFilter = "all" | DocumentAttachableType;
type AssetCandidate = Awaited<ReturnType<typeof searchAssets>>["results"][number];
type AssetDetail = Awaited<ReturnType<typeof fetchAsset>>;
type RegistryDetail = Awaited<ReturnType<typeof fetchRegistry>>;
type PaginationState = {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
};
type CurrentAttachableInfo = {
    type: DocumentAttachableType;
    id: number;
    title: string;
    rppNumber: string;
    rpp: string;
    catastral: string;
    extra: string;
};

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50] as const;
const FILTER_DEBOUNCE_MS = 350;
const ASSET_SEARCH_DEBOUNCE_MS = 300;

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
});

const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");

function withApiBase(path?: string | null) {
    if (!path) {
        return "";
    }

    const value = path.trim();
    if (!value) {
        return "";
    }

    if (!apiBaseUrl) {
        return value;
    }

    if (/^https?:\/\//i.test(value)) {
        try {
            const parsed = new URL(value);
            const relativePath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
            return `${apiBaseUrl}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
        } catch {
            return value;
        }
    }

    return `${apiBaseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

function normalizeRole(value?: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

function getRoleKeys(role?: string | null, roles?: Array<{ name?: string }>) {
    const keys = new Set<string>();
    const normalizedRole = normalizeRole(role);
    if (normalizedRole) {
        keys.add(normalizedRole);
    }

    if (Array.isArray(roles)) {
        for (const roleItem of roles) {
            const roleName = normalizeRole(roleItem?.name);
            if (roleName) {
                keys.add(roleName);
            }
        }
    }

    return keys;
}

function formatBytes(value?: number | null) {
    if (!value || !Number.isFinite(value)) {
        return "-";
    }
    if (value < 1024) {
        return `${value} B`;
    }
    const kb = value / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
}

function formatDate(value?: string | null) {
    if (!value) {
        return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return dateTimeFormatter.format(date);
}

function getDocumentName(document: SystemDocument) {
    const fromName = document.name?.trim();
    if (fromName) {
        return fromName;
    }
    const fromFilename = document.file?.filename?.trim();
    if (fromFilename) {
        return fromFilename;
    }
    return `Documento ${document.id}`;
}

function getDocumentUrl(document: SystemDocument, mode: "view" | "download") {
    const viewUrl = withApiBase(document.file?.url);
    const downloadUrl = withApiBase(document.file?.download_url);
    if (mode === "download") {
        return downloadUrl || viewUrl;
    }
    return viewUrl || downloadUrl;
}

function getAttachableLabel(document: SystemDocument) {
    const attachableType = document.attachable_type?.trim();
    const attachableId = document.attachable_id;
    const typeLabel =
        attachableType?.toLowerCase() === "registry"
            ? "Registro"
            : attachableType?.toLowerCase() === "asset"
              ? "Bien"
              : attachableType;

    if (attachableType && typeof attachableId === "number") {
        return `${typeLabel} #${attachableId}`;
    }
    if (attachableType) {
        return typeLabel;
    }
    return "Sin asignar";
}

function isAssetDocument(document: SystemDocument) {
    return document.attachable_type?.toLowerCase() === "asset";
}

function resolveAttachableType(
    value?: string | null,
): DocumentAttachableType | null {
    const normalized = value?.trim().toLowerCase();
    if (normalized === "registry") {
        return "Registry";
    }
    if (normalized === "asset") {
        return "Asset";
    }
    return null;
}

function toDisplayValue(value: unknown) {
    if (value === undefined || value === null) {
        return "-";
    }
    const text = String(value).trim();
    return text || "-";
}

function buildRegistryInfo(id: number, registry: RegistryDetail): CurrentAttachableInfo {
    const rppNumber = registry?.rpp_number?.trim() ?? "";
    return {
        type: "Registry",
        id,
        title: toDisplayValue(registry?.name),
        rppNumber,
        rpp: [
            toDisplayValue(registry?.rpp_number),
            `Vol. ${toDisplayValue(registry?.rpp_volume)}`,
            `Sec. ${toDisplayValue(registry?.rpp_section)}`,
        ].join(" - "),
        catastral: toDisplayValue(registry?.co_number),
        extra: [
            `Libro B: ${toDisplayValue(registry?.b_number)}`,
            `Escritura: ${toDisplayValue(registry?.e_number)}`,
        ].join(" - "),
    };
}

function buildAssetInfo(id: number, asset: AssetDetail): CurrentAttachableInfo {
    const rppNumber = asset?.rpp_number?.trim() ?? "";
    return {
        type: "Asset",
        id,
        title: toDisplayValue(
            asset?.description || asset?.colony || asset?.street || `Bien ${id}`,
        ),
        rppNumber,
        rpp: toDisplayValue(asset?.rpp_number),
        catastral: toDisplayValue(asset?.c_number),
        extra: [
            toDisplayValue(asset?.street),
            toDisplayValue(asset?.colony),
        ].join(" - "),
    };
}

export default function ArchivosPage() {
    const { data: session } = useSession();
    const roleKeys = useMemo(
        () => getRoleKeys(session?.user?.role, session?.user?.roles),
        [session?.user?.role, session?.user?.roles],
    );
    const isViewer = roleKeys.has("viewer");

    const [documents, setDocuments] = useState<SystemDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [attachableTypeFilter, setAttachableTypeFilter] =
        useState<DocumentAttachableFilter>("all");
    const [attachableIdFilter, setAttachableIdFilter] = useState("");
    const [debouncedAttachableIdFilter, setDebouncedAttachableIdFilter] =
        useState("");
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState<number>(ITEMS_PER_PAGE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        perPage: ITEMS_PER_PAGE_OPTIONS[0],
    });

    const [notice, setNotice] = useState<string | null>(null);

    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] =
        useState<SystemDocument | null>(null);
    const [targetAssetId, setTargetAssetId] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignError, setAssignError] = useState<string | null>(null);
    const [currentAttachableInfo, setCurrentAttachableInfo] =
        useState<CurrentAttachableInfo | null>(null);
    const [isLoadingCurrentAttachable, setIsLoadingCurrentAttachable] =
        useState(false);
    const [currentAttachableError, setCurrentAttachableError] = useState<
        string | null
    >(null);

    const [assetSearch, setAssetSearch] = useState("");
    const [debouncedAssetSearch, setDebouncedAssetSearch] = useState("");
    const [assetCandidates, setAssetCandidates] = useState<AssetCandidate[]>([]);
    const [isSearchingAssets, setIsSearchingAssets] = useState(false);
    const [assetSearchError, setAssetSearchError] = useState<string | null>(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedAttachableIdFilter(attachableIdFilter.trim());
        }, FILTER_DEBOUNCE_MS);
        return () => window.clearTimeout(timeoutId);
    }, [attachableIdFilter]);

    const loadDocuments = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);

        const parsedAttachableId = Number(debouncedAttachableIdFilter);
        const attachableId =
            attachableTypeFilter === "all" || !debouncedAttachableIdFilter
                ? undefined
                : Number.isFinite(parsedAttachableId) && parsedAttachableId > 0
                  ? Math.trunc(parsedAttachableId)
                  : undefined;

        try {
            const response = await fetchSystemDocuments({
                attachable_type:
                    attachableTypeFilter === "all"
                        ? undefined
                        : attachableTypeFilter,
                attachable_id: attachableId,
                page: currentPage,
                per_page: perPage,
            });

            setDocuments(response.documents);

            const responseCurrentPage =
                response.pagination?.current_page ?? currentPage;
            const responseTotalPages = Math.max(
                1,
                response.pagination?.total_pages ?? 1,
            );
            const responseTotalCount =
                response.pagination?.total_count ?? response.documents.length;
            const responsePerPage = response.pagination?.per_page ?? perPage;

            setPagination({
                currentPage: responseCurrentPage,
                totalPages: responseTotalPages,
                totalCount: responseTotalCount,
                perPage: responsePerPage,
            });

            if (responseCurrentPage !== currentPage) {
                setCurrentPage(responseCurrentPage);
            }
        } catch (error) {
            setDocuments(mockSystemDocuments);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalCount: mockSystemDocuments.length,
                perPage,
            });
            setLoadError(MOCK_FALLBACK_MESSAGE);
        } finally {
            setIsLoading(false);
        }
    }, [attachableTypeFilter, currentPage, debouncedAttachableIdFilter, perPage]);

    useEffect(() => {
        void loadDocuments();
    }, [loadDocuments]);

    const filteredDocuments = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) {
            return documents;
        }
        return documents.filter((document) => {
            const values = [
                document.name,
                document.kind,
                document.file?.filename,
                document.file?.content_type,
                document.attachable_type,
                typeof document.attachable_id === "number"
                    ? String(document.attachable_id)
                    : "",
            ];
            return values.some((value) =>
                (value ?? "").toLowerCase().includes(normalizedSearch),
            );
        });
    }, [documents, search]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedAssetSearch(assetSearch.trim());
        }, ASSET_SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timeoutId);
    }, [assetSearch]);

    useEffect(() => {
        if (!isAssignOpen) {
            return;
        }

        if (debouncedAssetSearch.length === 0) {
            setAssetCandidates([]);
            setAssetSearchError(null);
            setIsSearchingAssets(false);
            return;
        }

        let active = true;

        const loadAssets = async () => {
            setIsSearchingAssets(true);
            setAssetSearchError(null);
            try {
                const response = await searchAssets({
                    rpp_number: debouncedAssetSearch,
                });
                if (!active) {
                    return;
                }
                setAssetCandidates(response.results ?? []);
            } catch (error) {
                if (!active) {
                    return;
                }
                setAssetCandidates(mockAssets.map((asset) => ({ asset })));
                setAssetSearchError(MOCK_FALLBACK_MESSAGE);
            } finally {
                if (active) {
                    setIsSearchingAssets(false);
                }
            }
        };

        void loadAssets();

        return () => {
            active = false;
        };
    }, [debouncedAssetSearch, isAssignOpen]);

    const loadCurrentAttachableInfo = useCallback(
        async (document: SystemDocument) => {
            const attachableType = resolveAttachableType(document.attachable_type);
            const attachableId =
                typeof document.attachable_id === "number" &&
                Number.isFinite(document.attachable_id) &&
                document.attachable_id > 0
                    ? Math.trunc(document.attachable_id)
                    : null;

            if (!attachableType || !attachableId) {
                setCurrentAttachableInfo(null);
                setCurrentAttachableError(null);
                setIsLoadingCurrentAttachable(false);
                return;
            }

            setIsLoadingCurrentAttachable(true);
            setCurrentAttachableError(null);
            try {
                if (attachableType === "Registry") {
                    const registry = await fetchRegistry(attachableId);
                    if (!registry) {
                        throw new Error("No se encontro el registro origen.");
                    }
                    const info = buildRegistryInfo(attachableId, registry);
                    setCurrentAttachableInfo(info);
                    if (info.rppNumber) {
                        setAssetSearch(info.rppNumber);
                        setDebouncedAssetSearch(info.rppNumber);
                    }
                    return;
                }

                const asset = await fetchAsset(attachableId);
                if (!asset) {
                    throw new Error("No se encontro el bien origen.");
                }
                const info = buildAssetInfo(attachableId, asset);
                setCurrentAttachableInfo(info);
                if (info.rppNumber) {
                    setAssetSearch(info.rppNumber);
                    setDebouncedAssetSearch(info.rppNumber);
                }
            } catch (error) {
                if (attachableType === "Registry") {
                    const fallbackRegistry =
                        mockRegistries.find((item) => item.id === attachableId) ??
                        mockRegistries[0];
                    setCurrentAttachableInfo(
                        buildRegistryInfo(attachableId, fallbackRegistry),
                    );
                } else {
                    const fallbackAsset =
                        mockAssets.find((item) => item.id === attachableId) ??
                        mockAssets[0];
                    setCurrentAttachableInfo(
                        buildAssetInfo(attachableId, fallbackAsset),
                    );
                }
                setCurrentAttachableError(MOCK_FALLBACK_MESSAGE);
            } finally {
                setIsLoadingCurrentAttachable(false);
            }
        },
        [],
    );

    const handleOpenAssign = (document: SystemDocument) => {
        if (isViewer) {
            return;
        }
        setSelectedDocument(document);
        setAssignError(null);
        setCurrentAttachableInfo(null);
        setCurrentAttachableError(null);
        setIsLoadingCurrentAttachable(false);
        setAssetSearch("");
        setDebouncedAssetSearch("");
        setAssetCandidates([]);
        setAssetSearchError(null);
        setTargetAssetId(
            isAssetDocument(document) && typeof document.attachable_id === "number"
                ? String(document.attachable_id)
                : "",
        );
        setIsAssignOpen(true);
        void loadCurrentAttachableInfo(document);
    };

    const handleCloseAssign = () => {
        if (isAssigning) {
            return;
        }
        setIsAssignOpen(false);
        setSelectedDocument(null);
        setAssignError(null);
        setCurrentAttachableInfo(null);
        setCurrentAttachableError(null);
        setIsLoadingCurrentAttachable(false);
        setAssetSearch("");
        setDebouncedAssetSearch("");
        setAssetCandidates([]);
        setAssetSearchError(null);
        setTargetAssetId("");
    };

    const handleAssignToAsset = async () => {
        if (!selectedDocument) {
            return;
        }

        const parsedAssetId = Number(targetAssetId.trim());
        if (!Number.isFinite(parsedAssetId) || parsedAssetId <= 0) {
            setAssignError("Ingresa un ID de bien valido.");
            return;
        }

        setIsAssigning(true);
        setAssignError(null);

        try {
            const assetId = Math.trunc(parsedAssetId);
            await assignDocumentToAttachable(selectedDocument.id, {
                attachable_id: assetId,
            });

            const documentName = getDocumentName(selectedDocument);
            setNotice(`Documento \"${documentName}\" asignado al bien ${assetId}.`);
            setIsAssignOpen(false);
            setSelectedDocument(null);
            setCurrentAttachableInfo(null);
            setCurrentAttachableError(null);
            setIsLoadingCurrentAttachable(false);
            await loadDocuments();
        } catch (error) {
            setAssignError(
                error instanceof Error
                    ? error.message
                    : "No se pudo asignar el documento al bien.",
            );
        } finally {
            setIsAssigning(false);
        }
    };

    const displayFrom =
        pagination.totalCount === 0
            ? 0
            : (pagination.currentPage - 1) * pagination.perPage + 1;
    const displayTo =
        pagination.totalCount === 0
            ? 0
            : (pagination.currentPage - 1) * pagination.perPage + documents.length;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-5">
            <section className="rounded-xl border border-border bg-gradient-to-r from-card via-card to-muted/20 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                            <FileText className="h-6 w-6 text-primary" />
                            Directorio de documentos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Consulta documentos del sistema y reasignalos entre
                            registros y bienes cuando sea necesario.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setNotice(null);
                            void loadDocuments();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Actualizar
                    </Button>
                </div>
            </section>

            {isViewer ? (
                <section className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
                    Perfil de solo lectura: puedes consultar documentos, pero no
                    reasignarlos.
                </section>
            ) : null}

            {notice ? (
                <section className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                    {notice}
                </section>
            ) : null}

            <section className="space-y-4 rounded-xl border border-border bg-card p-4">
                <div>
                    <h2 className="text-sm font-medium">Filtros</h2>
                    <p className="text-xs text-muted-foreground">
                        Ajusta el listado por vinculo y busca rapidamente en los
                        resultados cargados.
                    </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2">
                        <Label>Vinculo actual</Label>
                        <Select
                            value={attachableTypeFilter}
                            onValueChange={(value) => {
                                const resolved = value as DocumentAttachableFilter;
                                setAttachableTypeFilter(resolved);
                                setCurrentPage(1);
                                if (resolved === "all") {
                                    setAttachableIdFilter("");
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Registry">Registry</SelectItem>
                                <SelectItem value="Asset">Asset</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="attachable-id-filter">
                            ID de vinculo (opcional)
                        </Label>
                        <Input
                            id="attachable-id-filter"
                            type="number"
                            min={1}
                            value={attachableIdFilter}
                            onChange={(event) => {
                                setAttachableIdFilter(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder={
                                attachableTypeFilter === "all"
                                    ? "Selecciona tipo"
                                    : "Ej. 145"
                            }
                            disabled={attachableTypeFilter === "all"}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="document-search">
                            Buscar en la pagina actual
                        </Label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="document-search"
                                className="pl-9"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Nombre, tipo o archivo"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Registros por pagina</Label>
                        <Select
                            value={String(perPage)}
                            onValueChange={(value) => {
                                const resolved = Number(value);
                                if (!Number.isFinite(resolved)) {
                                    return;
                                }
                                setPerPage(Math.trunc(resolved));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={String(option)}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    Usa la combinacion correcta de tipo + ID para consultar un
                    vinculo especifico. Si el tipo no corresponde al ID, no habra
                    resultados.
                </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {filteredDocuments.length} de {documents.length}
                        en pagina
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {displayFrom}-{displayTo} de {pagination.totalCount} en
                        total
                    </p>
                </div>

                {loadError ? (
                    <div className="px-4 py-6 text-sm text-destructive">
                        {loadError}
                    </div>
                ) : null}

                <div className="space-y-3 p-4 lg:hidden">
                    {isLoading ? (
                        <p className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted-foreground">
                            Cargando documentos...
                        </p>
                    ) : filteredDocuments.length === 0 ? (
                        <p className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted-foreground">
                            No hay documentos para mostrar.
                        </p>
                    ) : (
                        filteredDocuments.map((document) => {
                            const viewUrl = getDocumentUrl(document, "view");
                            const downloadUrl = getDocumentUrl(
                                document,
                                "download",
                            );

                            return (
                                <div
                                    key={document.id}
                                    className="space-y-3 rounded-lg border border-border bg-background p-4"
                                >
                                    <div className="space-y-2">
                                        <p className="font-medium leading-tight">
                                            {getDocumentName(document)}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <Badge variant="secondary">
                                                {document.kind || "sin kind"}
                                            </Badge>
                                            <Badge variant="outline">
                                                {getAttachableLabel(document)}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-xs text-muted-foreground">
                                        <p>
                                            Archivo: {document.file?.filename || "-"}
                                        </p>
                                        <p>
                                            Tipo MIME: {document.file?.content_type || "-"}
                                        </p>
                                        <p>
                                            Tamano: {formatBytes(document.file?.byte_size)}
                                        </p>
                                        <p>
                                            Fecha: {formatDate(document.created_at)}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {viewUrl ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 sm:flex-none"
                                                asChild
                                            >
                                                <a
                                                    href={viewUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                                    Ver
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 sm:flex-none"
                                                disabled
                                            >
                                                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                                Ver
                                            </Button>
                                        )}

                                        {downloadUrl ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 sm:flex-none"
                                                asChild
                                            >
                                                <a
                                                    href={downloadUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Download className="mr-1 h-3.5 w-3.5" />
                                                    Descargar
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 sm:flex-none"
                                                disabled
                                            >
                                                <Download className="mr-1 h-3.5 w-3.5" />
                                                Descargar
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            disabled={isViewer}
                                            onClick={() => handleOpenAssign(document)}
                                        >
                                            {isAssetDocument(document)
                                                ? "Reasignar"
                                                : "Asignar a bien"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="hidden lg:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-4">Documento</TableHead>
                                <TableHead>Kind</TableHead>
                                <TableHead>Vinculo</TableHead>
                                <TableHead>Archivo</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="pr-4 text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        Cargando documentos...
                                    </TableCell>
                                </TableRow>
                            ) : filteredDocuments.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No hay documentos para mostrar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDocuments.map((document) => {
                                    const viewUrl = getDocumentUrl(document, "view");
                                    const downloadUrl = getDocumentUrl(
                                        document,
                                        "download",
                                    );

                                    return (
                                        <TableRow key={document.id}>
                                            <TableCell className="pl-4">
                                                <div className="max-w-[260px]">
                                                    <p className="truncate font-medium">
                                                        {getDocumentName(document)}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        ID {document.id}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {document.kind || "sin kind"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getAttachableLabel(document)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[220px] text-sm">
                                                    <p className="truncate">
                                                        {document.file?.filename || "-"}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {document.file?.content_type || "-"}
                                                        {" - "}
                                                        {formatBytes(
                                                            document.file?.byte_size,
                                                        )}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(document.created_at)}
                                            </TableCell>
                                            <TableCell className="pr-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {viewUrl ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <a
                                                                href={viewUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                                                Ver
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled
                                                        >
                                                            <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                                            Ver
                                                        </Button>
                                                    )}

                                                    {downloadUrl ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <a
                                                                href={downloadUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <Download className="mr-1 h-3.5 w-3.5" />
                                                                Descargar
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled
                                                        >
                                                            <Download className="mr-1 h-3.5 w-3.5" />
                                                            Descargar
                                                        </Button>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        disabled={isViewer}
                                                        onClick={() =>
                                                            handleOpenAssign(document)
                                                        }
                                                    >
                                                        {isAssetDocument(document)
                                                            ? "Reasignar"
                                                            : "Asignar"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isLoading || currentPage <= 1}
                        onClick={() =>
                            setCurrentPage((previous) =>
                                Math.max(1, previous - 1),
                            )
                        }
                    >
                        Anterior
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Pagina {currentPage} de {pagination.totalPages}
                    </p>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isLoading || currentPage >= pagination.totalPages}
                        onClick={() =>
                            setCurrentPage((previous) =>
                                Math.min(pagination.totalPages, previous + 1),
                            )
                        }
                    >
                        Siguiente
                    </Button>
                </div>
            </section>

            <Dialog
                open={isAssignOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseAssign();
                    }
                }}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Asignar documento a un bien</DialogTitle>
                        <DialogDescription>
                            Selecciona el bien destino para reasignar este
                            documento.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedDocument ? (
                            <div className="rounded-lg border border-border bg-muted/20 p-3">
                                <p className="font-medium">
                                    {getDocumentName(selectedDocument)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    ID {selectedDocument.id} - Vinculo actual:{" "}
                                    {getAttachableLabel(selectedDocument)}
                                </p>
                            </div>
                        ) : null}

                        {isLoadingCurrentAttachable ? (
                            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando informacion de origen...
                            </div>
                        ) : currentAttachableError ? (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {currentAttachableError}
                            </div>
                        ) : currentAttachableInfo ? (
                            <div className="rounded-lg border border-border bg-background p-3">
                                <p className="text-xs text-muted-foreground">
                                    Origen actual: {currentAttachableInfo.type} #
                                    {currentAttachableInfo.id}
                                </p>
                                <p className="mt-1 font-medium">
                                    {currentAttachableInfo.title}
                                </p>
                                <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                                    <p>RPP: {currentAttachableInfo.rpp}</p>
                                    <p>
                                        Clave catastral / convenio: {" "}
                                        {currentAttachableInfo.catastral}
                                    </p>
                                    <p>{currentAttachableInfo.extra}</p>
                                </div>
                            </div>
                        ) : null}

                        {assignError ? (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {assignError}
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <Label htmlFor="asset-target-id">
                                ID de bien destino
                            </Label>
                            <Input
                                id="asset-target-id"
                                type="number"
                                min={1}
                                placeholder="Ej. 138"
                                value={targetAssetId}
                                onChange={(event) =>
                                    setTargetAssetId(event.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="asset-search">
                                Buscar bien por RPP
                            </Label>
                            <Input
                                id="asset-search"
                                value={assetSearch}
                                onChange={(event) =>
                                    setAssetSearch(event.target.value)
                                }
                                placeholder="Ej. RPP-412"
                            />
                            <p className="text-xs text-muted-foreground">
                                El buscador usa /api/v1/assets/search con
                                rpp_number.
                            </p>

                            <div className="max-h-48 overflow-y-auto rounded-md border border-border/70">
                                {isSearchingAssets ? (
                                    <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Buscando bienes...
                                    </div>
                                ) : assetSearchError ? (
                                    <div className="px-3 py-3 text-sm text-destructive">
                                        {assetSearchError}
                                    </div>
                                ) : debouncedAssetSearch.length === 0 ? (
                                    <div className="px-3 py-3 text-sm text-muted-foreground">
                                        Ingresa un RPP para buscar bienes.
                                    </div>
                                ) : assetCandidates.length === 0 ? (
                                    <div className="px-3 py-3 text-sm text-muted-foreground">
                                        Sin resultados para {debouncedAssetSearch}.
                                    </div>
                                ) : (
                                    assetCandidates.map((result) => {
                                        const asset = result.asset;
                                        const numericId = Number(asset.id);
                                        const canSelect =
                                            Number.isFinite(numericId) &&
                                            numericId > 0;
                                        const isSelected =
                                            canSelect &&
                                            Number(targetAssetId) === numericId;
                                        return (
                                            <button
                                                key={String(asset.id)}
                                                type="button"
                                                className={cn(
                                                    "w-full border-b border-border/70 px-3 py-3 text-left last:border-b-0",
                                                    "transition-colors hover:bg-muted/40",
                                                    isSelected &&
                                                        "bg-primary/10 hover:bg-primary/10",
                                                )}
                                                disabled={!canSelect}
                                                onClick={() => {
                                                    if (!canSelect) {
                                                        return;
                                                    }
                                                    setTargetAssetId(
                                                        String(Math.trunc(numericId)),
                                                    );
                                                }}
                                            >
                                                <p className="text-sm font-medium">
                                                    {asset.colony ||
                                                        asset.street ||
                                                        `Bien ${asset.id}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    ID {asset.id} - RPP{" "}
                                                    {asset.rpp_number || "-"} - C{" "}
                                                    {asset.c_number || "-"}
                                                </p>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseAssign}
                            disabled={isAssigning}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void handleAssignToAsset()}
                            disabled={isAssigning || isViewer}
                        >
                            {isAssigning ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ExternalLink className="mr-2 h-4 w-4" />
                            )}
                            Confirmar asignacion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
