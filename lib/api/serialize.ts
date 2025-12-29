function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function serializeBody(
  body: RequestInit["body"],
  headers: HeadersInit = {}
): { body?: BodyInit; headers: Headers } {
  const resolvedHeaders = new Headers(headers);

  if (body && isPlainObject(body)) {
    if (!resolvedHeaders.has("Content-Type")) {
      resolvedHeaders.set("Content-Type", "application/json");
    }
    return { body: JSON.stringify(body), headers: resolvedHeaders };
  }

  return { body: body ?? undefined, headers: resolvedHeaders };
}
