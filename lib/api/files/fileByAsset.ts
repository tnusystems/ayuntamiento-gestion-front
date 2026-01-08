import { ArchivoApiListSchema, ArchivoApiSchema } from "@/types";
import { api } from "@/lib/api/client";

function parseAssetDocuments(data: unknown) {
  const payload =
    data && typeof data === "object" && "data" in data
      ? (data as { data: unknown }).data
      : data;
  const parsed = ArchivoApiListSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Respuesta invalida de documentos.");
  }
  return parsed.data;
}

function parseAssetDocument(data: unknown) {
  const parsed = ArchivoApiSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Respuesta invalida del documento.");
  }
  return parsed.data;
}

export async function fetchAssetDocuments(assetId: number) {
  const data = await api<unknown>(`/assets/${assetId}/documents`);
  return parseAssetDocuments(data);
}

export async function fetchAssetDocument(
  assetId: number,
  documentId: number
) {
  const data = await api<unknown>(
    `/assets/${assetId}/documents/${documentId}`
  );
  return parseAssetDocument(data);
}
