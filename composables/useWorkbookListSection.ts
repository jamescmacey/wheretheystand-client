import { watchDebounced } from '@vueuse/core'
import type { PaginatedWorkbooks, WorkbookSummary } from '~/types/workbook'

const PAGE_SIZE = 5

function parsePageParam(raw: unknown): number {
  const n = parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

function normalizeSectionQuery(
  q: Record<string, unknown>,
  prefix: string,
): Record<string, string> {
  const out: Record<string, string> = {}
  const searchKey = `${prefix}_search`
  const pageKey = `${prefix}_page`
  for (const key of [searchKey, pageKey]) {
    const val = q[key]
    if (val === undefined || val === null || val === '') continue
    out[key] = Array.isArray(val) ? val.join(',') : String(val)
  }
  return out
}

function queriesMatch(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

export function useWorkbookListSection(options: {
  queryPrefix: string
  scope: 'mine' | 'system'
}) {
  const { queryPrefix, scope } = options
  const route = useRoute()
  const router = useRouter()
  const api = useAdminApi()

  const searchKey = `${queryPrefix}_search`
  const pageKey = `${queryPrefix}_page`

  const nameFilter = ref('')
  const nameDebounced = ref('')
  watchDebounced(nameFilter, (v) => { nameDebounced.value = v }, { debounce: 600 })

  let syncingFromRoute = false

  function filtersToRouteQuery(resetPage = false): Record<string, string> {
    const next: Record<string, string> = {}
    const search = nameDebounced.value.trim()
    if (search) next[searchKey] = search
    if (!resetPage) {
      const currentPage = parsePageParam(route.query[pageKey])
      if (currentPage > 1) next[pageKey] = String(currentPage)
    }
    return next
  }

  function syncFormFromRoute() {
    const search =
      typeof route.query[searchKey] === 'string' ? route.query[searchKey] : ''
    nameFilter.value = search
    nameDebounced.value = search
  }

  function queryToApiSearchParams(q: typeof route.query): URLSearchParams {
    const p = new URLSearchParams()
    p.set('scope', scope)
    p.set('page', String(parsePageParam(q[pageKey])))
    p.set('page_size', String(PAGE_SIZE))
    p.set('ordering', '-updated_at')

    const search = typeof q[searchKey] === 'string' ? q[searchKey].trim() : ''
    if (search) p.set('search', search)

    return p
  }

  function pushFiltersToRoute(resetPage = false) {
    if (syncingFromRoute) return
    const otherPrefix = queryPrefix === 'mine' ? 'system' : 'mine'
    const prefixed = filtersToRouteQuery(resetPage)
    const next = { ...normalizeSectionQuery(route.query, otherPrefix), ...prefixed }
    const current = {
      ...normalizeSectionQuery(route.query, queryPrefix),
      ...normalizeSectionQuery(route.query, otherPrefix),
    }
    if (queriesMatch(next, current)) return
    router.replace({ query: next })
  }

  const fetchKey = computed(
    () => `workbooks-${scope}-${JSON.stringify(route.query)}`,
  )

  const { data: paginated, status, refresh } = useAsyncData<PaginatedWorkbooks>(
    fetchKey,
    () => {
      const qs = queryToApiSearchParams(route.query).toString()
      return api.get<PaginatedWorkbooks>(`v2/workbooks/?${qs}`)
    },
    { watch: [() => route.query], lazy: true, server: false },
  )

  const page = computed(() => parsePageParam(route.query[pageKey]))
  const totalPages = computed(() => {
    const c = paginated.value?.count ?? 0
    return Math.max(1, Math.ceil(c / PAGE_SIZE))
  })

  const hasSearch = computed(() => {
    const search =
      typeof route.query[searchKey] === 'string'
        ? route.query[searchKey].trim()
        : ''
    return search.length > 0
  })

  function goPage(n: number) {
    const otherPrefix = queryPrefix === 'mine' ? 'system' : 'mine'
    const other = normalizeSectionQuery(route.query, otherPrefix)
    const next = { ...other, ...filtersToRouteQuery(false) }
    if (n <= 1) delete next[pageKey]
    else next[pageKey] = String(n)
    syncingFromRoute = true
    router.replace({ query: next })
    nextTick(() => {
      syncingFromRoute = false
    })
  }

  watch(
    () => route.query,
    () => {
      syncingFromRoute = true
      syncFormFromRoute()
      nextTick(() => {
        syncingFromRoute = false
      })
    },
    { immediate: true },
  )

  watch(nameDebounced, () => pushFiltersToRoute(true))

  return {
    nameFilter,
    paginated,
    status,
    refresh,
    page,
    totalPages,
    hasSearch,
    goPage,
  }
}

export async function fetchRecentWorkbooks(limit = 5) {
  const params = new URLSearchParams({
    page_size: String(limit),
    ordering: '-updated_at',
  })
  return useAdminApi().get<PaginatedWorkbooks>(`v2/workbooks/?${params}`)
}

export async function claimWorkbook(workbookId: string, userId: string) {
  return useAdminApi().patch<WorkbookSummary>(
    `v2/workbooks/${workbookId}/`,
    { user: userId },
  )
}
