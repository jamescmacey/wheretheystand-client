<template>
    <div>
        <PageHeader page-title="Bills" page-subtitle="Proposed changes to the law before Parliament" />
        <UContainer class="my-8">
            <h2 class="text-2xl font-bold mb-4">About bills</h2>
            <div class="space-y-4 mb-4">
                
                <p>
                    Bills are proposed changes to the law, and must each pass through several stages in Parliament
                    before becoming law.
                </p>
                <p>
                    Before any bill becomes law, there are three main votes it must pass: the first, second and third
                    readings. For most bills, there is a chance for members of the public to make submissions at the
                    select committee stage, which happens between the first and second readings.
                </p>
                <p>
                    After a bill passes its third reading vote, it is granted Royal Assent by the Governor-General and
                    becomes law, subject to any commencement provisions contained within the bill.
                </p>
                <p>
                    WhereTheyStand contains bills from the 51st Parliament and later (2014—present), imported from
                    Parliament’s website and linked with voting records and MPs’ profiles.
                </p>
                <p>
                    For less strict text search across the site, use
                    <ULink to="/search">search</ULink>.
                </p>
            </div>

            <div class="flex flex-col md:flex-row md:items-stretch gap-4">
                <div class="md:w-1/3 shrink-0">
                    <UCard variant="soft" class="h-fit w-full">
                        <h3 class="text-lg font-semibold">Find a bill</h3>
                        <p class="text-sm leading-relaxed mb-4">
                            For less strict text search across the site, use
                            <ULink to="/search" class="text-primary hover:underline">search</ULink>.
                        </p>
                        <USeparator class="my-4" />
                        <UForm class="space-y-4">
                            <UFormField label="Title must contain" description="Case-insensitive match on the bill title.">
                                <UInput
                                    v-model="titleInput"
                                    placeholder="e.g. electoral"
                                    icon="i-lucide-search"
                                    size="sm"
                                    class="w-full"
                                    variant="subtle"
                                />
                            </UFormField>

                            <div>
                                <p class="text-sm font-medium text-highlighted mb-1">Bill types</p>
                                <p class="text-muted text-xs mb-2">
                                    Leave all unchecked to include every type.
                                </p>
                                <div class="flex flex-col gap-2">
                                    <UCheckbox
                                        v-for="opt in billTypeOptions"
                                        :key="opt.value"
                                        :model-value="selectedTypes.includes(opt.value)"
                                        :label="opt.label"
                                        @update:model-value="(v) => typeof v === 'boolean' && toggleType(opt.value, v)"
                                    />
                                </div>
                            </div>

                            <UFormField label="Parliamentary term of introduction">
                                <USelect
                                    v-model="parliamentModel"
                                    :items="parliamentSelectItems"
                                    size="sm"
                                    class="w-full"
                                    variant="subtle"
                                />
                            </UFormField>
                            <UFormField label="Voting method">
                                <USelect
                                    v-model="votingModel"
                                    :items="votingSelectItems"
                                    size="sm"
                                    class="w-full"
                                    variant="subtle"
                                />
                            </UFormField>

                            <div>
                                <p class="text-sm font-medium text-highlighted mb-1">Procedural characteristics</p>
                                <p class="text-muted text-xs mb-2">
                                    When several are selected, a bill must match all of them.
                                </p>
                                <div class="flex flex-col gap-2">
                                    <UCheckbox v-model="urgencyModel" label="Urgency used" />
                                    <UCheckbox v-model="extendedModel" label="Extended sittings used" />
                                    <UCheckbox v-model="submissionsModel" label="Open for submissions" />
                                </div>
                            </div>

                            <UCheckbox v-model="showDescriptions" label="Show bill descriptions" />
                        </UForm>
                    </UCard>
                </div>

                <div class="md:flex-1 min-w-0 flex flex-col">
                    <UCard variant="soft" class="w-full flex-1 flex flex-col md:min-h-full">
                        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <h3 class="text-lg font-semibold">{{ resultsHeading }}</h3>
                            <div class="flex flex-col gap-2 sm:flex-row sm:items-center md:shrink-0">
                                <USelect
                                    v-model="pageSizeModel"
                                    :items="pageSizeOptions"
                                    size="sm"
                                    class="w-full sm:w-48"
                                    variant="subtle"
                                />
                                <USelect
                                    v-model="orderingModel"
                                    :items="orderingSelectItems"
                                    size="sm"
                                    class="w-full sm:w-48"
                                    variant="subtle"
                                />
                            </div>
                        </div>
                        <USeparator class="my-4" />

                        <div v-if="status === 'pending'" class="py-12 flex flex-col items-center justify-center text-center">
                            <h4 class="mb-2 text-muted">Loading bills…</h4>
                            <UProgress animation="swing" class="w-48" />
                        </div>
                        <UEmpty
                            v-else-if="status === 'error'"
                            title="Error loading bills"
                            description="An error occurred while loading bills. Please try again."
                        >
                            <template #actions>
                                <UButton
                                    variant="subtle"
                                    color="neutral"
                                    class="mt-4"
                                    icon="i-lucide-refresh-cw"
                                    trailing
                                    @click="refresh()"
                                >
                                    Refresh
                                </UButton>
                            </template>
                        </UEmpty>
                        <template v-else-if="paginated">
                            <p class="text-muted text-sm mb-4">
                                {{ paginated.count }} result<span v-if="paginated.count !== 1">s</span>.
                            </p>
                            <UEmpty
                                v-if="paginated.results.length === 0"
                                class="text-muted py-8"
                                variant="naked"
                                title="No bills match your filters"
                                icon="i-lucide-search"
                            />
                            <div v-else class="space-y-3">
                                <UPageCard
                                    v-for="item in paginated.results"
                                    :key="item.id"
                                    variant="outline"
                                    :to="'/bills/' + item.id"
                                >
                                    <h4 class="font-semibold">{{ item.name }}</h4>
                                    <p v-if="showDescriptions && item.description" class="text-sm text-muted mt-2">
                                        {{ item.description }}
                                    </p>
                                    <div class="flex flex-wrap gap-2 mt-2">
                                        <UBadge v-if="item.last_activity_date" variant="outline">
                                            Last activity {{ formatRelative(item.last_activity_date) }}
                                        </UBadge>
                                        <UBadge
                                            v-if="item.status"
                                            variant="outline"
                                            :color="statusBadgeColor(item.status)"
                                        >
                                            {{ billStatuses[item.status]?.description ?? item.status }}
                                        </UBadge>
                                        <span v-if="item.bill_type" class="text-sm text-muted">
                                            {{ billTypes[item.bill_type]?.description ?? item.bill_type }}
                                        </span>
                                    </div>
                                </UPageCard>
                            </div>
                            <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center gap-2">
                                <WContentPaginationButton
                                    :to="billsPageHref(page - 1)"
                                    :disabled="page <= 1"
                                    icon="i-lucide-chevron-left"
                                    aria-label="Previous page"
                                    rel="prev"
                                    @navigate="goPage(page - 1)"
                                />
                                <span class="text-sm text-muted px-2">Page {{ page }} of {{ totalPages }}</span>
                                <WContentPaginationButton
                                    :to="billsPageHref(page + 1)"
                                    :disabled="page >= totalPages"
                                    icon="i-lucide-chevron-right"
                                    trailing
                                    aria-label="Next page"
                                    rel="next"
                                    @navigate="goPage(page + 1)"
                                />
                            </div>
                        </template>
                    </UCard>
                </div>
            </div>
        </UContainer>
    </div>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()
