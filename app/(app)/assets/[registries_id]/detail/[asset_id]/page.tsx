// app/(app)/assets/[registries_id]/detail/[asset_id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, AlertTriangle, Check, Loader2 } from "lucide-react";
import BienDetail from "@/components/bienes/bien-detail";
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
import { Progress } from "@/components/ui/progress";
import { WizardStep3 } from "@/components/bienes-inmuebles/wizard/wizard-step-3";
import { createAssetDocument, fetchAsset } from "@/lib/api/assets";
import { fetchRegistry } from "@/lib/api/registries";
import { fetchAssetDocuments } from "@/lib/api/files/fileByAsset";
import { fetchInventoryProcesses } from "@/lib/api/inventory-processes";
import { getApiBaseUrl } from "@/lib/api/baseUrl";
import {
    mockAssets,
    mockRegistries,
    mockSystemDocuments,
    MOCK_FALLBACK_MESSAGE,
} from "@/lib/mock-fallbacks";

type AssetDetail = Awaited<ReturnType<typeof fetchAsset>>;
type RegistryItem = Awaited<ReturnType<typeof fetchRegistry>>;
type AssetDocumentItem = Awaited<
    ReturnType<typeof fetchAssetDocuments>
>[number];
type InventoryProcessResponse = Awaited<
    ReturnType<typeof fetchInventoryProcesses>
>;
type AssetWithExtras = NonNullable<AssetDetail> & {
    operation_type?: { name?: string | null };
};

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
        for (const item of roles) {
            const roleName = normalizeRole(item?.name);
            if (roleName) {
                keys.add(roleName);
            }
        }
    }
    return keys;
}

const requiredUploadDocTypeIds = ["escritura", "fotos", "oficio"] as const;

