import { api } from "@/lib/api/client";
import { UsuarioSchema, type Usuario } from "@/types";

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
};

function parseUsers(data: unknown): Usuario[] {
  const candidates: unknown[] = [];
  if (Array.isArray(data)) {
    candidates.push(data);
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      candidates.push(record.data);
    }
    if (Array.isArray(record.users)) {
      candidates.push(record.users);
    }
  }

  for (const candidate of candidates) {
    const parsed = UsuarioSchema.array().safeParse(candidate);
    if (parsed.success) {
      return parsed.data;
    }
  }

  throw new Error("Respuesta invalida del listado de usuarios.");
}

function parseUser(data: unknown): Usuario {
  const payload =
    data && typeof data === "object" && "user" in data
      ? (data as { user?: unknown }).user
      : data;
  const parsed = UsuarioSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Respuesta invalida del usuario.");
  }
  return parsed.data;
}

export async function fetchUsers(): Promise<Usuario[]> {
  const data = await api<unknown>("/users");
  return parseUsers(data);
}

export async function createUser(payload: CreateUserPayload): Promise<Usuario> {
  const data = await api<unknown>("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: payload }),
  });
  return parseUser(data);
}