const router = useRouter()

const billStatuses = computed(
    () => (config.public.valueKeys?.billStatuses ?? {}) as Record<string, { description?: string; colour?: string }>,
)
const billTypes = computed(
    () => (config.public.valueKeys?.billTypes ?? {}) as Record<string, { description?: string }>,
)

type BillRow = {
    id: string
    name: string
    description?: string | null
    bill_type?: string | null
    status?: string | null
    last_activity_date?: string | null
}

type Paginated = {
    count: number
    next: string | null
    previous: string | null
    results: BillRow[]
}

const VALID_TYPES = ['government', 'members', 'private', 'local'] as const
type BillTypeCode = (typeof VALID_TYPES)[number]

const billTypeOptions: { value: BillTypeCode; label: string }[] = [
    { value: 'government', label: 'Government bills' },
    { value: 'members', label: "Members' bills" },
    { value: 'local', label: 'Local bills' },
    { value: 'private', label: 'Private bills' },
]

const orderingSelectItems = [
    { value: '-last_activity_date', label: 'Date modified (newest first)' },
    { value: 'last_activity_date', label: 'Date modified (oldest first)' },
    { value: '-introduction_date', label: 'Introduction date (newest first)' },
    { value: 'introduction_date', label: 'Introduction date (oldest first)' },
    { value: '-progress_stage', label: 'Status (later stages first)' },
    { value: 'progress_stage', label: 'Status (early stages first)' },
]

const votingSelectItems = [
    { value: null, label: 'Any' },
    { value: 'personal', label: 'Personal voting used' },
    { value: 'party', label: 'Party voting used' },
]

const pageSizeOptions = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
]

const DEFAULT_PAGE_SIZE = 25
const DEFAULT_ORDER = '-last_activity_date'

function parseTypesParam(raw: unknown): BillTypeCode[] {
    if (raw === undefined || raw === null || raw === '') return []
    const s = Array.isArray(raw) ? raw.join(',') : String(raw)
    return s
        .split(',')
        .map((t) => t.trim())
        .filter((t): t is BillTypeCode => VALID_TYPES.includes(t as BillTypeCode))
}

