<template>
    <div>
        <PageHeader page-title="Bills" page-subtitle="Proposed changes to the law before Parliament" />
        <UContainer class="my-8">
            <div class="prose prose-neutral dark:prose-invert max-w-none mb-8 space-y-4 text-default">
                <h2 class="text-xl font-semibold text-highlighted not-prose">About bills</h2>
                <p class="text-sm leading-relaxed">
                    Bills are proposed changes to the law, and must each pass through several stages in Parliament
                    before becoming law.
                </p>
                <p class="text-sm leading-relaxed">
                    Before any bill becomes law, there are three main votes it must pass: the first, second and third
                    readings. For most bills, there is a chance for members of the public to make submissions at the
                    select committee stage, which happens between the first and second readings.
                </p>
                <p class="text-sm leading-relaxed">
                    After a bill passes its third reading vote, it is granted Royal Assent by the Governor-General and
                    becomes law, subject to any commencement provisions contained within the bill.
                </p>
                <p class="text-sm leading-relaxed">
                    WhereTheyStand contains bills from the 51st Parliament and later (2014—present), imported from
                    Parliament’s website and linked with voting records and MPs’ profiles.
                </p>
                <p class="text-sm text-muted not-prose">
                    For less strict text search across the site, use
                    <ULink to="/search">search</ULink>.
                </p>
            </div>

            <UCard class="mb-8">
                <template #header>
                    <h2 class="text-lg font-semibold">Filter bills</h2>
                </template>
                <div class="space-y-8">
                    <UFormField label="Title must contain" description="Case-insensitive match on the bill title.">
                        <UInput
                            v-model="titleInput"
                            placeholder="e.g. electoral"
                            icon="i-lucide-search"
                            class="w-full max-w-md"
                            @blur="commitTitle"
                            @keydown.enter.prevent="commitTitle"
                        />
                    </UFormField>

                    <div>
                        <h3 class="text-sm font-semibold text-highlighted mb-2">Bill types</h3>
                        <p class="text-muted text-xs mb-3">
                            Bills may be any of the selected types (leave all unchecked to include every type).
                        </p>
                        <div class="flex flex-wrap gap-x-6 gap-y-2">
                            <UCheckbox
                                v-for="opt in billTypeOptions"
                                :key="opt.value"
                                :model-value="selectedTypes.includes(opt.value)"
                                :label="opt.label"
                                @update:model-value="(v) => typeof v === 'boolean' && toggleType(opt.value, v)"
                            />
                        </div>
                    </div>

                    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <UFormField label="Parliamentary term of introduction">
                            <USelect v-model="parliamentModel" :items="parliamentSelectItems" class="w-full" />
                        </UFormField>
                        <UFormField label="Voting method">
                            <USelect v-model="votingModel" :items="votingSelectItems" class="w-full" />
                        </UFormField>
                        <UFormField label="Order by">
                            <USelect v-model="orderingModel" :items="orderingSelectItems" class="w-full" />
                        </UFormField>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-highlighted mb-2">Procedural characteristics</h3>
                        <p class="text-muted text-xs mb-3">
                            When several options are selected, a bill must match all of them.
                        </p>
                        <div class="flex flex-col sm:flex-row flex-wrap gap-x-8 gap-y-2">
                            <UCheckbox v-model="urgencyModel" label="Urgency used" />
                            <UCheckbox v-model="extendedModel" label="Extended sittings used" />
                            <UCheckbox v-model="submissionsModel" label="Open for submissions" />
                        </div>
                    </div>

                    <USeparator />

                    <div class="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
                        <UFormField label="Results per page" class="w-full sm:w-40">
                            <USelect v-model="pageSizeModel" :items="pageSizeOptions" class="w-full" />
                        </UFormField>
                        <UCheckbox v-model="showDescriptions" label="Show bill descriptions" class="sm:mb-2" />
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <UButton color="primary" icon="i-lucide-check" @click="applyFilters">
                            Refine selection
                        </UButton>
                        <UButton variant="outline" color="neutral" @click="clearFilters">
                            Clear filters
                        </UButton>
                    </div>
                </div>
            </UCard>

            <div v-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading bills…</h3>
                    <UProgress animation="swing" />
                </div>
            </div>
            <UEmpty
                v-else-if="status === 'error'"
                title="Error loading bills"
                description="An error occurred while loading bills. Please try again."
            >
                <template #actions>
                    <UButton variant="subtle" color="neutral" class="mt-4" icon="i-lucide-refresh-cw" trailing @click="refresh()">
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
            <div v-else-if="paginated">
                <h2 class="text-lg font-semibold mb-2">Results</h2>
                <p class="text-muted text-sm mb-6">
                    {{ paginated.count }} result<span v-if="paginated.count !== 1">s</span>.
                </p>

                <div v-if="paginated.results.length === 0" class="text-muted py-8">
                    No bills match your filters.
                </div>
                <UCard v-else variant="subtle" id="bills-results">
                    <div class="space-y-2">
                        <div v-for="(item, i) in paginated.results" :key="item.id">
                            <UPageCard variant="ghost" :to="'/bills/' + item.id">
                                <template #body>
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h5>
                                                {{ item.name }}
                                            </h5>
                                        </div>
                                    </div>
                                    <p v-if="showDescriptions && item.description" class="text-sm text-muted">
                                        {{ item.description }}
                                    </p>
                                    <div class="space-x-2 mt-2">
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
                                </template>
                            </UPageCard>
                            <USeparator v-if="i < paginated.results.length - 1" class="my-4" />
                        </div>
                    </div>
                </UCard>

                <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center gap-2 flex-wrap">
                    <UButton
                        :disabled="page <= 1"
                        variant="outline"
                        size="sm"
                        icon="i-lucide-chevrons-left"
                        aria-label="First page"
                        @click="goPage(1)"
                    />
                    <UButton
                        :disabled="page <= 1"
                        variant="outline"
                        size="sm"
                        icon="i-lucide-chevron-left"
                        aria-label="Previous page"
                        @click="goPage(page - 1)"
                    />
                    <div class="flex items-center gap-1">
                        <template v-for="p in visiblePages" :key="String(p)">
                            <UButton
                                v-if="typeof p === 'number'"
                                :variant="p === page ? 'solid' : 'outline'"
                                :color="p === page ? 'primary' : 'neutral'"
                                size="sm"
                                :aria-current="p === page ? 'page' : undefined"
                                @click="goPage(p)"
                            >
                                {{ p }}
                            </UButton>
                            <span v-else class="px-2 text-muted">…</span>
                        </template>
                    </div>
                    <UButton
                        :disabled="page >= totalPages"
                        variant="outline"
                        size="sm"
                        icon="i-lucide-chevron-right"
                        aria-label="Next page"
                        @click="goPage(page + 1)"
                    />
                    <UButton
                        :disabled="page >= totalPages"
                        variant="outline"
                        size="sm"
                        icon="i-lucide-chevrons-right"
                        aria-label="Last page"
                        @click="goPage(totalPages)"
                    />
                </div>
                <p v-if="paginated.count > 0" class="text-muted text-sm mt-4 text-center">
                    Showing {{ resultStart }} to {{ resultEnd }} of {{ paginated.count }} bills
                </p>
            </div>
            <p v-if="error && status === 'error'" class="text-muted text-xs text-center mt-4">
                {{ error }}
            </p>
        </UContainer>
    </div>
