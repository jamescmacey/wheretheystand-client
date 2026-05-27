import { clearAdminCsrfCache } from './useAdminApi'

export type AdminUser = {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  github_username: string | null
  bio: string | null
  avatar: string | null
  is_staff: boolean
  is_superuser: boolean
}

export type AdminSessionResponse = {
  authenticated: boolean
  user: AdminUser | null
}

const SESSION_STATE_KEY = 'console-session'
const PENDING_STATE_KEY = 'console-auth-pending'
const READY_STATE_KEY = 'console-auth-ready'
const ERROR_STATE_KEY = 'console-auth-error'

/** Django allowlist requires a full URL (scheme + host), not a path like /console. */
export function resolveAdminReturnUrl(returnUrl?: string): string {
  const config = useRuntimeConfig()
  const siteOrigin = String(config.public.siteUrl || 'http://localhost:3000').replace(/\/$/, '')

  if (!returnUrl) {
    return import.meta.client ? window.location.href : `${siteOrigin}/console`
  }
  if (returnUrl.startsWith('/')) {
    const base = import.meta.client ? window.location.origin : siteOrigin
    return `${base.replace(/\/$/, '')}${returnUrl}`
  }
  return returnUrl
}

export function adminLoginUrl(returnUrl?: string): string {
  const config = useRuntimeConfig()
  const apiOrigin = config.public.apiOrigin.replace(/\/$/, '')
  const next = resolveAdminReturnUrl(returnUrl)
  return `${apiOrigin}/auth/login/?next=${encodeURIComponent(next)}`
}

function isStaffSession(session: AdminSessionResponse | null): boolean {
  return session?.authenticated === true && session.user?.is_staff === true
}

/**
 * Shared console session state (useState) + Django /auth/session/ (credentials: include).
 */
export function useAdminSession() {
  const session = useState<AdminSessionResponse | null>(SESSION_STATE_KEY, () => null)
  const pending = useState(PENDING_STATE_KEY, () => false)
  const ready = useState(READY_STATE_KEY, () => false)
  const error = useState<unknown>(ERROR_STATE_KEY, () => null)

  const api = useAdminApi()

  async function ensureSession(force = false): Promise<AdminSessionResponse | null> {
    if (!import.meta.client) {
      return null
    }
    if (!force && ready.value && session.value !== null) {
      return session.value
    }
    pending.value = true
    error.value = null
    try {
      session.value = await api.get<AdminSessionResponse>('/auth/session/')
      return session.value
    } catch (e) {
      error.value = e
      session.value = { authenticated: false, user: null }
      return session.value
    } finally {
      pending.value = false
      ready.value = true
    }
  }

  /** @deprecated Prefer ensureSession(); kept for explicit refresh after actions */
  async function refresh() {
    return ensureSession(true)
  }

  function clearSessionState() {
    session.value = null
    ready.value = false
    error.value = null
    pending.value = false
  }

  function login(returnUrl?: string) {
    if (import.meta.client) {
      window.location.href = adminLoginUrl(returnUrl)
    }
  }

  async function logout() {
    await api.post('/auth/logout/')
    clearAdminCsrfCache()
    clearSessionState()
    if (import.meta.client) {
      await navigateTo('/', { replace: true })
    }
  }

  const isAuthenticated = computed(() => isStaffSession(session.value))

  return {
    session,
    pending,
    ready,
    error,
    isAuthenticated,
    ensureSession,
    refresh,
    login,
    logout,
    clearSessionState,
  }
}
