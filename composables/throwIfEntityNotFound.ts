import type { NuxtError } from '#app'

function isNotFoundError(error: NuxtError | null | undefined): boolean {
    if (!error) return false
    const code = error.statusCode ?? (error as { status?: number }).status
    return code === 404
}

/**
 * Throw a fatal 404 (error.vue) when the entity detail API returned not found.
 */
export function throwIfEntityNotFound(
    error: MaybeRef<NuxtError | null | undefined>,
    path: string,
): void {
    if (!isNotFoundError(toValue(error))) return

    throw createError({
        statusCode: 404,
        statusMessage: `Page not found: ${path}`,
        fatal: true,
    })
}
