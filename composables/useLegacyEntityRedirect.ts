export type LegacyMigratableEntity = 'bills' | 'votes'

export function isLegacyIntegerId(id: string | string[] | undefined): boolean {
    if (!id || Array.isArray(id)) return false
    return /^\d+$/.test(id) && Number(id) >= 1
}

/**
 * Look up v2 UUID for a v1 legacy integer id. Returns the redirect path or null.
 */
export async function resolveLegacyEntityRedirectPath(
    entity: LegacyMigratableEntity,
    routeId: string,
    fullPath: string,
): Promise<string | null> {
    if (!isLegacyIntegerId(routeId)) return null

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    try {
        const res = await $fetch<{ id: string }>(
            `${apiBase}migration/${entity}/${routeId}/`,
        )
        if (!res?.id) return null

        const prefix = `/${entity}/${routeId}`
        return fullPath.startsWith(prefix)
            ? fullPath.replace(prefix, `/${entity}/${res.id}`)
            : `/${entity}/${res.id}`
    } catch {
        return null
    }
}
