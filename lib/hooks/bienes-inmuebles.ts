import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type {
    BienesInmueblesFormValues,
    BienesInmueblesTableRow,
} from "@/components/bienes-inmuebles/types";
import {
    createAsset,
    createAssetDocument,
    fetchAssets,
    type AssetListParams,
    updateAsset,
} from "@/lib/api/assets";
import { ApiError } from "@/lib/api/errors";
import { fetchOperationTypes } from "@/lib/api/operation-types";
import { BienFormSchema, type OperationType } from "@/types";

const formatDate = (value?: string) => {
    if (!value) {
        return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    return date.toLocaleDateString("es-MX");
};

const parseInventoryStatus = (
    value?: string | null,
): "active" | "maintenance" | "baja" | undefined => {
    if (!value || value === "NULL") return undefined;
    if (value === "active" || value === "maintenance" || value === "baja")
        return value;
    return undefined;
};

const toOptionalNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const mapAssetToRow = (
    emptyFormValues: BienesInmueblesFormValues,
    asset: Awaited<ReturnType<typeof fetchAssets>>["data"][number],
): BienesInmueblesTableRow => {
    const status =
        asset.inventory_status && asset.inventory_status !== "NULL"
            ? asset.inventory_status
            : "active";
    const estado = status === "active" ? "Activo" : "Inactivo";
    const ubicacion =
        [asset.street, asset.colony].filter(Boolean).join(", ") ||
        asset.location?.name ||
        asset.location?.address ||
        "";
    const descripcionFallback = [
        asset.colony ? `Col. ${asset.colony}` : null,
        asset.block ? `Mz. ${asset.block}` : null,
        asset.lot ? `Lt. ${asset.lot}` : null,
    ]
        .filter(Boolean)
        .join(" - ");
    const descripcion =
        asset.description ||
        descripcionFallback ||
        asset.operation_type_name ||
        "";
    const clave = asset.rpp_number || asset.c_number || `${asset.id}`;

    return {
        ...emptyFormValues,
        id: `${asset.id}`,
        clave,
        descripcion,
        ubicacion,
        estado,
        fecha: formatDate(asset.created_at),
        responsable: "",
        apiId: asset.id,
        rppNumber: asset.rpp_number ?? undefined,
        cNumber: asset.c_number ?? "",
        inventoryStatus: parseInventoryStatus(asset.inventory_status),
        operationTypeId: asset.operation_type_id ?? undefined,
        operationTypeName: asset.operation_type_name,
        operation: asset.operation_type_id
            ? String(asset.operation_type_id)
            : "",
        registroNumero: asset.rpp_number ?? "",
        escriturasNumero: asset.c_number ?? "",
        nombre: asset.description ?? asset.colony ?? "",
        antecedente: "",
        colony: asset.colony ?? "",
        street: asset.street ?? "",
        block: asset.block ?? "",
        lot: asset.lot ?? "",
        totalArea:
            asset.total_area !== null && asset.total_area !== undefined
                ? String(asset.total_area)
                : "",
        builtArea:
            asset.built_area !== null && asset.built_area !== undefined
                ? String(asset.built_area)
                : "",
        cadastralValue:
            asset.cadastral_value !== null &&
            asset.cadastral_value !== undefined
                ? String(asset.cadastral_value)
                : "",
        commercialValue:
            asset.commercial_value !== null &&
            asset.commercial_value !== undefined
                ? String(asset.commercial_value)
                : "",
        latitude:
            asset.latitude !== null && asset.latitude !== undefined
                ? String(asset.latitude)
                : "",
        longitude:
            asset.longitude !== null && asset.longitude !== undefined
                ? String(asset.longitude)
                : "",
    };
};

const toFormValues = (
    row: BienesInmueblesTableRow,
): BienesInmueblesFormValues => ({
    operation:
        row.operationTypeId !== undefined
            ? String(row.operationTypeId)
            : row.operation || "",
    dateFilter: row.dateFilter,
    registroNumero: row.registroNumero || row.rppNumber || "",
    registroVolumen: row.registroVolumen,
    registroSeccion: row.registroSeccion,
    registroFecha: row.registroFecha,
    escriturasNumero: row.escriturasNumero || row.cNumber || "",
    escriturasNotaria: row.escriturasNotaria,
    escriturasFecha: row.escriturasFecha,
    boletinNumero: row.boletinNumero,
    boletinVolumen: row.boletinVolumen,
    boletinFecha: row.boletinFecha,
    convenioNumero: row.convenioNumero,
    convenioVolumen: row.convenioVolumen,
    convenioFecha: row.convenioFecha,
    nombre: row.nombre || row.descripcion,
    antecedente: row.antecedente,
    colony: row.colony,
    street: row.street,
    block: row.block,
    lot: row.lot,
    totalArea: row.totalArea,
    builtArea: row.builtArea,
    cadastralValue: row.cadastralValue,
    commercialValue: row.commercialValue,
    latitude: row.latitude,
    longitude: row.longitude,
});

const buildAssetPayload = (
    values: BienesInmueblesFormValues,
    inventoryStatus: "active" | "maintenance" | "baja",
) => ({
    rpp_number: values.registroNumero.trim(),
    c_number: values.escriturasNumero.trim(),
    inventory_status: inventoryStatus,
    status: inventoryStatus,
    operation_type_id: toOptionalNumber(values.operation),
    description: values.nombre.trim() || undefined,
    colony: values.colony.trim() || undefined,
    street: values.street.trim() || undefined,
    block: values.block.trim() || undefined,
    lot: values.lot.trim() || undefined,
    total_area: values.totalArea.trim() || undefined,
    built_area: values.builtArea.trim() || undefined,
    cadastral_value: values.cadastralValue.trim() || undefined,
    commercial_value: values.commercialValue.trim() || undefined,
    latitude: toOptionalNumber(values.latitude),
    longitude: toOptionalNumber(values.longitude),
});

const buildPaginationState = (
    response: Awaited<ReturnType<typeof fetchAssets>>,
    params: AssetListParams,
) => ({
    currentPage: response.pagination?.current_page ?? params.page ?? 1,
    totalPages: Math.max(1, response.pagination?.total_pages ?? 1),
    totalCount: response.pagination?.total_count ?? response.data.length,
    perPage: response.pagination?.per_page ?? params.per_page ?? 10,
});

const buildFallbackPagination = (params: AssetListParams) => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    perPage: params.per_page ?? 10,
});

