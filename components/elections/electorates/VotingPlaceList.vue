<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex flex-col gap-2">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 class="font-bold">Voting places</h3>
                    <span v-if="places.length" class="text-sm text-muted">{{ countLabel }}</span>
                </div>
                <UInput v-if="places.length" v-model="search" icon="i-lucide-search" size="sm"
                    placeholder="Search voting places" aria-label="Search voting places"
                    class="w-full sm:max-w-64" />
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
                <ul v-if="shown.length" class="flex flex-col gap-2 max-h-[32rem] overflow-y-auto">
                    <li v-for="place in shown" :key="place.number">
                        <NuxtLink :to="place.to"
                            class="block rounded-md ring ring-default bg-default p-3 hover:bg-elevated transition-colors">
                            <p class="font-medium text-highlighted">{{ place.name }}</p>
                            <p v-if="place.rest" class="text-sm text-muted">{{ place.rest }}</p>

                            <!-- A Māori seat's places all stand in some general
                                 seat, so which one is information, not a flag. -->
                            <div v-if="isMaori && place.standsIn !== null" class="mt-2">
                                <ElectionsEntityElectorateBadge :election="election"
                                    :resultsVersion="resultsVersion" :electorate="place.standsIn"
                                    :link="false" />
                            </div>
                            <div v-else-if="place.away && place.standsIn !== null"
                                class="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                                <span>Located in</span>
                                <ElectionsEntityElectorateBadge :election="election"
                                    :resultsVersion="resultsVersion" :electorate="place.standsIn"
                                    :link="false" />
                            </div>
                        </NuxtLink>
                    </li>
                </ul>

                <UEmpty v-else icon="i-lucide-search-x" title="No matching voting places"
                    :description="`Nothing in this electorate's list matches “${search.trim()}”.`" />
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
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { ElectorateVotingPlace } from '~/composables/useElectorateVotingPlaces'
import { pluralise } from '~/utils/elections/format'

/**
 * Every voting place that counted votes for this electorate.
 *
 * Read off the tallies rather than from the places' own records, because that
 * is the question an electorate's page asks: not which halls stand inside the
 * boundary, but which of them this seat's figures are made of. At a general
 * election those are not the same list -- an advance voting place anywhere in
 * the country issues ballots for any electorate -- so a place outside the seat
 * says where it stands rather than looking misfiled.
 *
 * The places are worked out by `useElectorateVotingPlaces` on the page, which
 * hands the same list to the map.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    places: ElectorateVotingPlace[]
    isMaori: boolean
    available: boolean
    loading: boolean
}>()

const search = ref('')

/**
 * The address split at the first comma, as on the voting place's own page: a
 * place has no name, and the address is written venue first, so the leading
 * fragment is the closest thing to one.
 */
const named = computed(() => props.places.map((place) => {
    const comma = place.address.indexOf(',')
    return {
        ...place,
        name: comma === -1 ? place.address : place.address.slice(0, comma).trim(),
        rest: comma === -1 ? null : place.address.slice(comma + 1).trim() || null,
        haystack: place.address.toLocaleLowerCase('en-NZ'),
    }
}))

/** Every word must appear somewhere in the address, in any order. */
const shown = computed(() => {
    const words = search.value.toLocaleLowerCase('en-NZ').split(/\s+/).filter(Boolean)
    if (!words.length) return named.value
    return named.value.filter(place => words.every(word => place.haystack.includes(word)))
})

const countLabel = computed(() => (shown.value.length === props.places.length
    ? pluralise(props.places.length, 'voting place')
    : `${shown.value.length} of ${pluralise(props.places.length, 'voting place')}`))
</script>