export default function AssetDetailPage() {
    const params = useParams<{ registries_id: string; asset_id: string }>();
    const router = useRouter();
    const { data: session } = useSession();
    const registryId = params.registries_id;
    const assetId = params.asset_id;
    const roleKeys = useMemo(
        () => getRoleKeys(session?.user?.role, session?.user?.roles),
        [session?.user?.role, session?.user?.roles],
    );
    const isViewer = roleKeys.has("viewer");

    const [asset, setAsset] = useState<AssetDetail>(null);
    const [registry, setRegistry] = useState<RegistryItem>(null);
    const [documents, setDocuments] = useState<AssetDocumentItem[]>([]);
    const [processes, setProcesses] = useState<InventoryProcessResponse>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadNotice, setUploadNotice] = useState<string | null>(null);
    const [uploadItems, setUploadItems] = useState<
        Array<{
            id: string;
            name: string;
            typeLabel: string;
            docTypeId: string;
            file: File;
            status: "pending" | "uploading" | "success" | "error";
            error?: string;
        }>
    >([]);
    const [uploadForm, setUploadForm] = useState({
        documentos: [] as string[],
        documentosDetalle: [] as Array<{
            docTypeId: string;
            docTypeLabel: string;
            files: Array<{
                name: string;
                type: string;
                size: number;
                lastModified: number;
                file: File;
            }>;
        }>,
    });

    useEffect(() => {
        let active = true;

        const loadDetail = async () => {
            setIsLoading(true);
            setLoadError(null);
            const assetIdNumber = Number(assetId);

            try {
                const [
                    assetResponse,
                    registryResponse,
                    docsResponse,
                    procResponse,
                ] = await Promise.all([
                    fetchAsset(assetId),
                    fetchRegistry(registryId),
                    Number.isFinite(assetIdNumber)
                        ? fetchAssetDocuments(assetIdNumber)
                        : Promise.resolve([] as AssetDocumentItem[]),
                    Number.isFinite(assetIdNumber)
                        ? fetchInventoryProcesses({ asset_id: assetIdNumber })
                        : Promise.resolve(null),
                ]);

                if (!active) return;
                setAsset(assetResponse);
                setRegistry(registryResponse ?? null);
                setDocuments(docsResponse ?? []);
                setProcesses(procResponse ?? null);
            } catch {
                if (!active) return;
                setLoadError(MOCK_FALLBACK_MESSAGE);
                setAsset(mockAssets[0] ?? null);
                setRegistry(mockRegistries[0] ?? null);
                setDocuments(
                    mockSystemDocuments as unknown as AssetDocumentItem[],
                );
                setProcesses([]);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        void loadDetail();
        return () => {
            active = false;
        };
    }, [assetId, registryId]);

    const documentKindMap: Record<string, string> = {
        escritura: "es_publica",
        fotos: "foto_bien",
        plano: "catastro_plano",
        oficio: "solicitud",
        certificado: "certificado",
        avaluo: "avaluo",
        extraordinario: "extraordinario",
        otro: "extraordinario",
    };

    const bien = useMemo(() => {
        if (!asset) return null;
        const assetValue = asset as AssetWithExtras;
        const rawStatus =
            typeof assetValue.inventory_status === "string"
                ? assetValue.inventory_status
                : "";
        const processType =
            typeof (
                assetValue as {
                    latest_inventory_process?: { process_type?: string };
                }
            ).latest_inventory_process?.process_type === "string"
                ? (
                      assetValue as {
                          latest_inventory_process?: { process_type?: string };
                      }
                  ).latest_inventory_process?.process_type
                : "";
        const estatus =
            processType === "baja"
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

        const ubicacionValue =
            [assetValue.street, assetValue.colony].filter(Boolean).join(", ") ||
            assetValue.location?.name ||
            assetValue.location?.address ||
            "—";
        const nombreValue =
            assetValue.description ||
            assetValue.colony ||
            assetValue.street ||
            `Bien ${assetValue.id}`;
        const tipoValue =
            assetValue.operation_type?.name ||
            assetValue.operation_type_name ||
            "—";
        const valorCatastralNumber = Number(assetValue.cadastral_value);
        const valorComercialNumber = Number(assetValue.commercial_value);
        const toOptionalNumber = (value: unknown): number | undefined => {
            if (value === null || value === undefined) {
                return undefined;
            }
            if (typeof value === "number") {
                return Number.isFinite(value) ? value : undefined;
            }
            if (typeof value === "string") {
                const parsed = Number(value);
                return Number.isFinite(parsed) ? parsed : undefined;
            }
            return undefined;
        };
        const toOptionalString = (value: unknown): string | undefined => {
            if (value === null || value === undefined) {
                return undefined;
            }
            if (typeof value === "string") {
                return value;
            }
            if (typeof value === "number") {
                return String(value);
            }
            return undefined;
        };
        const extraStatus = (assetValue as Record<string, unknown>).status;
        const statusFromExtra =
            typeof extraStatus === "string" ? extraStatus : undefined;

        return {
            id: assetValue.id,
            nombre: nombreValue,
            tipo: tipoValue,
            categoria: assetValue.c_number ?? "—",
            numero: assetValue.c_number ?? undefined,
            estatus,
            rppNumero: assetValue.rpp_number ?? "—",
            cNumero: assetValue.c_number ?? "—",
            ubicacion: ubicacionValue,
            valorCatastral: Number.isFinite(valorCatastralNumber)
                ? valorCatastralNumber
                : 0,
            valorComercial: Number.isFinite(valorComercialNumber)
                ? valorComercialNumber
                : undefined,
            fechaAlta: assetValue.created_at ?? undefined,
            ultimoProceso:
                (
                    assetValue as {
                        latest_inventory_process?: { process_type?: string };
                    }
                ).latest_inventory_process?.process_type ?? undefined,
            colony: assetValue.colony ?? undefined,
            street: assetValue.street ?? undefined,
            block: assetValue.block ?? undefined,
            lot: assetValue.lot ?? undefined,
            zone: toOptionalString(assetValue.zone_id),
            domain: toOptionalString(assetValue.domain_id),
            verificationStatus: toOptionalString(
                (
                    assetValue as {
                        verification_status_id?: number | string | null;
                    }
                ).verification_status_id,
            ),
            situacion: statusFromExtra ?? assetValue.inventory_status ?? undefined,
            zoneId: toOptionalNumber(assetValue.zone_id),
            domainId: toOptionalNumber(assetValue.domain_id),
            verificationStatusId: toOptionalNumber(
                (
                    assetValue as {
                        verification_status_id?: number | string | null;
                    }
                ).verification_status_id,
            ),
            operationTypeId: toOptionalNumber(assetValue.operation_type_id),
            totalArea: assetValue.total_area ?? undefined,
            builtArea: assetValue.built_area ?? undefined,
            latitude: assetValue.latitude ?? undefined,
            longitude: assetValue.longitude ?? undefined,
        };
    }, [asset]);

    const procesos = useMemo(() => {
        const payload =
            processes && typeof processes === "object" && "data" in processes
                ? (processes as { data: unknown }).data
                : processes;
        if (!Array.isArray(payload)) return [];
        return payload.map((process) => {
            const record = process as {
                id?: number;
                process_type?: string;
                status?: string | null;
                opened_at?: string | null;
                closed_at?: string | null;
                notes?: string | null;
            };
            return {
                id: record.id,
                tipo: record.process_type,
                status: record.status ?? null,
                opened_at: record.opened_at ?? null,
                closed_at: record.closed_at ?? null,
                notes: record.notes ?? null,
            };
        });
    }, [processes]);

    const documentos = useMemo(
        () =>
            documents.map((doc) => ({
                id: doc.id,
                name: doc.name ?? null,
                kind: (doc as { kind?: string }).kind ?? null,
                filename: doc.file?.filename ?? null,
                byte_size: doc.file?.byte_size ?? null,
                created_at: (doc as { created_at?: string }).created_at ?? null,
                download_url: doc.file?.download_url ?? null,
                url: doc.file?.url ?? null,
            })),
        [documents],
    );

    const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");
    const withApiBase = (path?: string | null) => {
        if (!path) return null;
        if (/^https?:\/\//i.test(path)) return path;
        return `${apiBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    };

    const documentosConUrl = useMemo(
        () =>
            documentos.map((doc) => ({
                ...doc,
                url: withApiBase(doc.url),
                download_url: withApiBase(doc.download_url),
            })),
        [documentos, apiBaseUrl],
    );

    const resetUploadForm = () => {
        setUploadForm({
            documentos: [],
            documentosDetalle: [],
        });
        setUploadError(null);
        setUploadNotice(null);
        setUploadItems([]);
    };

    const handleOpenUpload = () => {
        if (isViewer) return;
        resetUploadForm();
        setIsUploadOpen(true);
    };

    const handleCloseUpload = () => {
        if (isUploading) return;
        setIsUploadOpen(false);
        resetUploadForm();
    };

    const uploadItemsSequence = async (
        assetIdNumber: number,
        items: Array<{
            id: string;
            name: string;
            typeLabel: string;
            docTypeId: string;
            file: File;
        }>,
    ) => {
        let position = 1;
        let sawError = false;
        for (const item of items) {
            const kind = documentKindMap[item.docTypeId];
            if (!kind) {
                console.warn(
                    "Unknown document kind for docTypeId:",
                    item.docTypeId,
                );
                sawError = true;
                setUploadItems((prev) =>
                    prev.map((entry) =>
                        entry.id === item.id
                            ? {
                                  ...entry,
                                  status: "error",
                                  error: "Tipo de documento desconocido.",
                              }
                            : entry,
                    ),
                );
                continue;
            }
            setUploadItems((prev) =>
                prev.map((entry) =>
                    entry.id === item.id
                        ? { ...entry, status: "uploading", error: undefined }
                        : entry,
                ),
            );
            try {
                await createAssetDocument(assetIdNumber, {
                    file: item.file,
                    name: item.name,
                    kind,
                    position,
                });
                position += 1;
                setUploadItems((prev) =>
                    prev.map((entry) =>
                        entry.id === item.id
                            ? { ...entry, status: "success" }
                            : entry,
                    ),
                );
            } catch (error) {
                sawError = true;
                setUploadItems((prev) =>
                    prev.map((entry) =>
                        entry.id === item.id
                            ? {
                                  ...entry,
                                  status: "error",
                                  error:
                                      error instanceof Error
                                          ? error.message
                                          : "No se pudo subir.",
                              }
                            : entry,
                    ),
                );
            }
        }
        const refreshed = await fetchAssetDocuments(assetIdNumber);
        setDocuments(refreshed ?? []);
        if (sawError) {
            setUploadNotice(
                "Se subieron algunos documentos, revisa los errores.",
            );
        } else {
            setUploadNotice("Documentos subidos correctamente.");
            setIsUploadOpen(false);
            resetUploadForm();
        }
    };

    const handleUploadDocuments = async () => {
        if (isViewer) return;
        if (isUploading) return;
        const assetIdNumber = Number(assetId);
        if (!Number.isFinite(assetIdNumber)) {
            setUploadError("ID de bien invalido.");
            return;
        }
        const filesToUpload = uploadForm.documentosDetalle.flatMap((group) =>
            group.files.map((file) => ({
                id: `${group.docTypeId}-${file.file.name}-${file.file.size}-${file.file.lastModified}`,
                name: file.name,
                typeLabel: group.docTypeLabel,
                docTypeId: group.docTypeId,
                file: file.file,
            })),
        );
        if (filesToUpload.length === 0) {
            setUploadError("Selecciona al menos un documento.");
            return;
        }
        setIsUploading(true);
        setUploadError(null);
        setUploadNotice(null);
        setUploadItems(
            filesToUpload.map((item) => ({
                id: item.id,
                name: item.name,
                typeLabel: item.typeLabel,
                docTypeId: item.docTypeId,
                file: item.file,
                status: "pending",
            })),
        );
        try {
            await uploadItemsSequence(assetIdNumber, filesToUpload);
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "No se pudieron subir los documentos.",
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleRetryFailed = async () => {
        if (isViewer) return;
        if (isUploading) return;
        const assetIdNumber = Number(assetId);
        if (!Number.isFinite(assetIdNumber)) {
            setUploadError("ID de bien invalido.");
            return;
        }
        const failedItems = uploadItems.filter(
            (item) => item.status === "error",
        );
        if (failedItems.length === 0) return;
        setIsUploading(true);
        setUploadError(null);
        setUploadNotice(null);
        try {
            await uploadItemsSequence(
                assetIdNumber,
                failedItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    typeLabel: item.typeLabel,
                    docTypeId: item.docTypeId,
                    file: item.file,
                })),
            );
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "No se pudieron subir los documentos.",
            );
        } finally {
            setIsUploading(false);
        }
    };

    const selectedDocumentsCount = useMemo(
        () =>
            uploadForm.documentosDetalle.reduce(
                (total, group) => total + group.files.length,
                0,
            ),
        [uploadForm.documentosDetalle],
    );

    const completedRequiredCount = useMemo(() => {
        const uploadedDocTypes = new Set(
            uploadForm.documentosDetalle
                .filter((group) => group.files.length > 0)
                .map((group) => group.docTypeId),
        );

        return requiredUploadDocTypeIds.filter((docTypeId) =>
            uploadedDocTypes.has(docTypeId),
        ).length;
    }, [uploadForm.documentosDetalle]);

    const uploadStats = useMemo(
        () =>
            uploadItems.reduce(
                (acc, item) => {
                    acc.total += 1;
                    acc[item.status] += 1;
                    return acc;
                },
                {
                    total: 0,
                    pending: 0,
                    uploading: 0,
                    success: 0,
                    error: 0,
                },
            ),
        [uploadItems],
    );

    const uploadProgress =
        uploadStats.total > 0
            ? Math.round((uploadStats.success / uploadStats.total) * 100)
            : 0;

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center text-muted-foreground">
                    Cargando bien...
                </div>
            </div>
        );
    }

    if (!bien) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Bien no encontrado.</p>
                    <Button
                        onClick={() => router.push(`/assets/${registryId}`)}
                        variant="outline"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al expediente
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {loadError ? (
                <p className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    {loadError}
                </p>
            ) : null}
            <BienDetail
                bien={bien}
                registry={registry}
                procesos={procesos}
                documentos={documentosConUrl}
                onUploadDocuments={isViewer ? undefined : handleOpenUpload}
                registryId={registryId}
                backPath={`/assets/${registryId}`}
                hideCreateProcess
                viewLocationHref={`/mapa?registry_id=${registryId}&asset_id=${assetId}`}
                canEdit={!isViewer}
            />
            <Dialog
                open={isUploadOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setIsUploadOpen(true);
                    } else {
                        handleCloseUpload();
                    }
                }}
            >
                <DialogContent className="w-full max-w-[calc(100%-2rem)] p-0 sm:max-w-5xl">
                    <div className="flex max-h-[85vh] flex-col">
                        <DialogHeader className="space-y-3 border-b px-5 py-4 sm:px-6">
                            <div className="space-y-1">
                                <DialogTitle>Subir documentos</DialogTitle>
                                <DialogDescription>
                                    Selecciona los archivos por tipo y despues
                                    confirma la carga.
                                </DialogDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                    {selectedDocumentsCount} seleccionado(s)
                                </Badge>
                                <Badge
                                    variant={
                                        completedRequiredCount ===
                                        requiredUploadDocTypeIds.length
                                            ? "secondary"
                                            : "outline"
                                    }
                                >
                                    Obligatorios: {completedRequiredCount}/
                                    {requiredUploadDocTypeIds.length}
                                </Badge>
                                {uploadStats.total > 0 ? (
                                    <Badge variant="outline">
                                        Progreso: {uploadProgress}%
                                    </Badge>
                                ) : null}
                            </div>
                            {uploadStats.total > 0 ? (
                                <div className="space-y-1">
                                    <Progress value={uploadProgress} />
                                    <p className="text-xs text-muted-foreground">
                                        {uploadStats.success} de {uploadStats.total} documentos subidos
                                    </p>
                                </div>
                            ) : null}
                        </DialogHeader>

                        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
                            <WizardStep3
                                formData={uploadForm}
                                updateFormData={(data) =>
                                    setUploadForm((prev) => ({ ...prev, ...data }))
                                }
                            />

                            {uploadItems.length > 0 ? (
                                <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3 sm:p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                        <span className="text-muted-foreground">
                                            {uploadStats.success} de {uploadStats.total} completados
                                        </span>
                                        {uploadStats.error > 0 ? (
                                            <span className="text-destructive">
                                                {uploadStats.error} con error
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                                        {uploadItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.typeLabel}
                                                    </p>
                                                    {item.status === "error" && item.error ? (
                                                        <p className="text-xs text-destructive">
                                                            {item.error}
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    {item.status === "uploading" ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                            <span className="text-primary">Subiendo</span>
                                                        </>
                                                    ) : item.status === "success" ? (
                                                        <>
                                                            <Check className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-emerald-600">Listo</span>
                                                        </>
                                                    ) : item.status === "error" ? (
                                                        <>
                                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                                            <span className="text-destructive">Error</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">En espera</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {uploadError ? (
                                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                    {uploadError}
                                </p>
                            ) : null}
                            {uploadNotice ? (
                                <p className="rounded-md border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                    {uploadNotice}
                                </p>
                            ) : null}
                        </div>

                        <DialogFooter className="border-t px-5 py-4 sm:px-6">
                            <Button
                                variant="outline"
                                onClick={handleCloseUpload}
                                disabled={isUploading}
                            >
                                Cancelar
                            </Button>
                            {uploadStats.error > 0 ? (
                                <Button
                                    variant="secondary"
                                    onClick={handleRetryFailed}
                                    disabled={isUploading}
                                >
                                    Reintentar fallidos ({uploadStats.error})
                                </Button>
                            ) : null}
                            <Button
                                onClick={handleUploadDocuments}
                                disabled={isUploading || selectedDocumentsCount === 0}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    `Subir ${selectedDocumentsCount} documento(s)`
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
