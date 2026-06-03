import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

export const DEFAULT_SITE_DESCRIPTION =
    "WhereTheyStand aggregates and links information about Members of Parliament and political parties."

export type PageSeoOptions = {
    title: MaybeRefOrGetter<string | null | undefined>
    description?: MaybeRefOrGetter<string | null | undefined>
    image?: MaybeRefOrGetter<string | null | undefined>
    imageAlt?: MaybeRefOrGetter<string | null | undefined>
}

function trimDescription(value: string | null | undefined, max = 160): string | undefined {
    if (!value?.trim()) return undefined
    const normalized = value.trim().replace(/\s+/g, ' ')
    if (normalized.length <= max) return normalized
    return `${normalized.slice(0, max - 1).trimEnd()}…`
}

/** Sets document title (via app titleTemplate) and aligned Open Graph / Twitter meta. */
export function usePageSeo(options: PageSeoOptions) {
    const title = computed(() => {
        const value = toValue(options.title)
        return value?.trim() || undefined
    })

    const description = computed(
        () => trimDescription(toValue(options.description)) ?? DEFAULT_SITE_DESCRIPTION,
    )

    const ogImage = computed(() => {
        const value = toValue(options.image)
        return value?.trim() || undefined
    })

    const ogImageAlt = computed(() => {
        const value = toValue(options.imageAlt)
        return value?.trim() || title.value
    })

    const twitterCard = computed(() => (ogImage.value ? 'summary_large_image' : 'summary'))

    useSeoMeta({
        title,
        description,
        ogTitle: title,
        ogDescription: description,
        twitterTitle: title,
        twitterDescription: description,
        twitterCard,
        ogImage,
        twitterImage: ogImage,
        ogImageAlt,
        twitterImageAlt: ogImageAlt,
    })
}

const PERSON_TAB_TITLES: Record<string, string> = {
    details: 'Details',
    bills: 'Bills',
    votes: 'Votes',
    interests: 'Interests',
    expenses: 'Expenses',
    elections: 'Electoral history',
}

/** Tab segment title for /people/:slug/* child routes, or null on the overview. */
export function personTabSeoTitle(personPath: string, personSlug: string): string | null {
    const prefix = `/people/${personSlug}`
    if (!personPath.startsWith(prefix)) return null
    const suffix = personPath.slice(prefix.length).replace(/^\//, '')
    if (!suffix) return null
    return PERSON_TAB_TITLES[suffix] ?? null
}
