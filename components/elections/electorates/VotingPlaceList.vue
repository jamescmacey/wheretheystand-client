<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h3 class="font-bold">Voting places</h3>
                <span v-if="places.length" class="text-sm text-muted">{{ countLabel }}</span>
            </div>
        </template>

        <ClientOnly>
            <template #fallback>
                <div class="flex justify-center py-6">
                    <UProgress animation="swing" class="max-w-xs" />
                </div>
            </template>

            <!-- The list leads, because a tally that reached the store is a
                 tally to show: a live count can deliver voting place figures that
                 no published shard carries. -->
            <template v-if="places.length">
                <!-- Capped rather than run out to several hundred entries: at a
                     general election every advance voting place that issued a ballot
                     for this electorate is one of these, wherever in the country it
                     stood. -->
                <ul class="flex flex-col gap-2 max-h-[32rem] overflow-y-auto">
                    <li v-for="place in places" :key="place.number">
                        <NuxtLink :to="place.to"
                            class="block rounded-md ring ring-default bg-default p-3 hover:bg-elevated transition-colors">
                            <p class="font-medium text-highlighted">{{ place.address }}</p>
                            <div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                                <UBadge variant="subtle" color="neutral" size="sm">
                                    Place {{ place.number }}
                                </UBadge>
                                <span v-if="place.away">Issued votes for this electorate</span>
                            </div>
                        </NuxtLink>
                    </li>
                </ul>
            </template>

            <div v-else-if="loading" class="flex justify-center py-6">
                <UProgress animation="swing" class="max-w-xs" />
            </div>

            <UEmpty v-else-if="!available" icon="i-lucide-inbox"
                title="Voting places are not published for this results version"
                description="This results version was published without per-voting-place figures." />

            <UEmpty v-else icon="i-lucide-inbox" title="No voting places reported yet"
                description="No voting place has reported votes for this electorate in this version of the results." />
        </ClientOnly>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { useInjectedElectionSource } from '~/composables/useElectionSource'
import { pluralise } from '~/utils/elections/format'

/**
 * Every voting place that counted votes for this electorate.
 *
 * Read off the tallies rather than from the places' own records, because that
 * is the question an electorate's page asks: not which halls stand inside the
 * boundary, but which of them this seat's figures are made of. At a general
 * election those are not the same list -- an advance voting place anywhere in
 * the country issues ballots for any electorate -- so a place outside the seat
 * is marked rather than left looking misfiled.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: EntityNumber
}>()

const store = useElectionDataStore()
const source = useInjectedElectionSource()

const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

/**
 * Asked for in the browser, and only when a reader reaches this page.
 *
 * Two files, and the larger is every voting place in the election: fetching
 * them while rendering on the server would put a megabyte nobody has asked to
 * see inside each electorate page's own response, on the night when the pages
 * are served most. The card renders a spinner on the server for the same
 * reason the finder does -- one state on both sides of hydration.
 */
watch(() => props.electorate, (electorate) => {
    if (import.meta.server) return
    source?.loadVotingPlaces(electorate)
}, { immediate: true })

const available = computed(() => Boolean(source?.votingPlaceResultsAvailable.value))

const loaded = computed(() =>
    store.hasVotingPlaceResults(slugs.value.e, slugs.value.v, props.electorate))

const places = computed(() => {
    const numbers = new Set<EntityNumber>()
    for (const category of ['candidate_votes', 'party_votes'] as const) {
        for (const set of store.votingPlaceResults(
            slugs.value.e, slugs.value.v, props.electorate, category)) {
            if (set.voting_place !== null) numbers.add(set.voting_place)
        }
    }

    return [...numbers]
        .map((number) => {
            const reference = store.votingPlace(slugs.value.e, slugs.value.v, number)
            return {
                number,
                address: reference?.address ?? `Voting place ${number}`,
                // Null where the place's own record has not been loaded, which
                // is not the same as standing elsewhere, so it claims nothing.
                away: reference?.physical_electorate != null
                    && reference.physical_electorate !== props.electorate,
                to: `/elections/${slugs.value.e}/${slugs.value.v}/voting-places/${number}`,
            }
        })
        // By address, which is the only name a voting place has.
        .sort((a, b) => a.address.localeCompare(b.address, 'en-NZ'))
})

// A spinner only while the shard is in flight: a page revisited once it has
// landed shows the list at once, and a version without these files never
// spins at all.
const loading = computed(() => available.value && !loaded.value && !places.value.length)

const countLabel = computed(() => pluralise(places.value.length, 'voting place'))
</script>
