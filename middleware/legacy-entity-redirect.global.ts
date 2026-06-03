function legacyEntityFromPath(path: string): LegacyMigratableEntity | null {
    if (path.startsWith('/bills/')) return 'bills'
    if (path.startsWith('/votes/')) return 'votes'
    return null
}

/**
 * Runs before route resolution / page render. On SSR, responds with HTTP 301
 * when a v1 numeric id maps to a v2 UUID (no legacy page HTML is sent).
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const entity = legacyEntityFromPath(to.path)
    if (!entity) return

    const routeId = String(to.params.id ?? '')
    if (!isLegacyIntegerId(routeId)) return

    const newPath = await resolveLegacyEntityRedirectPath(entity, routeId, to.fullPath)
    if (!newPath) return

    return navigateTo(newPath, { redirectCode: 301 })
})
