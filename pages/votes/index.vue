<template>
    <div>
        <PageHeader pageTitle="Votes"></PageHeader>
        <UContainer class="my-8">


            <h2 class="text-2xl font-bold mb-4">Parliament must vote on a bill at least
                three times before it becomes law.</h2>
            <div class="space-y-4 mb-4">
                <UAlert color="warning" icon="i-lucide-alert-circle">
                    <template #title>Updates paused</template>
                    <template #description>
                        New votes are currently not being added to WhereTheyStand because the underlying data source has changed.  Work is underway to fix this.
                    </template>
                </UAlert>
                <p>
                    A <ULink to="/bills">bill</ULink> must have three "readings" in the House of Representatives
                    before enactment. These are called the first reading, second reading, and third reading. Each
                    reading is voted on and succeeds if more members of Parliament vote in favour than against.
                </p>

                <div>
                    <p>There are four types of vote:</p>
                    <ul class="list-disc ml-4 mt-2">
                        <li><span class="font-semibold">Voice votes</span> are the simplest type of vote. Members of
                            Parliament shout "aye" or "no" and the Speaker makes an assessment based on how loud each
                            side
                            is. Any member can then call for a more formal vote.</li>
                        <li><span class="font-semibold">Party votes</span> are the most common type of recorded vote.
                            Each
                            party has a number of seats in the House and casts that number of votes (minus any absences)
                            according to its party policy.</li>
                        <li><span class="font-semibold">Personal votes</span> are also called <span
                                class="font-semibold">conscience votes</span>. Each member of Parliament decides how to
                            vote
                            on the bill, independent of any party policy.</li>
                        <li><span class="font-semibold">Split party votes</span> are similar to a party vote, except one
                            or
                            more parties may treat the vote as a personal vote while other parties may treat it as a
                            party
                            vote. If a party splits its party vote across more than one position (yes, no or abstain) it
                            must give notice of which members' votes are being allocated to each position.</li>
                    </ul>
                </div>
                <p>
                    Other votes may take place during the Committee of the Whole House stage. These votes are on
                    individual amendments to a bill. WhereTheyStand does not currently record these votes.
                </p>
                <p>
                    If a bill passes all three readings it is given Royal Assent by the Governor-General. It then
                    becomes law, although most bills specify in more detail when its provisions come into effect.
                </p>

            </div>

            <div class="flex flex-col md:flex-row md:items-stretch gap-4">
                <div class="md:w-1/3 shrink-0">
                <UCard variant="soft" class="h-fit w-full">
                    <h3 class="text-lg font-semibold">Find a vote</h3>
                    <p class="text-sm leading-relaxed mb-4">
                        If you're looking for a specific bill, check the <NuxtLink class="text-primary hover:underline"
                            to="/bills">bills</NuxtLink> page.
                    </p>
                    <USeparator class="my-4" />
                    <UForm class="space-y-4">

                        <UFormField label="Title must contain" description="Case-insensitive match on the bill title.">
                            <UInput v-model="titleFilter" placeholder="e.g. electoral" icon="i-lucide-search" size="sm"
                                class="w-full" variant="subtle" />

                        </UFormField>
                        <UFormField label="Date range" description="Show votes from this date range.">
                            <div class="flex items-center gap-2">
                                <UPopover :content="{ align: 'center' }">
                                    <UButton color="neutral" variant="subtle" icon="i-lucide-calendar" size="sm">
                                        {{ label }}
                                    </UButton>

                                    <template #content>
                                        <div class="flex items-stretch divide-x divide-(--ui-border)">
                                            <div class="hidden sm:flex flex-col justify-center py-2">
                                                <UButton v-for="(range, index) in ranges" :key="index"
                                                    :label="range.label" color="neutral" variant="ghost"
                                                    class="rounded-none px-4"
                                                    :class="[isRangeSelected(range) ? 'bg-elevated' : 'hover:bg-elevated/50']"
                                                    truncate @click="selectRange(range)" />
                                            </div>

                                            <UCalendar v-model="modelValue" class="p-2"
                                                :number-of-months="isDesktop ? 2 : 1" range />
                                        </div>
                                    </template>
                                </UPopover>
                                <UButton color="neutral" v-if="modelValue.start" variant="ghost" icon="i-lucide-x"
                                    size="sm" @click="clearDateRange">
                                    Clear
                                </UButton>
                            </div>
                        </UFormField>
                        <UCheckboxGroup v-model="voteType" :items="voteTypeOptions" legend="Vote type" />
                        <UCheckboxGroup v-model="billType" :items="billTypeOptions" legend="Bill type" />
                        <UFormField label="Vote result" description="The result of the vote to search for."
                            class="w-full">
                            <USelect size="sm" v-model="voteResult" :items="voteResultOptions" variant="subtle"
                                class="w-48" />
                        </UFormField>
                    </UForm>


                </UCard>
                </div>

                <div class="md:flex-1 min-w-0 flex flex-col">
                <UCard variant="soft" class="w-full flex-1 flex flex-col md:min-h-full">
                    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <h3 class="text-lg font-semibold">{{ resultsHeading }}</h3>
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-center md:shrink-0">
                            <USelect v-model="resultsPerPage" :items="resultsPerPageOptions" size="sm"
                                class="w-full sm:w-48" variant="subtle" />
                            <USelect v-model="orderBy" :items="orderByOptions" size="sm" class="w-full sm:w-48"
                                variant="subtle" />
                        </div>
                    </div>
                    <USeparator class="my-4" />

                    <div v-if="status === 'pending'" class="py-12 flex flex-col items-center justify-center text-center">
                        <h4 class="mb-2 text-muted">Loading votes…</h4>
                        <UProgress animation="swing" class="w-48" />
                    </div>
                    <UEmpty
                        v-else-if="status === 'error'"
                        title="Error loading votes"
                        description="An error occurred while loading votes. Please try again."
                    >
                        <template #actions>
                            <UButton variant="subtle" color="neutral" class="mt-4" icon="i-lucide-refresh-cw"
                                trailing @click="refresh()">
                                Refresh
                            </UButton>
                        </template>
                    </UEmpty>
                    <template v-else-if="paginated">
                        <p class="text-muted text-sm mb-4">
                            {{ paginated.count }} result<span v-if="paginated.count !== 1">s</span>.
                        </p>
                        <UEmpty v-if="paginated.results.length === 0" class="text-muted py-8" variant="naked" title="No votes match your filters" icon="i-lucide-search" />
                        <div v-else class="space-y-3">
                            <UPageCard
                                v-for="vote in paginated.results"
                                :key="vote.id"
                                variant="outline"
                                :to="`/votes/${vote.id}`"
                            >
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 space-y-2">
                                    <div>
                                        <h4 class="font-semibold">{{ vote.bill?.name ?? 'Unknown bill' }}</h4>
                                        <h5 class="text-muted text-sm mt-1">
                                            {{ formatVoteDate(vote.date) }} · {{ ordinalReading(vote.reading) }} reading
                                            <span v-if="voteTypeLabel(vote)" class="text-muted">
                                                · {{ voteTypeLabel(vote) }}
                                            </span>
                                        </h5>
                                    </div>
                                    <div class="grid grid-cols-4 gap-2 text-center">
                                        <div class="flex flex-col items-center">
                                            <span class="font-semibold">{{ vote.ayes }}</span>
                                            <span class="text-muted text-xs pb-1 border-b-2 border-emerald-500">Aye</span>
                                        </div>
                                        <div class="flex flex-col items-center">
                                            <span class="font-semibold">{{ vote.noes }}</span>
                                            <span class="text-muted text-xs pb-1 border-b-2 border-rose-500">No</span>
                                        </div>
                                        <div class="flex flex-col items-center">
                                            <span class="font-semibold">{{ vote.abstentions }}</span>
                                            <span class="text-muted text-xs pb-1 border-b-2 border-amber-500">Abstain</span>
                                        </div>
                                        <div class="flex flex-col items-center">
                                            <span class="font-semibold">{{ vote.absentees }}</span>
                                            <span class="text-muted text-xs pb-1 border-b-2 border-sky-500">Absent</span>
                                        </div>
                                    </div>
                                </div>
                            </UPageCard>
                        </div>
                        <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center gap-2">
                            <UButton
                                :disabled="page <= 1"
                                variant="outline"
                                size="sm"
                                icon="i-lucide-chevron-left"
                                aria-label="Previous page"
                                @click="goPage(page - 1)"
                            />
                            <span class="text-sm text-muted px-2">Page {{ page }} of {{ totalPages }}</span>
                            <UButton
                                :disabled="page >= totalPages"
                                variant="outline"
                                size="sm"
                                icon="i-lucide-chevron-right"
                                aria-label="Next page"
                                @click="goPage(page + 1)"
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
import { format } from 'date-fns'
import { breakpointsTailwind, useBreakpoints, watchDebounced } from '@vueuse/core'
import { DateFormatter, getLocalTimeZone, today, CalendarDate } from '@internationalized/date'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()
const router = useRouter()

