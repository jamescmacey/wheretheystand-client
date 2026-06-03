import type { LocationQueryRaw } from 'vue-router'

/**
 * Build a crawlable path+query href for a pagination target page.
 * Client navigation should use @click.prevent on the link/button so SPA behavior is unchanged.
 */
export function usePaginationPageHref(
    pageParam: string,
    getQueryForPage?: (targetPage: number) => LocationQueryRaw,
) {
    const route = useRoute()
    const router = useRouter()

    function pageHref(targetPage: number): string {
        const query = getQueryForPage
            ? getQueryForPage(targetPage)
            : (() => {
                  const next: LocationQueryRaw = { ...route.query }
                  if (targetPage <= 1) {
                      delete next[pageParam]
                  } else {
                      next[pageParam] = String(targetPage)
                  }
                  return next
              })()

        return router.resolve({ path: route.path, query }).href
    }

    return { pageHref }
}
