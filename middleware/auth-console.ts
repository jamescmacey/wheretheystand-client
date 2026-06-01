function isStaffSession(session: AdminSessionResponse | null): boolean {
  return session?.authenticated === true && session.user?.is_staff === true
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/console')) {
    return
  }

  // Session cookie is on the API host; only check from the browser.
  if (import.meta.server) {
    return
  }

  const { ensureSession } = useAdminSession()
  const session = await ensureSession()

  if (!isStaffSession(session)) {
    return navigateTo(adminLoginUrl(to.fullPath), { external: true })
  }
})
