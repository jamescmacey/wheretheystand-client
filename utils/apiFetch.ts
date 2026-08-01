/**
 * Default timeout for SSR/client fetches to the Django API. Without this,
 * a backend outage leaves `$fetch` waiting indefinitely (or for a very long
 * platform-level timeout) instead of failing fast so the page can render
 * its error state.
 */
export const API_FETCH_TIMEOUT_MS = 6000

/**
 * members-of-parliament/ is known to legitimately take up to ~12s to compute
 * (not yet fixed backend-side), so it gets more headroom than the default.
 */
export const MEMBERS_OF_PARLIAMENT_TIMEOUT_MS = 15000

type FetchOptions = Record<string, unknown>

/**
 * Merge default timeout/retry behaviour into `$fetch` options for API calls.
 * `retry` is disabled so a timeout fails fast rather than doubling the wait
 * (ofetch retries GET requests once by default, including on timeout).
 */
export function apiFetchOptions<T extends FetchOptions = FetchOptions>(options?: T) {
  return {
    timeout: API_FETCH_TIMEOUT_MS,
    retry: 0,
    ...options,
  }
}
