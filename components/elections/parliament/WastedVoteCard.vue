<template>
    <UCard variant="soft">
        <template #header>
            <h3 class="font-bold">Wasted vote</h3>
        </template>

        <p v-if="!wasted" class="text-sm text-muted">No votes have been counted yet.</p>

        <div v-else class="space-y-4">
            <div>
                <p class="text-3xl font-bold tabular-nums">{{ formatPercent(wasted.share) }}</p>
                <p class="text-sm text-muted">
                    {{ formatCount(wasted.total) }} of {{ formatCount(wasted.votesCast) }}
                    {{ isFinal ? 'votes cast' : 'votes counted so far' }} had no effect on Parliament
                </p>
            </div>

            <dl class="space-y-1 text-sm">
                <div class="flex justify-between gap-3">
                    <dt class="text-muted">Parties that did not qualify</dt>
                    <dd class="tabular-nums">{{ formatCount(wasted.partyVotes) }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                    <dt class="text-muted">Informal votes</dt>
                    <dd class="tabular-nums">{{ formatCount(wasted.informals) }}</dd>
                </div>
                <div v-if="comparison" class="flex justify-between gap-3">
                    <dt class="text-muted">{{ label }}</dt>
                    <dd class="tabular-nums">{{ comparison }}</dd>
                </div>
            </dl>

            <p v-if="!isFinal" class="text-xs text-muted">
                {{ label ? `${label} is the final count. ` : '' }}Special votes are still to come.
            </p>

            <USeparator />

            <div v-if="gallagher !== null">
                <p class="flex items-baseline justify-between gap-3">
                    <span class="font-medium">Gallagher Index</span>
                    <span class="text-lg font-bold tabular-nums">{{ gallagher.toFixed(2) }}</span>
                </p>
                <p class="text-sm text-muted">
                    How far seats are from votes: 0 is perfectly proportional, and higher is less so.
                </p>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'
import { useComparison } from '~/composables/useComparison'
import { useMmpSettings } from '~/composables/useMmpSettings'
import { useElectionDataStore } from '~/stores/electionData'
import { gallagherIndex, nationalInformals, wastedVote } from '~/utils/elections/disproportionality'
import { formatCount, formatPercent, formatPoints } from '~/utils/elections/format'

/**
 * The votes that did not reach Parliament, and how proportional the result is.
 *
 * Read from the allocation, so a reader's own rules move these figures with the
 * seats. The comparison is of two official results, so it goes when they do.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const { isOfficial } = useMmpSettings()
const { comparison: comparisonData, label } = useComparison(
    () => props.election, () => props.resultsVersion)

const national = computed(() =>
    store.nationalResults(props.election.slug, props.resultsVersion.slug, 'party_votes'))

const isFinal = computed(() => national.value?.is_final ?? false)

const wasted = computed(() => wastedVote({
    informals: (national.value ? nationalInformals(national.value) : null) ?? 0,
    nonQualifyingVotes: props.allocation.qualification
        .filter(party => !party.qualified)
        .reduce((sum, party) => sum + party.votes, 0),
    validVotes: props.allocation.totalPartyVotes,
}))

/**
 * The same figure last time, from the seats that election actually returned.
 *
 * Hidden where the file has no votes cast, because a share with no informals in
 * it is not the same figure.
 */
const lastTime = computed(() => {
    const tally = comparisonData.value?.national.party_votes
    const cast = tally?.total_votes_cast ?? null
    if (!tally || cast === null) return null
    if (!tally.parties.some(party => party.total_seats)) return null

    return wastedVote({
        informals: cast - tally.total_valid_votes,
        nonQualifyingVotes: tally.parties
            .filter(party => !party.total_seats)
            .reduce((sum, party) => sum + (party.count ?? 0), 0),
        validVotes: tally.total_valid_votes,
    })
})

const comparison = computed(() => {
    const now = wasted.value
    const then = lastTime.value
    if (!isOfficial.value || !now || !then) return null

    const share = formatPercent(then.share)
    const change = Math.round((now.share - then.share) * 10) / 10
    if (change === 0) return `${share}, unchanged`
    return `${share}, ${change > 0 ? 'up' : 'down'} ${formatPoints(Math.abs(change))}`
})

const gallagher = computed(() => gallagherIndex(
    props.allocation.qualification.map(party => ({
        votes: party.votes,
        seats: props.allocation.totalSeats.get(party.party) ?? 0,
    })),
    props.allocation.members.filter(member => member.party === null).length,
))
</script>
