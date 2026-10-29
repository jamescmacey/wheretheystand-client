<template>
    <UAlert v-if="differences.length" color="warning" variant="subtle" icon="i-lucide-git-compare"
        title="These seats differ from the ones the Electoral Commission reported">
        <template #description>
            <ul class="mt-1 space-y-0.5">
                <li v-for="row in differences" :key="row.party">
                    {{ row.name }}: {{ row.ours }} here, {{ row.theirs }} reported
                </li>
            </ul>
        </template>
    </UAlert>
    <p v-else-if="hasOfficial" class="text-sm text-muted">
        These seats match the ones the Electoral Commission reported.
    </p>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * Our arithmetic against the Commission's own.
 *
 * The dashboard shows its own allocation everywhere, so that changing a setting
 * changes every number consistently. That makes this the one place the two can
 * be compared -- and under the official settings they should never differ. If
 * they do, it is worth a reader knowing rather than being quietly reconciled.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const official = computed(() =>
    store.nationalResults(slugs.value.e, slugs.value.v, 'party_votes')?.results ?? [])

// The feed carries seat columns only once it has any to report.
const hasOfficial = computed(() =>
    official.value.some(result => result.total_seats !== null))

const differences = computed(() => {
    if (!hasOfficial.value) return []

    const rows: { party: number, name: string, ours: number, theirs: number }[] = []
    for (const result of official.value) {
        if (result.party === null) continue
        const theirs = result.total_seats ?? 0
        const ours = props.allocation.totalSeats.get(result.party) ?? 0
        if (ours === theirs) continue
        rows.push({
            party: result.party,
            name: store.party(slugs.value.e, slugs.value.v, result.party)?.name ?? 'Unknown party',
            ours,
            theirs,
        })
    }
    return rows
})
</script>