export function useAssetsList(emptyFormValues: BienesInmueblesFormValues) {
    const [tableData, setTableData] = useState<BienesInmueblesTableRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        perPage: 10,
    });
    const [assetFilters, setAssetFilters] = useState<AssetListParams>({
        page: 1,
        per_page: 10,
    });

    const loadAssets = useCallback(
        async (params: AssetListParams) => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await fetchAssets(params);
                setTableData(
                    response.data.map((asset) =>
                        mapAssetToRow(emptyFormValues, asset),
                    ),
                );
                setPagination(buildPaginationState(response, params));
            } catch (error) {
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "No se pudo cargar el listado.",
                );
                setTableData([]);
                setPagination(buildFallbackPagination(params));
            } finally {
                setIsLoading(false);
            }
        },
        [emptyFormValues],
    );

    useEffect(() => {
        void loadAssets(assetFilters);
    }, [assetFilters, loadAssets]);

    return {
        tableData,
        isLoading,
        loadError,
        pagination,
        assetFilters,
        setAssetFilters,
        loadAssets,
    };
}

export function useOperationTypes() {
    const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);

    useEffect(() => {
        let isMounted = true;
        const loadOperationTypes = async () => {
            try {
                const data = await fetchOperationTypes();
                if (isMounted) {
                    setOperationTypes(data);
                }
            } catch {
                if (isMounted) {
                    setOperationTypes([]);
                }
            }
        };
        void loadOperationTypes();
        return () => {
            isMounted = false;
        };
    }, []);

    return operationTypes;
}

type UseAssetActionsParams = {
    emptyFormValues: BienesInmueblesFormValues;
    assetFilters: AssetListParams;
    loadAssets: (params: AssetListParams) => Promise<void>;
    setAssetFilters: Dispatch<SetStateAction<AssetListParams>>;
};