const df = new DateFormatter('en-NZ', { dateStyle: 'long' })
const tz = getLocalTimeZone()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('sm')

const ranges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 14 days', days: 14 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', months: 3 },
    { label: 'Last 6 months', months: 6 },
    { label: 'Last year', years: 1 }
]

const modelValue = shallowRef({
    start: null as CalendarDate | null,
    end: null as CalendarDate | null
})

function clearDateRange() {
    modelValue.value = {
        start: null,
        end: null,
    }
}

const label = computed(() => {
    const { start, end } = modelValue.value
    if (!start) return 'Pick a date'
    if (!end) return df.format(start.toDate(tz))
    return `${df.format(start.toDate(tz))} — ${df.format(end.toDate(tz))}`
})

function computeStart(range: typeof ranges[number]) {
    const end = today(tz)
    return { start: end.subtract({ days: range.days, months: range.months, years: range.years }), end }
}

function isRangeSelected(range: typeof ranges[number]) {
    if (!modelValue.value?.start || !modelValue.value?.end) return false
    const { start, end } = computeStart(range)
    return modelValue.value.start.compare(start) === 0 && modelValue.value.end.compare(end) === 0
}

function selectRange(range: typeof ranges[number]) {
    modelValue.value = computeStart(range)
}

const voteTypeOptions = [
    { label: 'Voice vote', value: 'voice' },
    { label: 'Party vote', value: 'party' },
    { label: 'Personal vote', value: 'personal' },
    { label: 'Split party vote', value: 'split_party' },
]

