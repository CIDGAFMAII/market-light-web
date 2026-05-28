export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8000,
) {
  const controller = new AbortController();
  const timeout = windowlessSetTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function windowlessSetTimeout(callback: () => void, timeoutMs: number) {
  return setTimeout(callback, timeoutMs);
}
