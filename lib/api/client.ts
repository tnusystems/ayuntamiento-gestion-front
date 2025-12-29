import { getAuthToken } from "./authToken";
import { getApiBaseUrl } from "./baseUrl";
import { ApiError, getErrorMessage } from "./errors";
import { parseResponse } from "./response";
import { serializeBody } from "./serialize";
import { createTimeoutSignal } from "./timeout";

export type ApiOptions = RequestInit & {
  timeoutMs?: number;
};

export async function api<T>(
  path: string,
  init: ApiOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("API base URL no configurada.");
  }

  const token = await getAuthToken();
  const { body, headers } = serializeBody(init.body, init.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const timeoutMs = init.timeoutMs ?? 15000;
  const { signal, cancel } = createTimeoutSignal(timeoutMs, init.signal);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      body,
      headers,
      signal,
    });

    const data = await parseResponse<T>(res);
    if (!res.ok) {
      throw new ApiError(res.status, data, getErrorMessage(res.status, data));
    }

    return data;
  } finally {
    cancel();
  }
}
