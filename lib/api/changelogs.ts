import { ChangeLogListResponseSchema, ChangeLogSchema } from "@/types";
import { api } from "./client";

export type ChangeLogListParams = {
    page?: number;
    per_page?: number;
};

function buildChangeLogsQuery(params?: ChangeLogListParams) {
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
    const query = search.toString();
    return query ? `?${query}` : "";
}

function parseChangeLogsList(data: unknown) {
    const parsed = ChangeLogListResponseSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida de auditoría.");
    }
    return parsed.data;
}

function parseChangeLogDetail(data: unknown) {
    const parsed = ChangeLogSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del detalle.");
    }
    return parsed.data;
}

export async function fetchChangeLogs(params?: ChangeLogListParams) {
    const normalizedParams = {
        ...params,
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 25,
    };
    const data = await api<unknown>(
        `/api/v1/changelogs${buildChangeLogsQuery(normalizedParams)}`,
    );
    return parseChangeLogsList(data);
}

export async function fetchChangeLogDetail(id: string | number) {
    const data = await api<unknown>(`/api/v1/changelogs/${id}`);
    return parseChangeLogDetail(data);
}
