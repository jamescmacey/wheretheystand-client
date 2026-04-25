<template>
    <UContainer class="my-8 space-y-8">
        <template v-if="status === 'pending'">
            <div class="my-16 flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading bill…</h3>
                <UProgress animation="swing" class="w-48" />
            </div>
        </template>

        <template v-else-if="status === 'error'">
            <UCard variant="subtle" class="w-full">
                <UEmpty
                    title="Bill unavailable"
                    description="We could not load this bill. It may have been removed, or there was a temporary problem."
                >
                    <template #actions>
                        <UButton
                            variant="subtle"
                            color="neutral"
                            class="mt-4"
                            icon="i-lucide-refresh-cw"
                            trailing
                            @click="refresh?.()"
                        >
                            Retry
                        </UButton>
                    </template>
                </UEmpty>
                <p v-if="error" class="text-muted text-xs text-center mt-4">
                    {{ error.statusCode }}: {{ error }}
                </p>
            </UCard>
        </template>

        <template v-else>
            <div class="grid gap-6 lg:grid-cols-3">
                <UCard class="lg:col-span-2">
                    <template #header>
                        <div class="flex items-center justify-between gap-4">
                            <h2 class="text-lg font-semibold">About this bill</h2>
                        </div>
                    </template>

                    <p class="text-sm text-muted leading-relaxed">
                        {{ bill.summary }}
                    </p>

                    <div class="mt-5 space-y-5">
                        <div v-if="resources.billText || resources.actText">
                            <h3 class="text-sm font-semibold">Read the bill</h3>
                            <div class="mt-2 flex flex-col gap-2 text-sm">
                                <ULink
                                    v-if="resources.billText"
                                    :href="resources.billText.url"
                                    target="_blank"
                                    class="inline-flex items-center gap-2"
                                >
                                    <UIcon name="i-lucide-file-text" class="text-muted" />
                                    <span>{{ resources.billText.label }}</span>
                                    <UIcon name="i-lucide-external-link" class="text-muted" />
                                </ULink>
                                <ULink
                                    v-if="resources.actText"
                                    :href="resources.actText.url"
                                    target="_blank"
                                    class="inline-flex items-center gap-2"
                                >
                                    <UIcon name="i-lucide-book-open" class="text-muted" />
                                    <span>{{ resources.actText.label }}</span>
                                    <UIcon name="i-lucide-external-link" class="text-muted" />
                                </ULink>
                            </div>
                        </div>

                        <div v-if="votingMethod">
                            <h3 class="text-sm font-semibold">Voting method</h3>
                            <p class="mt-1 text-sm text-muted">
                                <span class="font-semibold text-default">{{ votingMethod.label }}:</span>
                                {{ votingMethod.description }}
                            </p>
                        </div>

                        <div v-if="proceduralNotes.length">
                            <h3 class="text-sm font-semibold">Procedural notes</h3>
                            <ul class="mt-2 space-y-2 text-sm text-muted">
                                <li v-for="note in proceduralNotes" :key="note.title">
                                    <span class="font-semibold text-default">{{ note.title }}:</span>
                                    {{ note.description }}
                                    <ULink
                                        v-if="note.link"
                                        :href="note.link.url"
                                        target="_blank"
                                        class="inline-flex items-center gap-1"
                                    >
                                        {{ note.link.label }}
                                        <UIcon name="i-lucide-external-link" class="text-muted" />
                                    </ULink>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <ULink
                                v-if="resources.parliament"
                                :href="resources.parliament.url"
                                target="_blank"
                                class="inline-flex items-center gap-2"
                            >
                                {{ resources.parliament.label }}
                                <UIcon name="i-lucide-external-link" class="text-muted" />
                            </ULink>
                            <ULink
                                v-if="resources.json"
                                :href="resources.json.url"
                                target="_blank"
                                class="inline-flex items-center gap-2 text-muted"
                            >
                                <UIcon name="i-lucide-code" />
                                {{ resources.json.label }}
                            </ULink>
                        </div>
                    </template>
                </UCard>

                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between gap-4">
                            <h2 class="text-lg font-semibold">Progress</h2>
                            <UBadge :color="statusMeta.colour" variant="soft">
                                {{ statusMeta.description }}
                            </UBadge>
                        </div>
                    </template>
                    <div class="space-y-3">
                        <p class="text-2xl font-semibold">{{ statusMeta.description }}</p>
                        <p class="text-sm text-muted">{{ bill.statusSummary }}</p>
                    </div>
                </UCard>
            </div>

            <div v-if="members.length">
                <h2 class="text-lg font-semibold mb-3">
                    Member<span v-if="members.length > 1">s</span> responsible
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ContentItemCard
                        v-for="memberItem in members"
                        :key="memberItem.id"
                        :item="{ colour: memberItem.colour }"
                        :to="memberItem.link || undefined"
                    >
                        <template #title>
                            <div class="flex items-center gap-3">
                                <img
                                    :src="memberItem.avatarUrl"
                                    :alt="memberItem.name"
                                    class="w-10 h-10 rounded-full object-cover shrink-0 ring ring-default"
                                >
                                <div class="min-w-0">
                                    <p class="font-medium text-highlighted truncate">{{ memberItem.name }}</p>
                                    <p v-if="memberItem.role" class="text-sm text-muted truncate">
                                        {{ memberItem.role }}
                                    </p>
                                    <p v-else class="text-sm text-muted">Member of Parliament</p>
                                </div>
                            </div>
                        </template>
                    </ContentItemCard>
                </div>
            </div>

            <div>
                <h2 class="text-lg font-semibold mb-3">Votes</h2>

                <p v-if="votesFetchError" class="text-sm text-error mb-4">
                    Could not load vote details<span v-if="voteFetchErrorMessage"> ({{ voteFetchErrorMessage }})</span>.
                    Showing reading dates only where available.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    <ContentItemCard
                        v-for="row in mergedReadingRows"
                        :key="row.reading"
                        :item="{}"
                        :fill-height="false"
                        :to="row.kind === 'vote' ? `/votes/${row.voteId}` : undefined"
                    >
                        <template #title>
                            <div class="space-y-4 min-w-0 w-full">
                                <div class="flex items-center justify-between gap-3">
                                    <p class="font-medium text-highlighted">{{ row.stage }}</p>
                                    <UBadge :color="mergedRowBadge(row).color" variant="soft">
                                        {{ mergedRowBadge(row).label }}
                                    </UBadge>
                                </div>

                                <template v-if="row.kind === 'vote'">
                                    <p class="text-sm text-muted">
                                        {{ formatDate(row.voteDate) }}
                                    </p>
                                    <p v-if="row.voteType" class="text-xs text-muted">
                                        <span class="capitalize">{{ String(row.voteType).replace(/_/g, ' ') }}</span> vote
                                    </p>
                                    <div v-if="row.totals" class="grid grid-cols-4 gap-2 text-center text-xs pt-2">
                                        <div
                                            v-for="total in totalsForMergedRow(row)"
                                            :key="total.label"
                                            class="flex flex-col items-center gap-1"
                                        >
                                            <span class="text-lg font-semibold text-default">{{ total.value }}</span>
                                            <span class="inline-flex items-center gap-1 text-[10px] uppercase text-muted">
                                                <span :class="['h-2 w-2 rounded-full', total.color]" />
                                                {{ total.label }}
                                            </span>
                                        </div>
                                    </div>
                                </template>

                                <template v-else-if="row.kind === 'defeat'">
                                    <p v-if="row.defeatedDate" class="text-sm text-muted">
                                        Defeated on {{ formatDate(row.defeatedDate) }}
                                    </p>
                                    <p v-else class="text-sm text-muted">
                                        Defeated at this stage (date not recorded).
                                    </p>
                                    <p class="text-sm text-muted">
                                        {{ row.detailNote }}
                                    </p>
                                </template>

                                <template v-else-if="row.kind === 'reading_only'">
                                    <p class="text-sm text-muted">
                                        Reading date: {{ formatDate(row.readingDate) }}
                                    </p>
                                    <p class="text-sm text-muted">
                                        {{ row.detailNote }}
                                    </p>
                                </template>

                                <template v-else>
                                    <p class="text-sm text-muted">
                                        This reading has not yet occurred, or no date is available.
                                    </p>
                                </template>
                            </div>
                        </template>
                    </ContentItemCard>
                </div>

                <p v-if="bill.votesNote" class="mt-4 text-xs text-muted">{{ bill.votesNote }}</p>
                <p v-if="bill.lastSynced" class="mt-2 text-xs text-muted">{{ bill.lastSynced }}</p>
            </div>
        </template>
    </UContainer>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps({
    bill: {
        type: Object,
        required: true,
    },
    status: {
        type: String,
        default: 'pending',
    },
    error: {
        type: Object,
        default: null,
    },
    refresh: {
        type: Function,
        default: null,
    },
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const { bill, status, error, refresh } = toRefs(props)

const resources = computed(() => (bill.value as Record<string, unknown>)?.resources ?? {})
const members = computed(() =>
    Array.isArray((bill.value as Record<string, unknown>)?.members)
        ? (bill.value as Record<string, unknown>).members
        : [],
)
const votingMethod = computed(() => (bill.value as Record<string, unknown>)?.votingMethod ?? null)
const proceduralNotes = computed(() =>
    Array.isArray((bill.value as Record<string, unknown>)?.proceduralNotes)
        ? (bill.value as Record<string, unknown>).proceduralNotes
        : [],
)

type ApiVote = {
    id: string
    reading: number
    date: string
    ayes: number
    noes: number
    abstentions: number
    absentees: number
    motion_agreed: boolean
    vote_type?: string | null
}

type PaginatedVotes = {
    count: number
    results: ApiVote[]
    next: string | null
    previous: string | null
}

const billId = computed(() => String(route.params.id ?? ''))

const { data: votesData, error: votesFetchError } = await useAsyncData(
    () => `bill-votes-${billId.value}`,
    () =>
        $fetch<PaginatedVotes>(
            `${apiBase}votes/?bill=${encodeURIComponent(billId.value)}&page_size=100`,
        ),
    {
        watch: [billId],
        lazy: true,
    },
)

const voteFetchErrorMessage = computed(() => {
    const e = votesFetchError.value as { message?: string; statusMessage?: string } | null | undefined
    if (!e) return ''
    return e.message || e.statusMessage || ''
})

type MergedRow =
    | {
          reading: 1 | 2 | 3
          stage: string
          kind: 'vote'
          voteId: string
          voteDate: string
          readingDate: string | null
          motion_agreed: boolean
          totals: { ayes: number; noes: number; abstentions: number; absentees: number }
          voteType: string | null
      }
    | {
          reading: 1 | 2 | 3
          stage: string
          kind: 'defeat'
          defeatedDate: string | null
          detailNote: string
      }
    | {
          reading: 1 | 2 | 3
          stage: string
          kind: 'reading_only'
          readingDate: string
          detailNote: string
      }
    | {
          reading: 1 | 2 | 3
          stage: string
          kind: 'pending'
      }

const mergedReadingRows = computed((): MergedRow[] => {
    const b = bill.value as Record<string, unknown>
    const apiVotes = votesData.value?.results ?? []
    const byReading = new Map<number, ApiVote>()
    for (const v of apiVotes) {
        byReading.set(v.reading, v)
    }

    const defeatedReadingRaw = b.defeated_reading
    const defeatedReading =
        defeatedReadingRaw !== undefined && defeatedReadingRaw !== null && defeatedReadingRaw !== ''
            ? Number(defeatedReadingRaw)
            : null
    const defeatedDate =
        typeof b.defeated_date === 'string' && b.defeated_date.length > 0 ? b.defeated_date : null

    /** Earliest reading where the bill was defeated (vote lost, or bill metadata). Later stages did not occur. */
    let defeatAtReading: number | null = null
    for (const r of [1, 2, 3] as const) {
        const v = byReading.get(r)
        if (v && !v.motion_agreed) {
            defeatAtReading = r
            break
        }
    }
    if (
        defeatAtReading === null &&
        defeatedReading !== null &&
        !Number.isNaN(defeatedReading) &&
        defeatedReading >= 1 &&
        defeatedReading <= 3
    ) {
        defeatAtReading = defeatedReading
    }

    const specs = [
        { reading: 1 as const, stage: '1st reading', key: 'first_reading_date' },
        { reading: 2 as const, stage: '2nd reading', key: 'second_reading_date' },
        { reading: 3 as const, stage: '3rd reading', key: 'third_reading_date' },
    ]

    const rows: MergedRow[] = []
    for (const spec of specs) {
        if (defeatAtReading !== null && spec.reading > defeatAtReading) {
            continue
        }

        const vote = byReading.get(spec.reading)
        const readingDate = (typeof b[spec.key] === 'string' ? b[spec.key] : null) as string | null

        if (vote) {
            rows.push({
                reading: spec.reading,
                stage: spec.stage,
                kind: 'vote',
                voteId: vote.id,
                voteDate: vote.date,
                readingDate,
                motion_agreed: vote.motion_agreed,
                totals: {
                    ayes: vote.ayes,
                    noes: vote.noes,
                    abstentions: vote.abstentions,
                    absentees: vote.absentees,
                },
                voteType: vote.vote_type ?? null,
            })
        } else if (
            defeatedReading !== null &&
            !Number.isNaN(defeatedReading) &&
            defeatedReading === spec.reading
        ) {
            rows.push({
                reading: spec.reading,
                stage: spec.stage,
                kind: 'defeat',
                defeatedDate,
                detailNote:
                    'The bill was defeated at this stage. Vote totals are not recorded on WhereTheyStand; see Hansard for detail.',
            })
        } else if (readingDate) {
            rows.push({
                reading: spec.reading,
                stage: spec.stage,
                kind: 'reading_only',
                readingDate,
                detailNote:
                    'No vote breakdown is recorded on WhereTheyStand for this reading. Other votes may appear in Hansard.',
            })
        } else {
            rows.push({
                reading: spec.reading,
                stage: spec.stage,
                kind: 'pending',
            })
        }
    }
    return rows
})

const statusMeta = computed(() => {
    const statuses = config.public.valueKeys?.billStatuses ?? {}
    const key = (bill.value as Record<string, unknown>)?.status ?? 'unknown'
    return (
        (statuses as Record<string, { description?: string; colour?: string }>)[String(key)] ?? {
            description: 'Unknown',
            colour: 'neutral',
        }
    )
})

function mergedRowBadge(row: MergedRow): { label: string; color: string } {
    if (row.kind === 'vote') {
        return row.motion_agreed
            ? { label: 'Passed', color: 'success' }
            : { label: 'Defeated', color: 'error' }
    }
    if (row.kind === 'defeat') {
        return { label: 'Defeated', color: 'error' }
    }
    if (row.kind === 'reading_only') {
        return { label: 'Passed', color: 'success' }
    }
    return { label: 'Pending', color: 'neutral' }
}

function totalsForMergedRow(row: Extract<MergedRow, { kind: 'vote' }>) {
    return [
        { label: 'Ayes', value: row.totals.ayes, color: 'bg-emerald-500' },
        { label: 'Noes', value: row.totals.noes, color: 'bg-rose-500' },
        { label: 'Abst.', value: row.totals.abstentions, color: 'bg-amber-500' },
        { label: 'Abse.', value: row.totals.absentees, color: 'bg-sky-500' },
    ]
}

const formatDate = (date?: string | null) => {
    if (!date) return ''
    const parsedDate =
        date.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? new Date(date + 'T00:00:00')
            : new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return String(date)
    return format(parsedDate, 'd MMMM yyyy')
}
</script>
