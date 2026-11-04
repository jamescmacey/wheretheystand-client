<template>
    <div v-if="source" class="flex flex-wrap items-end gap-x-6 gap-y-2">
        <ElectionsResultsStatusIndicator :mode="source.mode.value" :connection="source.connection.value"
            :last-updated="lastUpdated" :live-ended="source.liveEnded.value" />
        <ElectionsResultsCountedProgress v-if="progress" :percent="percentCounted" :counted="votingPlacesCounted"
            :total="votingPlacesTotal" />
        <slot />
    </div>
</template>

<script setup lang="ts">
import type { EntityNumber, ResultsSet } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { useElectionShape } from '~/composables/useElectionShape'
import { useInjectedElectionSource } from '~/composables/useElectionSource'

/**
 * Where the figures on this page came from, and how far along their count is.
 *
 * `electorate` narrows every figure to one seat. A page showing one
 * electorate's tables beside "100.0 per cent counted" and the time the national
 * document last changed states two things about the election and appears to
 * state them about the seat, which on the night is the difference between a
 * seat that has reported and one that has not.
 *
 * What is not narrowed is the transport: live or archived, connected or
 * reconnecting, is a fact about the dashboard rather than about any one
 * electorate, so it is read from the source either way.
 */
const props = withDefaults(defineProps<{
    electorate?: EntityNumber
    /**
     * Show how much of the count is done. Off where the page is about something
     * the statistics do not describe -- a single voting place has no share of
     * voting places counted.
     */
    progress?: boolean
}>(), { progress: true })

// Every view is now served by one transport or the other -- live from Firestore
// or archived from the snapshots -- so there is no "delayed" state to declare.
const source = useInjectedElectionSource()
const store = useElectionDataStore()

// Resolved from the route, as the layout does, rather than threaded through
// every page that mounts this bar.
const { election, resultsVersion } = useElectionShape()

const scoped = computed(() => props.electorate !== undefined)

/**
 * This seat's own tallies, the candidate contest first.
 *
 * Its statistics are the ones to show: an electorate's results document
 * carries how much of that electorate has been counted. Where a seat had no
 * candidate election the party vote is all there is, which is why this is a
 * list and not a lookup of one.
 */
const sets = computed<ResultsSet[]>(() => {
    const slugs = { e: election.value?.slug, v: resultsVersion.value?.slug }
    if (!scoped.value || !slugs.e || !slugs.v) return []

    return (['candidate_votes', 'party_votes'] as const)
        .map(category => store.electorateResults(slugs.e!, slugs.v!, props.electorate!, category))
        .filter((set): set is ResultsSet => Boolean(set))
})

/** The statistics shown, or null while this seat has reported nothing. */
const statistics = computed(() => sets.value[0]?.statistics ?? null)

const lastUpdated = computed(() => {
    if (!scoped.value) return source?.lastUpdated.value ?? null

    let newest: number | null = null
    for (const set of sets.value) {
        if (set.updated_timestamp === null) continue
        if (newest === null || set.updated_timestamp > newest) newest = set.updated_timestamp
    }
    return newest === null ? null : new Date(newest * 1000)
})

// Null rather than zero where the seat has nothing yet: the badge then renders
// nothing at all, where "0.0 per cent counted" would be a figure this page does
// not have.
const percentCounted = computed(() => (scoped.value
    ? statistics.value?.percent_voting_places_counted ?? null
    : source?.percentCounted.value ?? null))

const votingPlacesCounted = computed(() => (scoped.value
    ? statistics.value?.total_voting_places_counted ?? null
    : source?.votingPlacesCounted.value ?? null))

const votingPlacesTotal = computed(() => (scoped.value
    ? statistics.value?.total_voting_places ?? null
    : source?.votingPlacesTotal.value ?? null))
</script>
