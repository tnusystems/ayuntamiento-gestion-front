import { ReportListResponseSchema } from "@/types";
import { api } from "./client";
import { getApiBaseUrl } from "./baseUrl";
import { getAuthToken } from "./authToken.client";

export type ReportListParams = {
    page?: number;
    per_page?: number;
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

export async function generateAssetsReport() {
    return api<unknown>("/api/v1/reports/assets");
}

export async function generateRegistriesReport() {
    return api<unknown>("/api/v1/reports/registries");
}

export async function generateInventoryProcessesReport() {
    return api<unknown>("/api/v1/reports/inventory_processes");
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
