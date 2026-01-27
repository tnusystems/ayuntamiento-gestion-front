import { z } from "zod";
import { LookupValueListSchema, type LookupValue } from "@/types";
import { api } from "./client";

export const LOOKUP_KINDS = [
    "state",
    "domain",
    "location",
    "stage_definition",
    "document_type",
    "operation_type",
    "verification_status",
    "zone",
    "operacion_u",
] as const;

export type LookupKind = (typeof LOOKUP_KINDS)[number];
export type LookupCatalogs = Record<LookupKind, LookupValue[]>;

const LookupValuesResponseSchema = LookupValueListSchema.or(
    z.object({ data: LookupValueListSchema }).passthrough(),
);

function parseLookupValues(data: unknown) {
    const parsed = LookupValuesResponseSchema.safeParse(data);
    console.log(parsed.error);
    if (!parsed.success) {
        throw new Error("Respuesta invalida de catalogos.");
    }
    if (Array.isArray(parsed.data)) {
        return parsed.data;
    }
    return parsed.data.data;
}

export async function fetchLookupValues(kind: LookupKind) {
    const query = new URLSearchParams({ kind }).toString();
    const data = await api<unknown>(`/lookup_values?${query}`);
    return parseLookupValues(data);
}

export async function fetchCatalogs(): Promise<LookupCatalogs> {
    const entries = await Promise.all(
        LOOKUP_KINDS.map(
            async (kind) => [kind, await fetchLookupValues(kind)] as const,
        ),
    );

    return entries.reduce((acc, [kind, values]) => {
        acc[kind] = values;
        return acc;
    }, {} as LookupCatalogs);
}
