import {
    ApprovalRequestListResponseSchema,
    ApprovalRequestSchema,
} from "@/types";
import { api } from "./client";

export type ApprovalRequestListParams = {
    page?: number;
    per_page?: number;
    status?: string;
};

function buildApprovalRequestQuery(params?: ApprovalRequestListParams) {
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
    if (params.status) {
        search.set("status", params.status);
    }
    const query = search.toString();
    return query ? `?${query}` : "";
}

function parseApprovalRequests(data: unknown) {
    const parsed = ApprovalRequestListResponseSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del listado de aprobaciones.");
    }
    return parsed.data;
}

function parseApprovalRequest(data: unknown) {
    const parsed = ApprovalRequestSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida de la aprobacion.");
    }
    return parsed.data;
}

export async function fetchApprovalRequests(
    params?: ApprovalRequestListParams,
) {
    const normalizedParams = {
        ...params,
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 25,
    };
    const data = await api<unknown>(
        `/api/v1/approval_requests${buildApprovalRequestQuery(normalizedParams)}`,
    );
    return parseApprovalRequests(data);
}

export async function fetchApprovalRequest(id: number | string) {
    const data = await api<unknown>(`/api/v1/approval_requests/${id}`);
    return parseApprovalRequest(data);
}

export async function approveApprovalRequest(
    id: number | string,
    comment: string,
) {
    await api<unknown>(`/api/v1/approval_requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
    });
}

export async function rejectApprovalRequest(
    id: number | string,
    comment: string,
) {
    await api<unknown>(`/api/v1/approval_requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
    });
}

export async function retryApprovalRequest(id: number | string) {
    await api<unknown>(`/api/v1/approval_requests/${id}/retry`, {
        method: "POST",
    });
}

export async function cancelApprovalRequest(id: number | string) {
    await api<unknown>(`/api/v1/approval_requests/${id}/cancel`, {
        method: "POST",
    });
}
