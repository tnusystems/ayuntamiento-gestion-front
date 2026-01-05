import { BienApiListResponseSchema, BienApiSchema } from "@/types";
import { api } from "./client";

type AssetPayload = {
  rpp_number: string;
  c_number: string;
  inventory_status: "active" | "maintenance" | "baja";
  operation_type_id?: number;
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
};

export type AssetListParams = {
  page?: number;
  per_page?: number;
  q?: string;
  category_id?: string;
  location_id?: string;
  status?: "active" | "maintenance" | "baja";
  operation_type_id?: number;
  operation_type_name?: string;
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
  if (params.status) {
    search.set("status", params.status);
  }
  if (params.operation_type_id !== undefined) {
    search.set("operation_type_id", String(params.operation_type_id));
  }
  if (params.operation_type_name) {
    search.set("operation_type_name", params.operation_type_name.trim());
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
    `/assets${buildAssetListQuery(normalizedParams)}`
  );
  return parseAssetList(data);
}

export async function createAsset(payload: AssetPayload) {
  const data = await api<unknown>("/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAsset(data);
}

export async function updateAsset(id: number, payload: AssetPayload) {
  const data = await api<unknown>(`/assets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAsset(data);
}

export async function deleteAsset(id: number) {
  await api<unknown>(`/assets/${id}`, {
    method: "DELETE",
  });
}