const billTypeOptions = [
    { label: 'Government bill', value: 'government' },
    { label: 'Members\' bill', value: 'members' },
    { label: 'Local bill', value: 'local' },
    { label: 'Private bill', value: 'private' },
]

const voteResultOptions = [
    { label: 'Any', value: 'any' },
    { label: 'Succeeded', value: 'succeeded' },
    { label: 'Failed', value: 'failed' },
]

const resultsPerPageOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
]

const orderByOptions = [
    { label: 'Date (newest first)', value: 'date_newest' },
    { label: 'Date (oldest first)', value: 'date_oldest' },
    { label: 'Bill name (A-Z)', value: 'name_az' },
    { label: 'Bill name (Z-A)', value: 'name_za' },
]

const resultsPerPage = ref<number>(10)
const orderBy = ref<string>('date_newest')

const titleFilter = ref<string>('')

const billType = ref<string[]>(['government', 'members', 'local', 'private'])
const voteType = ref<string[]>(['voice', 'party', 'personal', 'split_party'])
const voteResult = ref<string>('any')

const ALL_VOTE_TYPES = ['voice', 'party', 'personal', 'split_party'] as const
const ALL_BILL_TYPES = ['government', 'members', 'local', 'private'] as const

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_ORDER = 'date_newest'
const VALID_ORDERS = ['date_newest', 'date_oldest', 'name_az', 'name_za'] as const
const VALID_RESULTS = ['any', 'succeeded', 'failed'] as const

type VoteTypeCode = (typeof ALL_VOTE_TYPES)[number]
type BillTypeCode = (typeof ALL_BILL_TYPES)[number]

type BillRef = { id?: string; name?: string }

type VoteRow = {
    id: string
    date: string
    reading: number
    ayes: number
    noes: number
    abstentions: number
    absentees: number
    vote_type?: string | null
    contains_split_party_votes?: boolean
    bill?: BillRef | null
}

type PaginatedVotes = {
    count: number
    next: string | null
    previous: string | null
    results: VoteRow[]
}

const titleDebounced = ref('')
watchDebounced(titleFilter, (v) => { titleDebounced.value = v }, { debounce: 600 })

