type AdminFetchOptions = Parameters<typeof $fetch>[1]

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let cachedCsrfToken: string | null = null

export function clearAdminCsrfCache() {
  cachedCsrfToken = null
}

/**
 * Credentialed fetch to the Django API origin (session cookies + CSRF).
 * Use only on the client for admin flows; SSR does not forward browser cookies.
 */
export function useAdminApi() {
  const config = useRuntimeConfig()

  function apiOrigin(): string {
    return config.public.apiOrigin.replace(/\/$/, '')
  }

  async function ensureCsrf(): Promise<string> {
    const res = await $fetch<{ csrfToken: string }>(`${apiOrigin()}/auth/csrf/`, {
      credentials: 'include',
    })
    cachedCsrfToken = res.csrfToken
    return cachedCsrfToken
  }

  async function fetch<T>(path: string, options: AdminFetchOptions = {}): Promise<T> {
    const method = String(options.method ?? 'GET').toUpperCase()
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    }
    if (UNSAFE_METHODS.has(method)) {
      headers['X-CSRFToken'] = await ensureCsrf()
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return $fetch<T>(`${apiOrigin()}${normalizedPath}`, {
      ...options,
      method,
      credentials: 'include',
      headers,
    })
  }

  return {
    apiOrigin,
    ensureCsrf,
    fetch,
    get: <T>(path: string, options?: AdminFetchOptions) =>
      fetch<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: AdminFetchOptions) =>
      fetch<T>(path, { ...options, method: 'POST', body }),
    patch: <T>(path: string, body?: unknown, options?: AdminFetchOptions) =>
      fetch<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T>(path: string, options?: AdminFetchOptions) =>
      fetch<T>(path, { ...options, method: 'DELETE' }),
  }
}
