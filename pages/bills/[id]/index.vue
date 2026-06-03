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
            
            <div class="my-4 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-x-2">
                    <UButton v-if="originalBill.parliament_api_id"
                        :href="`https://bills.parliament.nz/v/6/${originalBill.parliament_api_id}`"
                        target="_blank"
                        variant="outline"
                        icon="i-lucide-external-link"
                        class="mb-2 lg:mb-0"
                    >
                        View on Parliament website
                    </UButton>
                    <UButton v-if="originalBill.legislation_url"
                        :href="originalBill.legislation_url"
                        target="_blank"
                        variant="outline"
                        icon="i-lucide-book-open"
                        class="mb-2 lg:mb-0"
                    >
                        Read bill text
                    </UButton>
                    </div>
                    
                    <div>
                        <UBadge :color="statusMeta.colour" variant="soft" size="xl">
                            {{ statusMeta.description }}
                        </UBadge>
                    </div>
                </div>

                <UPageCard variant="subtle" class="mt-4" v-if="originalBill.description">
                    <p>
                        {{ originalBill.description }}
                    </p>
                    <div v-if="originalBill.voting_methods != 'unknown'">
                    <h5 class="text-muted">Voting method</h5>
                        <p>
                            <span class="font-semibold">{{ getVotingMethod(originalBill.voting_methods).label }}</span>: {{ getVotingMethod(originalBill.voting_methods).description }}
                        </p>
                    </div>
                    <h4 class="text-lg font-semibold" v-if="originalBill.extended_sittings_used || originalBill.urgency_used">Procedural notes</h4>
                    <div v-if="originalBill.extended_sittings_used">
                    <h5 class="text-muted">Extended sittings used</h5>
                        <p>
                            Extended sittings were used to progress this bill.  <ULink href="https://links.wheretheystand.nz/parliament-extended-sittings" target="_blank">Learn more about extended sittings <UIcon name="i-lucide-external-link" /></ULink>
                        </p>
                    </div>
                    <div v-if="originalBill.urgency_used">
                    <h5 class="text-muted">Urgency used</h5>
                        <p>
                            Urgency was used to progress this bill.  This means some of the normal processes may have been skipped or abrogated.  <ULink href="https://links.wheretheystand.nz/parliament-urgency" target="_blank">Learn more about urgency <UIcon name="i-lucide-external-link" /></ULink>
                        </p>
                    </div>
                    <USeparator class="my-4"/>
                    <ul class="list-disc list-inside">
                        <li>
                            Introduced on <span class="font-semibold">{{ formatDate(originalBill.introduction_date) }}</span>
                        </li>
                        <li v-if="originalBill.first_reading_date">
                            1st reading on <span class="font-semibold">{{ formatDate(originalBill.first_reading_date) }}</span>
                        </li>
                        <li v-if="originalBill.second_reading_date">
                            2nd reading on <span class="font-semibold">{{ formatDate(originalBill.second_reading_date) }}</span>
                        </li>
                        <li v-if="originalBill.third_reading_date">
                            3rd reading on <span class="font-semibold">{{ formatDate(originalBill.third_reading_date) }}</span>
                        </li>
                        <li v-if="originalBill.royal_assent_date">
                            Royal assent on <span class="font-semibold">{{ formatDate(originalBill.royal_assent_date) }}</span>
                        </li>
                        <li v-if="originalBill.withdrawn_date">
                            Withdrawn on <span class="font-semibold">{{ formatDate(originalBill.withdrawn_date) }}</span>
                        </li>
                        <li v-if="originalBill.defeated_date">
                            Defeated on <span class="font-semibold">{{ formatDate(originalBill.defeated_date) }}</span>
                        </li>
                        <li v-if="originalBill.lapsed_date">
                            Lapsed on <span class="font-semibold">{{ formatDate(originalBill.lapsed_date) }}</span>
                        </li>
                    </ul>
                </UPageCard>

            <div v-if="originalBill.people_responsible.length">
                <h2 class="text-lg font-semibold mb-3">
                    Member<span v-if="originalBill.people_responsible.length > 1">s</span> responsible
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <WContentPersonCard v-for="member in originalBill.people_responsible" :key="member.id" :person="member" />
                </div>
            </div>

            <div>
                <h2 class="text-lg font-semibold mb-3">Votes</h2>

                <p v-if="votesFetchError" class="text-sm text-error mb-4">
                    Could not load vote details<span v-if="voteFetchErrorMessage"> ({{ voteFetchErrorMessage }})</span>.
                    Showing reading dates only where available.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    <WContentItemCard
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
                                    <div v-if="row.totals" class="grid grid-cols-4 gap-2 text-center pt-2">
                                        <div class="flex flex-col items-center">
                                            <span class="font-semibold">{{ row.totals.ayes }}</span>
                                            <span class="text-muted text-xs pb-1 border-b-2 border-emerald-500">Aye</span>
                                        </div>
                                        <div class="flex flex-col items-center">
                                            <span class="font-semibold">{{ row.totals.noes }}</span>
                                            <span class="text-muted text-xs pb-1 border-b-2 border-rose-500">No</span>
                                        </div>
                                        <div class="flex flex-col items-center">
                                            <span class="font-semibold">{{ row.totals.abstentions }}</span>
                                            <span class="text-muted text-xs pb-1 border-b-2 border-amber-500">Abstain</span>
                                        </div>
                                        <div class="flex flex-col items-center">
                                            <span class="font-semibold">{{ row.totals.absentees }}</span>
                                            <span class="text-muted text-xs pb-1 border-b-2 border-sky-500">Absent</span>
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
                                    <p v-if="row.hansardLink" class="mt-2">
                                        <ULink
                                            :href="row.hansardLink.url"
                                            target="_blank"
                                            class="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                                        >
                                            {{ row.hansardLink.label }}
                                            <UIcon name="i-lucide-external-link" />
                                        </ULink>
                                    </p>
                                </template>

                                <template v-else-if="row.kind === 'reading_only'">
                                    <p class="text-sm text-muted">
                                        Reading date: {{ formatDate(row.readingDate) }}
                                    </p>
                                    <p class="text-sm text-muted">
                                        {{ row.detailNote }}
                                    </p>
                                    <p v-if="row.hansardLink" class="mt-2">
                                        <ULink
                                            :href="row.hansardLink.url"
                                            target="_blank"
                                            class="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                                        >
                                            {{ row.hansardLink.label }}
                                            <UIcon name="i-lucide-external-link" />
                                        </ULink>
                                    </p>
                                </template>

                                <template v-else>
                                    <p class="text-sm text-muted">
                                        This reading has not yet occurred, or no date is available.
                                    </p>
                                </template>
                            </div>
                        </template>
                    </WContentItemCard>
                </div>

                <p v-if="bill.votesNote" class="mt-4 text-xs text-muted">{{ bill.votesNote }}</p>
                <p v-if="bill.lastSynced" class="mt-2 text-xs text-muted">{{ bill.lastSynced }}</p>
            </div>
        </template>
    </UContainer>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const formatDate = (date?: string | null) => {
    if (!date) return ''
    const parsedDate =
        date.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? new Date(date + 'T00:00:00')
            : new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return String(date)
    return format(parsedDate, 'd MMMM yyyy')
}