function parseBool(raw: unknown): boolean {
    if (raw === undefined || raw === null || raw === '') return false
    const s = String(raw).toLowerCase()
    return s === '1' || s === 'true' || s === 'yes'
}

function parseIntParam(raw: unknown, fallback: number): number {
    const n = parseInt(String(raw ?? ''), 10)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Build API query from route.query (bills_* keys). */
function queryToApiSearchParams(q: typeof route.query): URLSearchParams {
    const p = new URLSearchParams()
    const page = parseIntParam(q.bills_page, 1)
    const pageSize = parseIntParam(q.bills_page_size, 25)
    p.set('page', String(page))
    p.set('page_size', String(pageSize))

    const search = typeof q.bills_search === 'string' ? q.bills_search.trim() : ''
    if (search) p.set('search', search)

    const types = parseTypesParam(q.bills_types)
    types.forEach((t) => p.append('bill_types', t))

    const parliament = q.bills_parliament
    if (parliament !== undefined && parliament !== null && String(parliament) !== '') {
        p.set('parliament', String(parliament))
    }

    if (parseBool(q.bills_urgency)) p.set('urgency_used', 'true')
    if (parseBool(q.bills_extended)) p.set('extended_sittings_used', 'true')
    if (parseBool(q.bills_submissions)) p.set('open_submissions', 'true')

    const vote = typeof q.bills_vote === 'string' ? q.bills_vote.trim() : ''
    if (vote === 'personal' || vote === 'party') p.set('voting_methods', vote)

    const ordering = typeof q.bills_order === 'string' ? q.bills_order : '-last_activity_date'
    if (ordering) p.set('ordering', ordering)

    return p
}

usePageSeo({
    title: 'Bills',
    description: 'Proposed changes to the law before Parliament.',
})

const fetchKey = computed(() => `bills-list-${JSON.stringify(route.query)}`)

const { data: paginated, status, error, refresh } = await useAsyncData<Paginated>(
    fetchKey,
    () => {
        const qs = queryToApiSearchParams(route.query).toString()
        return $fetch<Paginated>(`${apiBase}bills/?${qs}`)
    },
    { watch: [() => route.query] },
)

type ParliamentRow = { id: string; number: number }

const { data: parliaments } = await useAsyncData<ParliamentRow[]>(
    'bills-parliaments',
    () => $fetch<ParliamentRow[]>(`${apiBase}parliaments/?number_gte=50`),
)

const parliamentSelectItems = computed(() => {
    const rows = (parliaments.value ?? []).slice().sort((a, b) => b.number - a.number)
    const items: { value: string | null; label: string }[] = [{ value: null, label: 'Any' }]
    for (const pr of rows) {
        items.push({
            value: String(pr.number),
            label: `${ordinal(pr.number)} Parliament`,
        })
    }
    return items
})

function ordinal(n: number): string {
    const j = n % 10
    const k = n % 100
    if (k >= 11 && k <= 13) return `${n}th`
    if (j === 1) return `${n}st`
    if (j === 2) return `${n}nd`
    if (j === 3) return `${n}rd`
    return `${n}th`
}

// --- Form state (synced from route on navigation) ---
const titleInput = ref('')
const titleDebounced = ref('')
watchDebounced(titleInput, (v) => { titleDebounced.value = v }, { debounce: 600 })

const selectedTypes = ref<BillTypeCode[]>([])
const parliamentModel = ref<string | null>(null)
const votingModel = ref<string | null>(null)
const orderingModel = ref(DEFAULT_ORDER)
const urgencyModel = ref(false)
const extendedModel = ref(false)
const submissionsModel = ref(false)
const pageSizeModel = ref(DEFAULT_PAGE_SIZE)
const showDescriptions = ref(true)

function normalizeBillsQuery(q: typeof route.query): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [key, val] of Object.entries(q)) {
        if (!key.startsWith('bills_') || val === undefined || val === null || val === '') continue
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

function filtersToRouteQuery(resetPage = false): Record<string, string> {
    const next: Record<string, string> = {}

    const search = titleDebounced.value.trim()
    if (search) next.bills_search = search

    if (selectedTypes.value.length > 0) {
        next.bills_types = selectedTypes.value.join(',')
    }

    if (parliamentModel.value !== null && parliamentModel.value !== '') {
        next.bills_parliament = parliamentModel.value
    }

    if (urgencyModel.value) next.bills_urgency = '1'
    if (extendedModel.value) next.bills_extended = '1'
    if (submissionsModel.value) next.bills_submissions = '1'

    if (votingModel.value === 'personal' || votingModel.value === 'party') {
        next.bills_vote = votingModel.value
    }

    if (orderingModel.value !== DEFAULT_ORDER) {
        next.bills_order = orderingModel.value
    }

    if (pageSizeModel.value !== DEFAULT_PAGE_SIZE) {
        next.bills_page_size = String(pageSizeModel.value)
    }

    if (!showDescriptions.value) {
        next.bills_hide_desc = '1'
    }

    if (!resetPage) {
        const currentPage = parseIntParam(route.query.bills_page, 1)
        if (currentPage > 1) next.bills_page = String(currentPage)
    }

    return next
}

function syncFormFromRoute() {
    const q = route.query
    const search = typeof q.bills_search === 'string' ? q.bills_search : ''
    titleInput.value = search
    titleDebounced.value = search
    selectedTypes.value = parseTypesParam(q.bills_types)
    parliamentModel.value =
        q.bills_parliament !== undefined && q.bills_parliament !== null && String(q.bills_parliament) !== ''
            ? String(q.bills_parliament)
            : null
    const v = typeof q.bills_vote === 'string' ? q.bills_vote.trim() : ''
    votingModel.value = v === 'personal' || v === 'party' ? v : null
    orderingModel.value =
        typeof q.bills_order === 'string' && q.bills_order ? q.bills_order : DEFAULT_ORDER
    urgencyModel.value = parseBool(q.bills_urgency)
    extendedModel.value = parseBool(q.bills_extended)
    submissionsModel.value = parseBool(q.bills_submissions)
    pageSizeModel.value = parseIntParam(q.bills_page_size, DEFAULT_PAGE_SIZE)
    showDescriptions.value = !parseBool(q.bills_hide_desc)
}

let syncingFromRoute = false

function pushFiltersToRoute(resetPage = false) {
    if (syncingFromRoute) return
    const next = filtersToRouteQuery(resetPage)
    const current = normalizeBillsQuery(route.query)
    if (queriesMatch(next, current)) return
    router.replace({ query: next })
}

function toggleType(code: BillTypeCode, on: boolean) {
    const set = new Set(selectedTypes.value)
    if (on) set.add(code)
    else set.delete(code)
    selectedTypes.value = [...set]
}

function hasRefiningFiltersInQuery(q: typeof route.query): boolean {
    const search = typeof q.bills_search === 'string' ? q.bills_search.trim() : ''
    if (search) return true
    if (parseTypesParam(q.bills_types).length > 0) return true
    if (q.bills_parliament !== undefined && q.bills_parliament !== null && String(q.bills_parliament) !== '') {
        return true
    }
    if (parseBool(q.bills_urgency)) return true
    if (parseBool(q.bills_extended)) return true
    if (parseBool(q.bills_submissions)) return true
    const vote = typeof q.bills_vote === 'string' ? q.bills_vote.trim() : ''
    if (vote === 'personal' || vote === 'party') return true
    return false
}

const resultsHeading = computed(() =>
    hasRefiningFiltersInQuery(route.query) ? 'Results' : 'All bills',
)

const page = computed(() => parseIntParam(route.query.bills_page, 1))
const pageSize = computed(() => parseIntParam(route.query.bills_page_size, DEFAULT_PAGE_SIZE))

const totalPages = computed(() => {
    const c = paginated.value?.count ?? 0
    return Math.max(1, Math.ceil(c / pageSize.value))
})

function billsPageQuery(n: number): Record<string, string> {
    const next = filtersToRouteQuery(false)
    if (n <= 1) delete next.bills_page
    else next.bills_page = String(n)
    return next
}

const { pageHref: billsPageHref } = usePaginationPageHref('bills_page', (n) => billsPageQuery(n))

function goPage(n: number) {
    const next = billsPageQuery(n)
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

watch(titleDebounced, () => pushFiltersToRoute(true))

watch(
    [selectedTypes, parliamentModel, votingModel, urgencyModel, extendedModel, submissionsModel, showDescriptions],
    () => pushFiltersToRoute(true),
    { deep: true },
)

watch([orderingModel, pageSizeModel], () => pushFiltersToRoute(true))

/** Same relative wording as `pages/people/[id]/bills.vue`. */
function formatRelative(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const monthsApprox = Math.floor(days / 30)

    if (seconds < 60) {
        return 'just now'
    }
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    }
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    }
    if (days < 30) {
        return `${days} day${days !== 1 ? 's' : ''} ago`
    }
    if (days < 180) {
        if (monthsApprox === 1) {
            return 'last month'
        }
        return `${monthsApprox} months ago`
    }
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

function statusBadgeColor(status: string): 'error' | 'success' | 'warning' | 'info' | 'primary' | 'neutral' {
    const c = billStatuses.value[status]?.colour
    if (c === 'error' || c === 'success' || c === 'warning' || c === 'info' || c === 'primary' || c === 'neutral') {
        return c
    }
    return 'neutral'
}
</script>
