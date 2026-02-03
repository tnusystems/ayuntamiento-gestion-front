import { ActivityListResponseSchema } from "@/types";
import { api } from "./client";

export type ActivitiesListParams = {
    page?: number;
    per_page?: number;
};

function buildActivitiesQuery(params?: ActivitiesListParams) {
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

function parseActivitiesList(data: unknown) {
    const parsed = ActivityListResponseSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Respuesta invalida de actividades.");
    }
    return parsed.data;
}

export async function fetchActivities(params?: ActivitiesListParams) {
    const normalizedParams = {
        ...params,
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 25,
    };
    const data = await api<unknown>(
        `/api/v1/activities${buildActivitiesQuery(normalizedParams)}`,
    );
    return parseActivitiesList(data);
}
