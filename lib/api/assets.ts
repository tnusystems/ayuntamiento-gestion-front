import {
    ArchivoApiSchema,
    BienApiListResponseSchema,
    BienApiSchema,
    ApprovalRequestCreateResponseSchema,
} from "@/types";
import { api } from "./client";

type AssetPayload = {
    rpp_number: string;
    c_number: string;
    inventory_status: "active" | "maintenance" | "baja";
    operation_type_id?: number;
    owner_name?: string;
    registry_date?: string;
    registry_section?: string;
    registry_volume?: string;
    registry_id?: number;
    category?: Record<string, unknown>;
    location?: Record<string, unknown>;
    status?: "active" | "maintenance" | "baja";
    description?: string;
    colony?: string;
    street?: string;
    block?: string;
    lot?: string;
    total_area?: string | number;
    built_area?: string | number;
    cadastral_value?: string | number;
    commercial_value?: string | number;
    latitude?: string | number;
    longitude?: string | number;
    domain_id?: string;
    operation_type?: string;
    land_use_id?: string;
    stage_definition_id?: string;
    zone_id?: string;
};

type AssetDocumentPayload = {
    file: File;
    name?: string;
    kind?: string;
    position?: number;
    metadata?: Record<string, unknown>;
};

export type AssetListParams = {
    page?: number;
    per_page?: number;
    q?: string;
    category_id?: string;
    location_id?: string;
    registry_id?: string;
    status?: "active" | "maintenance" | "baja";
    operation_type_id?: number;
    operation_type_name?: string;
    inventory_process_type?: "alta" | "baja";
    order?: "asc" | "desc";
    order_by?: string;
};

function parseAssetList(data: unknown) {
    const parsed = BienApiListResponseSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del listado de bienes.");
    }
    return parsed.data;
}

function parseAsset(data: unknown) {
    if (!data || typeof data !== "object") {
        return null;
    }
    const parsed = BienApiSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del bien.");
    }
    return parsed.data;
}

function parseUpdateAssetResponse(data: unknown) {
    const approvalParsed = ApprovalRequestCreateResponseSchema.safeParse(data);
    if (approvalParsed.success) {
        return approvalParsed.data;
    }
    return parseAsset(data);
}

function parseCreateAssetResponse(data: unknown) {
    const approvalParsed = ApprovalRequestCreateResponseSchema.safeParse(data);
    if (approvalParsed.success) {
        return approvalParsed.data;
    }
    return parseAsset(data);
}

export async function fetchAsset(id: number | string) {
    const data = await api<unknown>(`/api/v1/assets/${id}`);
    return parseAsset(data);
}

function parseAssetDocument(data: unknown) {
    const parsed = ArchivoApiSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del documento.");
    }
    return parsed.data;
}

function buildAssetListQuery(params?: AssetListParams) {
    if (!params) {
        return "";
    }
    const search = new URLSearchParams();
    if (params.page !== undefined) {
        search.set("page", String(params.page));
    }
    if (params.per_page !== undefined) {
        search.set("per_page", String(params.per_page));
    }
    if (params.q) {
        search.set("q", params.q.trim());
    }
    if (params.category_id) {
        search.set("category_id", params.category_id);
    }
    if (params.location_id) {
        search.set("location_id", params.location_id);
    }
    if (params.registry_id) {
        search.set("registry_id", params.registry_id);
    }
    if (params.status) {
        search.set("status", params.status);
    }
    if (params.operation_type_id !== undefined) {
        search.set("operation_type_id", String(params.operation_type_id));
    }
    if (params.operation_type_name) {
        search.set("operation_type_name", params.operation_type_name.trim());
    }
    if (params.inventory_process_type) {
        search.set("inventory_process_type", params.inventory_process_type);
    }
    if (params.order) {
        search.set("order", params.order);
    }
    if (params.order_by) {
        search.set("order_by", params.order_by);
    }
    const query = search.toString();
    return query ? `?${query}` : "";
}

export async function fetchAssets(params?: AssetListParams) {
    const normalizedParams = {
        ...params,
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 10,
    };
    const data = await api<unknown>(
        `/api/v1/assets${buildAssetListQuery(normalizedParams)}`,
    );
    return parseAssetList(data);
}

export async function createAsset(payload: AssetPayload) {
    const data = await api<unknown>("/api/v1/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return parseCreateAssetResponse(data);
}

export async function updateAsset(id: number, payload: AssetPayload) {
    //console.log("updateAsset not implemented yet", { id, payload });

    const data = await api<unknown>(`/api/v1/assets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return parseUpdateAssetResponse(data);
}

export async function createAssetDocument(
    assetId: number,
    payload: AssetDocumentPayload,
) {
    const formData = new FormData();
    formData.append("document[file]", payload.file);
    if (payload.name) {
        formData.append("document[name]", payload.name);
    }
    if (payload.kind) {
        formData.append("document[kind]", payload.kind);
    } else {
        formData.append("document[document_type_id]", "171");
    }
    if (payload.position !== undefined) {
        formData.append("document[position]", String(payload.position));
    }
    if (payload.metadata) {
        formData.append("document[metadata]", JSON.stringify(payload.metadata));
    }

    const data = await api<unknown>(`/assets/${assetId}/documents`, {
        method: "POST",
        body: formData,
    });
    return parseAssetDocument(data);
}
