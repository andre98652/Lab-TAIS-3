export class TimeoutError extends Error {
  constructor() {
    super('La solicitud excedió el tiempo límite');
    this.name = 'TimeoutError';
  }
}

export type FetchLike = typeof fetch;

export async function fetchWithTimeout(
  url: string,
  fetchFn: FetchLike,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchFn(url, { signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
      throw new TimeoutError();
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}