const ORDERING_MAP: Record<string, string> = {
    date_newest: '-date',
    date_oldest: 'date',
    name_az: 'bill__name',
    name_za: '-bill__name',
}

function parseIntParam(raw: unknown, fallback: number): number {
    const n = parseInt(String(raw ?? ''), 10)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

function parseTypesParam(raw: unknown, all: readonly string[]): string[] {
    if (raw === undefined || raw === null || raw === '') return [...all]
    const s = Array.isArray(raw) ? raw.join(',') : String(raw)
    const parsed = s
        .split(',')
        .map((t) => t.trim())
        .filter((t): t is string => (all as readonly string[]).includes(t))
    return parsed.length > 0 ? parsed : [...all]
}

function calendarDateToIso(d: CalendarDate | null): string | null {
    if (!d) return null
    const month = String(d.month).padStart(2, '0')
    const day = String(d.day).padStart(2, '0')
    return `${d.year}-${month}-${day}`
}

function parseCalendarDate(iso: string): CalendarDate | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
    if (!m) return null
    return new CalendarDate(Number(m[1]), Number(m[2]), Number(m[3]))
}

function isFullSelection(selected: string[], all: readonly string[]): boolean {
    return all.every((t) => selected.includes(t)) && selected.length >= all.length
}

function normalizeVotesQuery(q: typeof route.query): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [key, val] of Object.entries(q)) {
        if (!key.startsWith('votes_') || val === undefined || val === null || val === '') continue
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
    if (search) next.votes_search = search

    const dateFrom = calendarDateToIso(modelValue.value.start)
    const dateTo = calendarDateToIso(modelValue.value.end ?? modelValue.value.start)
    if (dateFrom) next.votes_date_from = dateFrom
    if (dateTo) next.votes_date_to = dateTo

    if (!isFullSelection(voteType.value, ALL_VOTE_TYPES)) {
        next.votes_types = voteType.value.join(',')
    }

    if (!isFullSelection(billType.value, ALL_BILL_TYPES)) {
        next.votes_bill_types = billType.value.join(',')
    }

    if (voteResult.value === 'succeeded' || voteResult.value === 'failed') {
        next.votes_result = voteResult.value
    }

    if (orderBy.value !== DEFAULT_ORDER) {
        next.votes_order = orderBy.value
    }

    if (resultsPerPage.value !== DEFAULT_PAGE_SIZE) {
        next.votes_page_size = String(resultsPerPage.value)
    }

    if (!resetPage) {
        const currentPage = parseIntParam(route.query.votes_page, 1)
        if (currentPage > 1) next.votes_page = String(currentPage)
    }

    return next
}

function syncFormFromRoute() {
    const q = route.query

    const search = typeof q.votes_search === 'string' ? q.votes_search : ''
    titleFilter.value = search
    titleDebounced.value = search

    const from =
        typeof q.votes_date_from === 'string' ? parseCalendarDate(q.votes_date_from) : null
    const to =
        typeof q.votes_date_to === 'string' ? parseCalendarDate(q.votes_date_to) : null
    modelValue.value = { start: from, end: to }

    voteType.value = parseTypesParam(q.votes_types, ALL_VOTE_TYPES) as VoteTypeCode[]
    billType.value = parseTypesParam(q.votes_bill_types, ALL_BILL_TYPES) as BillTypeCode[]

    const result = typeof q.votes_result === 'string' ? q.votes_result : 'any'
    voteResult.value = (VALID_RESULTS as readonly string[]).includes(result) ? result : 'any'

    const order = typeof q.votes_order === 'string' ? q.votes_order : DEFAULT_ORDER
    orderBy.value = (VALID_ORDERS as readonly string[]).includes(order) ? order : DEFAULT_ORDER

    resultsPerPage.value = parseIntParam(q.votes_page_size, DEFAULT_PAGE_SIZE)
}

