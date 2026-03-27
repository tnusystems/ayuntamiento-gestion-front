import { z } from "zod";
import { PaginationSchema } from "@/types";
import { api } from "./client";

const DocumentFileSchema = z
    .object({
        filename: z.string().optional().nullable(),
        content_type: z.string().optional().nullable(),
        byte_size: z.number().int().optional().nullable(),
        url: z.string().optional().nullable(),
        download_url: z.string().optional().nullable(),
    })
    .passthrough();

const SystemDocumentSchema = z
    .object({
        id: z.number().int(),
        name: z.string().optional().nullable(),
        kind: z.string().optional().nullable(),
        position: z.number().int().optional().nullable(),
        metadata: z.record(z.string(), z.unknown()).optional().nullable(),
        file: DocumentFileSchema.optional().nullable(),
        image: z.boolean().optional(),
        attachable_type: z.string().optional().nullable(),
        attachable_id: z.number().int().optional().nullable(),
        created_at: z.string().optional().nullable(),
        updated_at: z.string().optional().nullable(),
    })
    .passthrough();

const DocumentsListByDocumentsSchema = z
    .object({
        documents: z.array(SystemDocumentSchema),
        pagination: PaginationSchema.optional(),
    })
    .passthrough();

const DocumentsListByDataSchema = z
    .object({
        data: z.array(SystemDocumentSchema),
        pagination: PaginationSchema.optional(),
    })
    .passthrough();

const DocumentByDocumentSchema = z
    .object({
        document: SystemDocumentSchema,
    })
    .passthrough();

const DocumentByDataSchema = z
    .object({
        data: SystemDocumentSchema,
    })
    .passthrough();

export type DocumentAttachableType = "Registry" | "Asset";

export type SystemDocument = z.infer<typeof SystemDocumentSchema>;

export type DocumentsListParams = {
    attachable_type?: DocumentAttachableType;
    attachable_id?: number;
    page?: number;
    per_page?: number;
};

export type DocumentAttachPayload = {
    attachable_id: number;
};

export type DocumentsListResponse = {
    documents: SystemDocument[];
    pagination?: z.infer<typeof PaginationSchema>;
};

function buildDocumentsListQuery(params?: DocumentsListParams) {
    if (!params) {
        return "";
    }
    const search = new URLSearchParams();
    if (params.attachable_type) {
        search.set("attachable_type", params.attachable_type);
    }
    if (
        params.attachable_id !== undefined &&
        Number.isFinite(params.attachable_id) &&
        params.attachable_id > 0
    ) {
        search.set("attachable_id", String(Math.trunc(params.attachable_id)));
    }
    if (params.page !== undefined) {
        search.set("page", String(params.page));
    }
    if (params.per_page !== undefined) {
        search.set("per_page", String(params.per_page));
    }
    const query = search.toString();
    return query ? `?${query}` : "";
}

function parseDocumentsList(data: unknown): DocumentsListResponse {
    const parsedByDocuments = DocumentsListByDocumentsSchema.safeParse(data);
    if (parsedByDocuments.success) {
        return {
            documents: parsedByDocuments.data.documents,
            pagination: parsedByDocuments.data.pagination,
        };
    }

    const parsedByData = DocumentsListByDataSchema.safeParse(data);
    if (parsedByData.success) {
        return {
            documents: parsedByData.data.data,
            pagination: parsedByData.data.pagination,
        };
    }

    throw new Error("Respuesta invalida del directorio de documentos.");
}

function parseDocument(data: unknown): SystemDocument | null {
    if (data === undefined || data === null) {
        return null;
    }

    const parsedDirect = SystemDocumentSchema.safeParse(data);
    if (parsedDirect.success) {
        return parsedDirect.data;
    }

    const parsedByDocument = DocumentByDocumentSchema.safeParse(data);
    if (parsedByDocument.success) {
        return parsedByDocument.data.document;
    }

    const parsedByData = DocumentByDataSchema.safeParse(data);
    if (parsedByData.success) {
        return parsedByData.data.data;
    }

    throw new Error("Respuesta invalida del documento.");
}

export async function fetchSystemDocuments(params?: DocumentsListParams) {
    const normalizedParams = {
        ...params,
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 10,
    };

    const data = await api<unknown>(
        `/api/v1/documents${buildDocumentsListQuery(normalizedParams)}`,
    );
    return parseDocumentsList(data);
}

export async function assignDocumentToAttachable(
    documentId: number,
    payload: DocumentAttachPayload,
) {
    const data = await api<unknown>(`/api/v1/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            document: {
                attachable_type: "Asset",
                attachable_id: Math.trunc(payload.attachable_id),
            },
        }),
    });

    return parseDocument(data);
}
