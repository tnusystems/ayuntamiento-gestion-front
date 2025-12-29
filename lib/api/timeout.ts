export function createTimeoutSignal(
  timeoutMs: number,
  externalSignal?: AbortSignal | null
): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener(
        "abort",
        () => controller.abort(),
        { once: true }
      );
    }
  }

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timeoutId),
  };
}
