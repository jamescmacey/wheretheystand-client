<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Closest electorates</h3>
                <!-- The figures behind this list can be older than the national
                     tally beside it, so it dates itself rather than borrowing
                     the page's status badge. Once every one of them is final
                     there is nothing left to be out of date about, and a time
                     stamp on a settled result reads as a fault. -->
                <p v-if="asAt" class="text-sm text-muted">As at {{ asAt }}</p>
            </div>
        </template>

        <template v-if="races.length">
            <ul class="divide-y divide-default/50">
                <li v-for="race in races" :key="race.electorate" class="py-2">
                    <NuxtLink :to="race.href" class="flex items-center justify-between gap-3 hover:underline">
                        <div class="flex items-center gap-2 min-w-0">
                            <ElectionsResultsPartySwatch :colour="race.colour" />
                            <div class="min-w-0">
                                <p class="truncate">{{ race.name }}</p>
                                <p class="text-xs text-muted truncate">{{ race.leader }}</p>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="tabular-nums font-bold">{{ race.margin }}</p>
                            <p class="text-xs text-muted tabular-nums">{{ race.points }}</p>
                        </div>
                    </NuxtLink>
                </li>
            </ul>
            <UButton :to="electoratesHref" variant="link" color="neutral" size="sm" class="mt-2"
                trailing-icon="i-lucide-arrow-right">
                All electorates
            </UButton>
        </template>

        <div v-else class="text-center py-6 space-y-3">
            <p class="text-sm text-muted">{{ emptyMessage }}</p>
            <slot name="empty-action" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { formatCount, formatPoints, formatTime, fromEpochSeconds } from '~/utils/elections/format'

/**
 * The electorates that could still go either way.
 *
 * Ordered by margin, tightest first, with genuine ties above everything else --
 * a tie is not a small margin, it is an undecided seat.
 *
 * Renders whatever per-electorate results the store happens to hold. In
 * archived mode that is all of them, for the cost of the one results file the
 * page already fetched. During a live count it is whatever the open
 * subscription covers, which is why the empty state takes an action slot rather
 * than this component quietly subscribing to all 144 electorates itself.
 */
const props = withDefaults(defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    limit?: number
    emptyMessage?: string
}>(), {
    limit: 8,
    emptyMessage: 'Electorate results have not been loaded for this view yet.',
})

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const electoratesHref = computed(() => `/elections/${slugs.value.e}/${slugs.value.v}/electorates`)

const races = computed(() => {
    const results = [...store.computedElectorateResults(slugs.value.e, slugs.value.v).values()]

    return results
        // Only contests with a real margin to compare. An uncounted electorate
        // has no claim to being close.
        .filter(result => result.resultStatus === 'determined'
            || result.resultStatus === 'indeterminate')
        .sort((a, b) => {
            // Ties first: an undecided seat outranks any margin.
            const tieA = a.resultStatus === 'indeterminate' ? 0 : 1
            const tieB = b.resultStatus === 'indeterminate' ? 0 : 1
            if (tieA !== tieB) return tieA - tieB
            return (a.marginPercentage ?? Infinity) - (b.marginPercentage ?? Infinity)
        })
        .slice(0, props.limit)
        .map((result) => {
            const leader = result.firstPlace?.length === 1 ? result.firstPlace[0]! : null
            const candidate = leader === null
                ? null
                : store.candidate(slugs.value.e, slugs.value.v, leader)
            const party = candidate?.party ?? null

            return {
                electorate: result.electorate,
                name: nameFor(result.electorate),
                href: `/elections/${slugs.value.e}/${slugs.value.v}/electorates/${result.electorate}`,
                colour: store.partyColour(slugs.value.e, slugs.value.v, party),
                leader: result.resultStatus === 'indeterminate'
                    ? 'Leading candidates tied'
                    : candidate?.name ?? 'No leading candidate',
                margin: result.resultStatus === 'indeterminate'
                    ? 'Tied'
                    : `${formatCount(result.margin)}`,
                points: result.resultStatus === 'indeterminate'
                    ? ''
                    : formatPoints(result.marginPercentage) ?? '',
            }
        })
})

function nameFor(electorate: EntityNumber): string {
    return store.electorate(slugs.value.e, slugs.value.v, electorate)?.name ?? 'Unknown electorate'
}

/** The newest electorate tally behind this list, which is what it is "as at". */
const asAt = computed(() => {
    let newest: number | null = null
    let anyProvisional = false

    for (const set of store.allResults(slugs.value.e, slugs.value.v)) {
        if (set.results_level !== 'electorate' || set.results_category !== 'candidate_votes') continue
        if (!set.is_final) anyProvisional = true
        if (set.updated_timestamp === null) continue
        if (newest === null || set.updated_timestamp > newest) newest = set.updated_timestamp
    }

    if (!anyProvisional) return null
    return formatTime(fromEpochSeconds(newest))
})
</script>