function queryToApiSearchParams(q: typeof route.query): URLSearchParams {
    const p = new URLSearchParams()
    p.set('page', String(parseIntParam(q.votes_page, 1)))
    p.set('page_size', String(parseIntParam(q.votes_page_size, DEFAULT_PAGE_SIZE)))

    const search = typeof q.votes_search === 'string' ? q.votes_search.trim() : ''
    if (search) p.set('search', search)

    const dateFrom = typeof q.votes_date_from === 'string' ? q.votes_date_from : null
    const dateTo = typeof q.votes_date_to === 'string' ? q.votes_date_to : null
    if (dateFrom) p.set('date_from', dateFrom)
    if (dateTo) p.set('date_to', dateTo)

    const types = parseTypesParam(q.votes_types, ALL_VOTE_TYPES)
    if (!isFullSelection(types, ALL_VOTE_TYPES)) {
        types.forEach((t) => p.append('vote_types', t))
    }

    const billTypes = parseTypesParam(q.votes_bill_types, ALL_BILL_TYPES)
    if (!isFullSelection(billTypes, ALL_BILL_TYPES)) {
        billTypes.forEach((t) => p.append('bill_types', t))
    }

    const result = typeof q.votes_result === 'string' ? q.votes_result : 'any'
    if (result === 'succeeded') p.set('motion_agreed', 'true')
    else if (result === 'failed') p.set('motion_agreed', 'false')

    const order = typeof q.votes_order === 'string' ? q.votes_order : DEFAULT_ORDER
    p.set('ordering', ORDERING_MAP[order] ?? '-date')

    return p
}

let syncingFromRoute = false

function pushFiltersToRoute(resetPage = false) {
    if (syncingFromRoute) return
    const next = filtersToRouteQuery(resetPage)
    const current = normalizeVotesQuery(route.query)
    if (queriesMatch(next, current)) return
    router.replace({ query: next })
}

const fetchKey = computed(() => `votes-list-${JSON.stringify(route.query)}`)

const { data: paginated, status, refresh } = await useAsyncData<PaginatedVotes>(
    fetchKey,
    () => {
        const qs = queryToApiSearchParams(route.query).toString()
        return $fetch<PaginatedVotes>(`${apiBase}votes/?${qs}`)
    },
    { watch: [() => route.query], lazy: true },
)

function hasRefiningFiltersInQuery(q: typeof route.query): boolean {
    const search = typeof q.votes_search === 'string' ? q.votes_search.trim() : ''
    if (search) return true
    if (q.votes_date_from || q.votes_date_to) return true
    const types = parseTypesParam(q.votes_types, ALL_VOTE_TYPES)
    if (!isFullSelection(types, ALL_VOTE_TYPES)) return true
    const billTypes = parseTypesParam(q.votes_bill_types, ALL_BILL_TYPES)
    if (!isFullSelection(billTypes, ALL_BILL_TYPES)) return true
    const result = typeof q.votes_result === 'string' ? q.votes_result : 'any'
    if (result === 'succeeded' || result === 'failed') return true
    return false
}

const resultsHeading = computed(() =>
    hasRefiningFiltersInQuery(route.query) ? 'Results' : 'All votes',
)

const page = computed(() => parseIntParam(route.query.votes_page, 1))
const pageSize = computed(() => parseIntParam(route.query.votes_page_size, DEFAULT_PAGE_SIZE))

const totalPages = computed(() => {
    const c = paginated.value?.count ?? 0
    return Math.max(1, Math.ceil(c / pageSize.value))
})

function goPage(n: number) {
    const next = filtersToRouteQuery(false)
    if (n <= 1) delete next.votes_page
    else next.votes_page = String(n)
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
        // Stay guarded until child watchers (triggered by syncFormFromRoute) have run,
        // otherwise pushFiltersToRoute(true) strips votes_page and resets pagination.
        nextTick(() => {
            syncingFromRoute = false
        })
    },
    { immediate: true },
)

watch(titleDebounced, () => pushFiltersToRoute(true))

watch(
    [modelValue, voteType, billType, voteResult, resultsPerPage, orderBy],
    () => pushFiltersToRoute(true),
    { deep: true },
)

function formatVoteDate(date: string) {
    return format(new Date(date), 'd MMMM yyyy')
}

function ordinalReading(n: number): string {
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
}

function voteTypeLabel(vote: VoteRow): string | null {
    if (vote.contains_split_party_votes) return 'Split party vote'
    if (vote.vote_type === 'voice') return 'Voice vote'
    if (vote.vote_type === 'party') return 'Party vote'
    if (vote.vote_type === 'personal') return 'Personal vote'
    return null
}
</script>