const statusMessages: Record<number, string> = {
  401: "No autorizado.",
  403: "Prohibido.",
  500: "Error interno del servidor.",
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getErrorMessage(status: number, body: unknown): string {
  if (typeof body === "string" && body.trim()) {
    return body;
  }

  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof (body as { message?: string }).message === "string"
  ) {
    return (body as { message?: string }).message || "";
  }

  return statusMessages[status] ?? `Error en la petición (${status}).`;
}
