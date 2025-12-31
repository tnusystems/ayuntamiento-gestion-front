import { BienApiListSchema, BienApiSchema } from "@/types";
import { api } from "./client";

type AssetPayload = {
  rpp_number: string;
  c_number: string;
  inventory_status: "active" | "maintenance" | "baja";
  operation_type_id?: number;
  status?: "active" | "maintenance" | "baja";
  description?: string;
};

function parseAssetList(data: unknown) {
  const parsed = BienApiListSchema.safeParse(data);
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

export async function fetchAssets() {
  const data = await api<unknown>("/assets");
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
