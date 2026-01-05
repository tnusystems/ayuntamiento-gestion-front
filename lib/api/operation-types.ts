import { OperationTypeListSchema } from "@/types";
import { api } from "./client";

function parseOperationTypes(data: unknown) {
  const parsed = OperationTypeListSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Respuesta invalida de tipos de operacion.");
  }
  return parsed.data;
}

export async function fetchOperationTypes() {
  const data = await api<unknown>("/operation_types");
  return parseOperationTypes(data);
}