export function useAssetActions({
    emptyFormValues,
    assetFilters,
    loadAssets,
    setAssetFilters,
}: UseAssetActionsParams) {
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editRow, setEditRow] = useState<BienesInmueblesTableRow | null>(
        null,
    );
    const [editingRow, setEditingRow] =
        useState<BienesInmueblesTableRow | null>(null);
    const [attachRow, setAttachRow] = useState<BienesInmueblesTableRow | null>(
        null,
    );
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentName, setAttachmentName] = useState("");
    const [attachmentPosition, setAttachmentPosition] = useState("");
    const [attachmentMetadata, setAttachmentMetadata] = useState("");

    const form = useForm<BienesInmueblesFormValues>({
        defaultValues: emptyFormValues,
    });

    const handleSearch = useCallback(
        (query: string) => {
            const operationTypeId = toOptionalNumber(
                form.getValues("operation"),
            );
            setAssetFilters((prev) => ({
                ...prev,
                page: 1,
                q: query || undefined,
                operation_type_id: operationTypeId,
            }));
        },
        [form, setAssetFilters],
    );

    const handlePageChange = useCallback(
        (nextPage: number) => {
            setAssetFilters((prev) => ({
                ...prev,
                page: nextPage,
            }));
        },
        [setAssetFilters],
    );

    const onSubmit = async (values: BienesInmueblesFormValues) => {
        form.clearErrors();
        setSubmitError(null);
        setSuccessMessage(null);

        const parsed = BienFormSchema.safeParse(values);
        if (!parsed.success) {
            for (const issue of parsed.error.issues) {
                const field = issue.path[0];
                if (field) {
                    form.setError(field as keyof BienesInmueblesFormValues, {
                        type: "manual",
                        message: issue.message,
                    });
                }
            }
            return;
        }

        setIsSaving(true);
        try {
            const inventoryStatus =
                editingRow?.inventoryStatus ?? ("active" as const);
            const payload = buildAssetPayload(values, inventoryStatus);

            if (editingRow?.apiId) {
                await updateAsset(editingRow.apiId, payload);
                setSuccessMessage("Bien actualizado correctamente.");
            } else {
                const response = await createAsset(payload);
                const isApprovalRequest =
                    !!response &&
                    typeof response === "object" &&
                    "approval_request" in response;
                setSuccessMessage(
                    isApprovalRequest
                        ? "Solicitud de aprobación enviada."
                        : "Bien creado correctamente.",
                );
            }

            setEditingRow(null);
            form.reset(emptyFormValues);
            await loadAssets(assetFilters);
        } catch (error) {
            if (error instanceof ApiError) {
                setSubmitError(error.message);
            } else if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError("No se pudo guardar el bien.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditRequest = (row: BienesInmueblesTableRow) => {
        setEditRow(row);
    };

    const handleConfirmEdit = () => {
        if (editRow) {
            form.reset(toFormValues(editRow));
            setEditingRow(editRow);
            setSuccessMessage(null);
            setSubmitError(null);
        }
        setEditRow(null);
    };

    const handleCancelEdit = () => {
        setEditingRow(null);
        setSuccessMessage(null);
        setSubmitError(null);
        form.reset(emptyFormValues);
    };

    const handleAttachRequest = (row: BienesInmueblesTableRow) => {
        setAttachment(null);
        setAttachmentName("");
        setAttachmentPosition("");
        setAttachmentMetadata("");
        setSubmitError(null);
        setSuccessMessage(null);
        setAttachRow(row);
    };

    const handleCloseAttach = () => {
        setAttachRow(null);
        setAttachment(null);
        setAttachmentName("");
        setAttachmentPosition("");
        setAttachmentMetadata("");
    };

    const handleAttachmentFileChange = (file: File | null) => {
        setAttachment(file);
        if (file && !attachmentName.trim()) {
            setAttachmentName(file.name);
        }
    };

    const handleConfirmAttach = async () => {
        if (!attachRow?.apiId || !attachment) {
            setSubmitError("Selecciona un archivo antes de continuar.");
            return;
        }

        let metadata: Record<string, unknown> | undefined;
        if (attachmentMetadata.trim()) {
            try {
                const parsed = JSON.parse(attachmentMetadata);
                if (
                    !parsed ||
                    typeof parsed !== "object" ||
                    Array.isArray(parsed)
                ) {
                    throw new Error("metadata is not an object");
                }
                metadata = parsed as Record<string, unknown>;
            } catch {
                setSubmitError("Metadatos invalidos. Usa un JSON con objeto.");
                return;
            }
        }

        setIsSaving(true);
        setSubmitError(null);
        setSuccessMessage(null);

        try {
            await createAssetDocument(attachRow.apiId, {
                file: attachment,
                name: attachmentName.trim() || undefined,
                position: toOptionalNumber(attachmentPosition),
                metadata,
            });
            setSuccessMessage("Documento adjuntado correctamente.");
            setAttachRow(null);
            setAttachment(null);
            setAttachmentName("");
            setAttachmentPosition("");
            setAttachmentMetadata("");
        } catch (error) {
            if (error instanceof ApiError) {
                setSubmitError(error.message);
            } else if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError("No se pudo adjuntar el documento.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return {
        form,
        isSaving,
        submitError,
        successMessage,
        editRow,
        editingRow,
        attachRow,
        attachment,
        attachmentName,
        attachmentPosition,
        attachmentMetadata,
        setEditRow,
        setAttachmentName,
        setAttachmentPosition,
        setAttachmentMetadata,
        handleSearch,
        handlePageChange,
        onSubmit,
        handleEditRequest,
        handleConfirmEdit,
        handleCancelEdit,
        handleAttachRequest,
        handleCloseAttach,
        handleAttachmentFileChange,
        handleConfirmAttach,
    };
}
