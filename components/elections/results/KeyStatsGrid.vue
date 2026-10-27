<template>
    <div v-if="stats.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <UCard v-for="stat in stats" :key="stat.label" variant="subtle">
            <p class="text-xs uppercase text-muted truncate">{{ stat.label }}</p>
            <p class="text-xl lg:text-2xl font-bold tabular-nums">{{ stat.value }}</p>
            <p v-if="stat.note" class="text-xs text-muted truncate">{{ stat.note }}</p>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { useElectionShape } from '~/composables/useElectionShape'
import { formatCount, formatPercent, pluralise } from '~/utils/elections/format'

/**
 * The handful of figures worth seeing before any table.
 *
 * Deliberately not "every statistic the feed carries": the Commission publishes
 * fourteen, most of which are only interesting once you already have a
 * question. What goes here are the four that describe how far along the count
 * is and how many people voted.
 *
 * A tile is omitted rather than shown empty. During a live count several of
 * these are genuinely unknown for the first hour, and "—" four times over is
 * worse than a shorter row.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const store = useElectionDataStore()
const { hasPartyVote, soleElectorate } = useElectionShape()

/**
 * Where the event-wide figures come from.
 *
 * A general election has a national tally and that is the answer. A by-election
 * does not, and the national record published alongside one cannot be trusted
 * to describe it: the 2025 Tāmaki Makaurau by-election carries 69,420 in
 * `total_votes_cast` at national level against 10,688 actually cast in the
 * electorate -- a figure which, shown beside a turnout of 24.1 per cent, would
 * imply an electorate of nearly 300,000 people. The electorate's own set is the
 * only description of a by-election worth reading.
 */
const statistics = computed(() => {
    const slugs = { e: props.election.slug, v: props.resultsVersion.slug }

    if (hasPartyVote.value) {
        const national = store.nationalResults(slugs.e, slugs.v, 'party_votes')
            ?? store.nationalResults(slugs.e, slugs.v, 'candidate_votes')
        if (national) return national.statistics
    }

    const electorate = soleElectorate.value?.number ?? null
    if (electorate !== null) {
        const set = store.electorateResults(slugs.e, slugs.v, electorate, 'candidate_votes')
        if (set) return set.statistics
    }

    const [first] = store.allResults(slugs.e, slugs.v)
        .filter(set => set.results_level === 'electorate'
            && set.results_category === 'candidate_votes')
    return first?.statistics ?? null
})

const stats = computed(() => {
    const held = statistics.value
    if (!held) return []

    const rows: { label: string, value: string, note?: string | null }[] = []

    const votes = formatCount(held.total_votes_cast)
    if (votes) rows.push({ label: 'Votes cast', value: votes })

    const turnout = formatPercent(held.percent_votes_cast)
    if (turnout) {
        rows.push({
            label: 'Turnout',
            value: turnout,
            note: held.total_issued_ballot_papers
                ? `${formatCount(held.total_issued_ballot_papers)} ballot papers issued`
                : null,
        })
    }

    if (hasPartyVote.value && held.total_electorates_final !== null) {
        rows.push({
            label: 'Electorates final',
            value: formatCount(held.total_electorates_final) ?? '0',
            note: formatPercent(held.percent_electorates_final),
        })
    }

    const informals = held.total_party_informals ?? held.total_candidate_informals
    if (informals !== null && informals !== undefined) {
        rows.push({
            label: 'Informal votes',
            value: formatCount(informals) ?? '0',
            note: held.total_special_votes
                ? `${pluralise(held.total_special_votes, 'special vote')}`
                : null,
        })
    }

    return rows
})
</script>
