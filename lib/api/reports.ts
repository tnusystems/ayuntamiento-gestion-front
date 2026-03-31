import { ReportListResponseSchema } from "@/types";
import { api } from "./client";
import { getApiBaseUrl } from "./baseUrl";
import { getAuthToken } from "./authToken.client";
import { AUTH_UNAUTHORIZED_EVENT } from "@/lib/auth/events";

export type ReportListParams = {
    page?: number;
    per_page?: number;
};

export type ReportGenerationParams = {
    start_date?: string;
    end_date?: string;
};

function buildReportsQuery(params?: ReportListParams) {
    if (!params) return "";
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

function parseReportsList(data: unknown) {
    const parsed = ReportListResponseSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del listado de reportes.");
    }
    return parsed.data;
}

function buildReportGenerationQuery(params?: ReportGenerationParams) {
    if (!params) return "";
    const search = new URLSearchParams();
    if (params.start_date) {
        search.set("start_date", params.start_date);
    }
    if (params.end_date) {
        search.set("end_date", params.end_date);
    }
    const query = search.toString();
    return query ? `?${query}` : "";
}

export async function fetchReports(params?: ReportListParams) {
    const normalizedParams = {
        ...params,
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 10,
    };
    const data = await api<unknown>(
        `/api/v1/reports${buildReportsQuery(normalizedParams)}`,
    );
    return parseReportsList(data);
}

export async function generateAssetsReport(params?: ReportGenerationParams) {
    return api<unknown>(
        `/api/v1/reports/assets${buildReportGenerationQuery(params)}`,
    );
}

export async function generateRegistriesReport(params?: ReportGenerationParams) {
    return api<unknown>(
        `/api/v1/reports/registries${buildReportGenerationQuery(params)}`,
    );
}

export async function generateInventoryProcessesReport(
    params?: ReportGenerationParams,
) {
    return api<unknown>(
        `/api/v1/reports/inventory_processes${buildReportGenerationQuery(params)}`,
    );
}

function extractFilenameFromDisposition(header: string | null) {
    if (!header) return null;
    const match = header.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
    if (!match) return null;
    return decodeURIComponent(match[1].replace(/\"/g, ""));
}

export async function downloadReportFile(id: number | string) {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
        throw new Error("API base URL no configurada.");
    }
    const token = await getAuthToken();
    const res = await fetch(`${baseUrl}/api/v1/reports/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.status === 401 && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
    }
    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
            const data = await res.json();
            throw new Error(
                data?.message || "No se pudo descargar el reporte.",
            );
        }
        throw new Error("No se pudo descargar el reporte.");
    }
    const blob = await res.blob();
    const filename =
        extractFilenameFromDisposition(res.headers.get("content-disposition")) ??
        `reporte-${id}.csv`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
