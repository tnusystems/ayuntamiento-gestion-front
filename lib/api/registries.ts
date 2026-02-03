import {
    ApprovalRequestCreateResponseSchema,
    RegistryApiListResponseSchema,
    RegistryApiSchema,
} from "@/types";
import { api } from "./client";

export type RegistryListParams = {
    page?: number;
    per_page?: number;
    q?: string;
    status?: string;
};

export type RegistryPayload = {
    name: string;
    rpp_number: string;
    rpp_volume?: string;
    rpp_section?: string;
    rpp_date?: string;
    rpp_antecedent?: string;
    rpp_antecedent_1?: string;
    rpp_antecedent_2?: string;
    rpp_antecedent_3?: string;
    rpp_antecedent_4?: string;
    rpp_antecedent_5?: string;
    b_number?: string;
    b_volume?: string;
    b_date?: string;
    e_number?: string;
    e_notary?: string;
    e_date?: string;
    co_number?: string;
    co_date?: string;
    status?: string;
    fecha_alta?: string;
    st_baja?: boolean;
};

function parseRegistryList(data: unknown) {
    const parsed = RegistryApiListResponseSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del listado de registros.");
    }
    return parsed.data;
}

function parseRegistry(data: unknown) {
    if (!data || typeof data !== "object") {
        return null;
    }
    const parsed = RegistryApiSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del registro.");
    }
    return parsed.data;
}

function parseRegistryUpdateResponse(data: unknown) {
    const approvalParsed = ApprovalRequestCreateResponseSchema.safeParse(data);
    if (approvalParsed.success) {
        return approvalParsed.data;
    }
    return parseRegistry(data);
}

function buildRegistryListQuery(params?: RegistryListParams) {
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
    if (params.status) {
        search.set("status", params.status);
    }
    const query = search.toString();
    return query ? `?${query}` : "";
}

export async function fetchRegistries(params?: RegistryListParams) {
    const normalizedParams = {
        ...params,
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 10,
    };
    const data = await api<unknown>(
        `/api/v1/registries${buildRegistryListQuery(normalizedParams)}`,
    );
    return parseRegistryList(data);
}

export async function createRegistry(payload: RegistryPayload) {
    const data = await api<unknown>("/api/v1/registries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return parseRegistry(data);
}

export async function updateRegistry(
    id: number | string,
    payload: Partial<RegistryPayload>,
) {
    const data = await api<unknown>(`/api/v1/registries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return parseRegistryUpdateResponse(data);
}

export async function fetchRegistry(id: number | string) {
    const data = await api<unknown>(`/api/v1/registries/${id}`);
    return parseRegistry(data);
}
