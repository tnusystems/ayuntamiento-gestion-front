// app/(app)/assets/[registries_id]/detail/[asset_id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BienDetail from "@/components/bienes/bien-detail";
import { Button } from "@/components/ui/button";
import { fetchAsset } from "@/lib/api/assets";
import { fetchRegistry } from "@/lib/api/registries";
import { fetchAssetDocuments } from "@/lib/api/files/fileByAsset";
import { fetchInventoryProcesses } from "@/lib/api/inventory-processes";

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

export default function AssetDetailPage() {
    const params = useParams<{ registries_id: string; asset_id: string }>();
    const router = useRouter();
    const registryId = params.registries_id;
    const assetId = params.asset_id;

    const [asset, setAsset] = useState<AssetDetail>(null);
    const [registry, setRegistry] = useState<RegistryItem>(null);
    const [documents, setDocuments] = useState<AssetDocumentItem[]>([]);
    const [processes, setProcesses] = useState<InventoryProcessResponse>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

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
            } catch (error) {
                if (!active) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "No se pudo cargar el bien.",
                );
                setAsset(null);
                setRegistry(null);
                setDocuments([]);
                setProcesses(null);
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
            situacion:
                assetValue.status ?? assetValue.inventory_status ?? undefined,
            zoneId: toOptionalNumber(assetValue.zone_id),
            domainId: toOptionalNumber(assetValue.domain_id),
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
                filename: doc.file?.filename ?? null,
                byte_size: doc.file?.byte_size ?? null,
                created_at: (doc as { created_at?: string }).created_at ?? null,
                download_url: doc.file?.download_url ?? null,
                url: doc.file?.url ?? null,
            })),
        [documents],
    );

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center text-muted-foreground">
                    Cargando bien...
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
            <BienDetail
                bien={bien}
                registry={registry}
                procesos={procesos}
                documentos={documentos}
                registryId={registryId}
                backPath={`/assets/${registryId}`}
                hideCreateProcess
                viewLocationHref={`/mapa?registry_id=${registryId}&asset_id=${assetId}`}
            />
        </div>
    );
}