</template>

<script setup lang="ts">
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

const fetchKey = computed(() => `bills-list-${JSON.stringify(route.query)}`)

const { data: paginated, status, error, refresh } = await useAsyncData<Paginated>(
    fetchKey,
    () => {
        const qs = queryToApiSearchParams(route.query).toString()
        return $fetch<Paginated>(`${apiBase}bills/?${qs}`)
    },
    { watch: [() => route.query], lazy: true },
)

type ParliamentRow = { id: string; number: number }

const { data: parliaments } = await useAsyncData<ParliamentRow[]>(
    'bills-parliaments',
    () => $fetch<ParliamentRow[]>(`${apiBase}parliaments/?number_gte=50`),
    { lazy: true },
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
const selectedTypes = ref<BillTypeCode[]>([])
const parliamentModel = ref<string | null>(null)
const votingModel = ref<string | null>(null)
const orderingModel = ref('-last_activity_date')
const urgencyModel = ref(false)
const extendedModel = ref(false)
const submissionsModel = ref(false)
const pageSizeModel = ref(25)
const showDescriptions = ref(true)

function syncFormFromRoute() {
    const q = route.query
    titleInput.value = typeof q.bills_search === 'string' ? q.bills_search : ''
    selectedTypes.value = parseTypesParam(q.bills_types)
    parliamentModel.value =
        q.bills_parliament !== undefined && q.bills_parliament !== null && String(q.bills_parliament) !== ''
            ? String(q.bills_parliament)
            : null
    const v = typeof q.bills_vote === 'string' ? q.bills_vote.trim() : ''
    votingModel.value = v === 'personal' || v === 'party' ? v : null
    orderingModel.value =
        typeof q.bills_order === 'string' && q.bills_order ? q.bills_order : '-last_activity_date'
    urgencyModel.value = parseBool(q.bills_urgency)
    extendedModel.value = parseBool(q.bills_extended)
    submissionsModel.value = parseBool(q.bills_submissions)
    pageSizeModel.value = parseIntParam(q.bills_page_size, 25)
    showDescriptions.value = !parseBool(q.bills_hide_desc)
}

watch(
    () => route.query,
    () => syncFormFromRoute(),
    { immediate: true },
)

function commitTitle() {
    /* title is applied via Refine or blur; route updated in applyFilters */
}

function toggleType(code: BillTypeCode, on: boolean) {
    const set = new Set(selectedTypes.value)
    if (on) set.add(code)
    else set.delete(code)
    selectedTypes.value = [...set]
}

function applyFilters() {
    const next: Record<string, string | string[]> = {}
    const s = titleInput.value.trim()
    if (s) next.bills_search = s

    if (selectedTypes.value.length > 0) {
        next.bills_types = selectedTypes.value.join(',')
    }

    if (parliamentModel.value !== null && parliamentModel.value !== '') {
        next.bills_parliament = parliamentModel.value
    }

    if (urgencyModel.value) next.bills_urgency = '1'
    if (extendedModel.value) next.bills_extended = '1'
    if (submissionsModel.value) next.bills_submissions = '1'

    if (votingModel.value === 'personal' || votingModel.value === 'party') next.bills_vote = votingModel.value

    if (orderingModel.value && orderingModel.value !== '-last_activity_date') {
        next.bills_order = orderingModel.value
    }

    if (pageSizeModel.value !== 25) {
        next.bills_page_size = String(pageSizeModel.value)
    }

    if (!showDescriptions.value) {
        next.bills_hide_desc = '1'
    }

    router.replace({ query: next })
}

function clearFilters() {
    titleInput.value = ''
    selectedTypes.value = []
    parliamentModel.value = null
    votingModel.value = null
    orderingModel.value = '-last_activity_date'
    urgencyModel.value = false
    extendedModel.value = false
    submissionsModel.value = false
    pageSizeModel.value = 25
    showDescriptions.value = true
    router.replace({ query: {} })
}

const page = computed(() => parseIntParam(route.query.bills_page, 1))

const pageSize = computed(() => parseIntParam(route.query.bills_page_size, 25))

const totalPages = computed(() => {
    const c = paginated.value?.count ?? 0
    const ps = pageSize.value
    return Math.max(1, Math.ceil(c / ps))
})

const resultStart = computed(() => {
    const c = paginated.value?.count ?? 0
    if (c === 0) return 0
    return (page.value - 1) * pageSize.value + 1
})

const resultEnd = computed(() => {
    const c = paginated.value?.count ?? 0
    return Math.min(page.value * pageSize.value, c)
})

const visiblePages = computed(() => {
    const total = totalPages.value
    const current = page.value
    const maxVisible = 7
    const pages: (number | string)[] = []
    if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) pages.push(i)
        return pages
    }
    pages.push(1)
    if (current <= 3) {
        for (let i = 2; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
    } else if (current >= total - 2) {
        pages.push('...')
        for (let i = total - 3; i <= total; i++) pages.push(i)
    } else {
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
    }
    return pages
})

function goPage(n: number) {
    const q = { ...route.query }
    if (n <= 1) {
        delete q.bills_page
    } else {
        q.bills_page = String(n)
    }
    router.replace({ query: q })
}

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