const props = defineProps({
    bill: {
        type: Object,
        required: true,
    },
    originalBill: {
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

const { bill, originalBill, status, error, refresh } = toRefs(props)

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

import type { TimelineItem } from '@nuxt/ui'

const timelineItems = ref<TimelineItem[]>([
  {
    date: formatDate(bill.value?.introduction_date),
    title: 'Introduced',
    icon: 'i-lucide-rocket'
  },
  {
    date: formatDate(bill.value?.first_reading_date),
    title: '1st reading',
    icon: 'i-lucide-book-open'
  },
  {
    date: formatDate(bill.value?.second_reading_date),
    title: '2nd reading',
    icon: 'i-lucide-book-open'
  },
  {
    date: formatDate(bill.value?.third_reading_date),
    title: '3rd reading',
    icon: 'i-lucide-book-open'
  },
  {
    date: formatDate(bill.value?.royal_assent_date),
    title: 'Royal assent',
    icon: 'i-lucide-book-open'
  },
  {
    date: formatDate(bill.value?.withdrawn_date),
    title: 'Withdrawn',
    icon: 'i-lucide-book-open'
  }
])

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

type HansardSearchResult = {
    result_id: string
    result_sitting_date: string
}

type VoteStub = {
    date: string
    reading: number
    hansard_search_result: HansardSearchResult | null
}

type HansardLink = {
    url: string
    label: string
}

const votingMethodLookup: Record<string, { label: string; description: string }> = {
    party: {
        label: 'Party voting',
        description: 'Parties decided whether or not to support this bill and cast votes on behalf of all their MPs.',
    },
    personal: {
        label: 'Personal voting',
        description: 'Each MP cast their own vote on this bill.',
    },
    mixed: {
        label: 'Mixed voting',
        description: 'Both personal and party voting were used at different stages of this bill.',
    },
}

function getVotingMethod(votingMethod: string): { label: string; description: string } {
    return votingMethodLookup[votingMethod] ?? { label: 'Unknown', description: 'Unknown voting method' }
}

function hansardTranscriptLink(result: HansardSearchResult | null | undefined): HansardLink | null {
    if (!result?.result_id || !result?.result_sitting_date) return null
    const sId = result.result_id.replace(/-/g, '')
    return {
        url: `https://hansard.parliament.nz/hansard-transcript/${result.result_sitting_date}/?sId=${sId}`,
        label: 'View in Hansard',
    }
}

function voteStubsByReading(billData: Record<string, unknown>): Map<number, VoteStub> {
    const stubs = billData.vote_stubs
    const byReading = new Map<number, VoteStub>()
    if (!Array.isArray(stubs)) return byReading
    for (const stub of stubs) {
        if (!stub || typeof stub !== 'object') continue
        const reading = Number((stub as VoteStub).reading)
        if (!Number.isNaN(reading)) {
            byReading.set(reading, stub as VoteStub)
        }
    }
    return byReading
}

const billId = computed(() => String(route.params.id ?? ''))

const { data: votesData, error: votesFetchError } = await useAsyncData(
    () => `bill-votes-${billId.value}`,
    () =>
        $fetch<PaginatedVotes>(
            `${apiBase}votes/?bill=${encodeURIComponent(billId.value)}&page_size=100`,
        ),
    { watch: [billId] },
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
          hansardLink: HansardLink | null
      }
    | {
          reading: 1 | 2 | 3
          stage: string
          kind: 'reading_only'
          readingDate: string
          detailNote: string
          hansardLink: HansardLink | null
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
    const stubsByReading = voteStubsByReading(b)

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
            const hansardLink = hansardTranscriptLink(
                stubsByReading.get(spec.reading)?.hansard_search_result,
            )
            rows.push({
                reading: spec.reading,
                stage: spec.stage,
                kind: 'defeat',
                defeatedDate,
                hansardLink,
                detailNote: hansardLink
                    ? 'The bill was defeated at this stage. Vote totals are not recorded on WhereTheyStand.'
                    : 'The bill was defeated at this stage. Vote totals are not recorded on WhereTheyStand; see Hansard for detail.',
            })
        } else if (readingDate) {
            const hansardLink = hansardTranscriptLink(
                stubsByReading.get(spec.reading)?.hansard_search_result,
            )
            rows.push({
                reading: spec.reading,
                stage: spec.stage,
                kind: 'reading_only',
                readingDate,
                hansardLink,
                detailNote: hansardLink
                    ? 'This vote is recorded in Hansard but hasn\'t been processed in WhereTheyStand.'
                    : 'No vote breakdown is recorded on WhereTheyStand for this reading. Other votes may appear in Hansard.',
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

</script>
