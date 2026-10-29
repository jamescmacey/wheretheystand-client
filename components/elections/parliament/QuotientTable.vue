<template>
    <UCard variant="soft">
        <template #header>
            <h3 class="font-bold">How the seats were shared out</h3>
        </template>

        <p class="text-sm text-muted mb-4">
            Each party's votes are divided by {{ divisorLabel }}, and the
            {{ pluralise(awardedCount, 'highest result') }} each win a seat. The last seat
            awarded went to {{ lastAwardedLabel }}.
        </p>

        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-left text-muted uppercase text-xs">
                        <th class="py-2 pr-3">Rank</th>
                        <th class="py-2 pr-3">Party</th>
                        <th class="py-2 pr-3 text-right">Divisor</th>
                        <th class="py-2 pr-3 text-right">Quotient</th>
                        <th class="py-2 text-right">Seat</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="quotient in shown" :key="`${quotient.party}-${quotient.seat}`"
                        class="border-t border-default/50"
                        :class="quotient.awarded ? '' : 'text-muted'">
                        <td class="py-1.5 pr-3 tabular-nums">{{ quotient.rank }}</td>
                        <td class="py-1.5 pr-3">
                            <div class="flex items-center gap-2 min-w-0">
                                <ElectionsResultsPartySwatch :colour="colourFor(quotient.party)" />
                                <span class="truncate">{{ nameFor(quotient.party) }}</span>
                            </div>
                        </td>
                        <td class="py-1.5 pr-3 text-right tabular-nums">{{ quotient.divisor }}</td>
                        <td class="py-1.5 pr-3 text-right tabular-nums">{{ formatCount(Math.round(quotient.value)) }}</td>
                        <td class="py-1.5 text-right">
                            <UBadge v-if="quotient.awarded" color="primary" variant="subtle" size="sm">Won</UBadge>
                            <span v-else>—</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p class="mt-3 text-sm text-muted">
            Showing the {{ window }} quotients either side of the last seat.
        </p>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore } from '~/stores/electionData'
import { formatCount, pluralise } from '~/utils/elections/format'

/**
 * The arithmetic behind the allocation, around the point where it mattered.
 *
 * Six hundred quotients is not a table anyone reads. The interesting ones are
 * those either side of the cut: they are what shows how close the last seat was,
 * and which party would have taken it next.
 */
const props = withDefaults(defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
    window?: number
}>(), { window: 8 })

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const nameFor = (party: EntityNumber) =>
    store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party'
const colourFor = (party: EntityNumber) =>
    store.partyColour(slugs.value.e, slugs.value.v, party)

const awardedCount = computed(() =>
    props.allocation.quotients.filter(quotient => quotient.awarded).length)

const shown = computed(() => {
    const all = props.allocation.quotients
    const cut = awardedCount.value
    return all.slice(Math.max(0, cut - props.window), cut + props.window)
})

const divisorLabel = computed(() =>
    (props.allocation.settings.formula === 'dhondt' ? '1, 2, 3 and so on' : '1, 3, 5 and so on'))

const lastAwardedLabel = computed(() => {
    const last = props.allocation.quotients[awardedCount.value - 1]
    return last ? nameFor(last.party) : 'nobody'
})
</script>
