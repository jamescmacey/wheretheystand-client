<template>
    <UCard variant="soft">
        <template #header>
            <h3 class="font-bold">Who shares in the list seats</h3>
        </template>

        <div class="space-y-4">
            <div>
                <p class="text-sm text-muted mb-2">
                    Qualified — {{ qualifiedLabel }}
                </p>
                <ul class="space-y-1">
                    <li v-for="party in qualified" :key="party.party" class="flex items-center gap-2 text-sm">
                        <ElectionsResultsPartySwatch :colour="colourFor(party.party)" />
                        <span class="truncate">{{ nameFor(party.party) }}</span>
                        <span class="text-muted">{{ reasonFor(party) }}</span>
                    </li>
                </ul>
            </div>

            <template v-if="excluded.length">
                <USeparator />
                <div>
                    <p class="text-sm text-muted mb-2">
                        Did not qualify — below {{ thresholdLabel }} of the party vote and won no electorate
                    </p>
                    <ul class="space-y-1">
                        <li v-for="party in excluded" :key="party.party"
                            class="flex items-center gap-2 text-sm text-muted">
                            <span class="truncate">{{ nameFor(party.party) }}</span>
                            <span>{{ formatPercent(party.share) }}</span>
                        </li>
                    </ul>
                </div>
            </template>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { PartyQualification, SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore } from '~/stores/electionData'
import { formatPercent, pluralise } from '~/utils/elections/format'

/**
 * Which parties shared in the list seats, and on which limb they qualified.
 *
 * The coattail rule is the least understood part of MMP and the one that most
 * often decides a Parliament, so the reason is stated per party rather than
 * left to be inferred from a table of numbers.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const nameFor = (party: EntityNumber) =>
    store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party'
const colourFor = (party: EntityNumber) =>
    store.partyColour(slugs.value.e, slugs.value.v, party)

const qualified = computed(() => props.allocation.qualification
    .filter(party => party.qualified)
    .sort((a, b) => b.votes - a.votes))

// Only parties that actually stood for the party vote and missed; the long tail
// of parties on a handful of votes is not an interesting list.
const excluded = computed(() => props.allocation.qualification
    .filter(party => !party.qualified && party.votes > 0)
    .sort((a, b) => b.votes - a.votes))

const thresholdLabel = computed(() =>
    formatPercent(props.allocation.settings.threshold * 100, 0))

const qualifiedLabel = computed(() =>
    `${pluralise(qualified.value.length, 'party', 'parties')} sharing in the list seats`)

function reasonFor(party: PartyQualification): string {
    if (party.reason === 'threshold') return `${formatPercent(party.share)} of the party vote`
    if (party.reason === 'electorate-seat') {
        return `${formatPercent(party.share)}, but won ${pluralise(party.electorateSeats, 'electorate')}`
    }
    return formatPercent(party.share) ?? ''
}
</script>
