<template>
    <ElectionsLayoutDashboardPage :breadcrumb="breadcrumbItems" :heading="primaryName">
        <template #heading>
            <div class="space-y-2">
                <h2 class="text-2xl font-bold">{{ primaryName }}</h2>
                <p v-if="secondaryName" class="text-muted">{{ secondaryName }}</p>

                <div v-if="homeElectorates.length" class="flex flex-wrap items-center gap-2 pt-1">
                    <span class="text-sm text-muted">{{ homeLabel }}</span>
                    <ElectionsVotingPlacesElectorateBadge v-for="number in homeElectorates" :key="number"
                        :election="election" :resultsVersion="resultsVersion" :electorate="number" />
                </div>

                <div v-if="otherElectorates.length" class="flex flex-wrap items-center gap-2">
                    <span class="text-sm text-muted">Also issuing votes for:</span>
                    <ElectionsVotingPlacesElectorateBadge v-for="number in otherElectorates" :key="number"
                        :election="election" :resultsVersion="resultsVersion" :electorate="number" />
                </div>
            </div>
        </template>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="lg:col-span-2 flex flex-col gap-4">
                <UCard v-if="loading" variant="subtle">
                    <div class="flex justify-center py-6">
                        <UProgress animation="swing" class="max-w-xs" />
                    </div>
                </UCard>

                <ElectionsResultsEmpty v-else-if="unavailable" :title="unavailable.title"
                    :description="unavailable.description" />

                <template v-else>
                    <UCard variant="subtle">
                        <div class="flex flex-col sm:flex-row sm:items-start gap-3">
                            <UFormField label="Votes" name="votes" class="sm:w-48">
                                <USelect v-model="voteType" :items="voteTypeItems" class="w-full" />
                            </UFormField>

                            <UFormField label="Electorate" name="electorate" class="flex-1"
                                :help="electorateHint">
                                <USelect v-model="electorateChoice" :items="electorateItems"
                                    class="w-full" />
                            </UFormField>
                        </div>
                    </UCard>

                    <ElectionsVotingPlacesPlaceResults :election="election"
                        :resultsVersion="resultsVersion" :sets="shownSets" :category="category"
                        :heading="resultsHeading" />
                </template>
            </div>

            <div class="flex flex-col gap-4">
                <UCard variant="subtle" :ui="{ body: 'p-0 sm:p-0' }">
                    <UAlert v-if="mapError" color="warning" variant="subtle"
                        icon="i-lucide-triangle-alert" title="The map could not be loaded"
                        :description="mapError" class="m-4" />
                    <div v-else class="h-64 p-4">
                        <ElectionsVotingPlacesPointMap :map-id="mapId" :latitude="latitude"
                            :longitude="longitude" :label="address" @error="mapError = $event" />
                    </div>
                </UCard>

                <UCard variant="subtle">
                    <dl class="flex flex-col gap-3 text-sm">
                        <div>
                            <dt class="text-muted">Voting place number</dt>
                            <dd class="tabular-nums">{{ votingPlaceNumber }}</dd>
                        </div>
                        <div>
                            <dt class="text-muted">Address</dt>
                            <dd>{{ address }}</dd>
                        </div>
                    </dl>

                    <!-- Said rather than left to be noticed: none of this is
                         held anywhere upstream, so its absence is a fact about
                         the data and not a gap on this page. -->
                    <p class="mt-3 text-xs text-muted">
                        Opening hours, and whether this place took advance votes, are not held here.
                    </p>
                </UCard>
            </div>
        </div>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type {
    ElectionSummary, EntityNumber, ResultsCategory, ResultsVersion, VotingPlaceHit,
} from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { useInjectedElectionSource, useResultsScope } from '~/composables/useElectionSource'

/**
 * What one voting place counted.
 *
 * The page a reader reaches from the finder, and the one place the dashboard
 * answers "and what happened at this hall". Two things about a voting place
 * shape the whole page.
 *
 * It issues ballots for more than one electorate -- its own general seat, the
 * Māori seat covering the same ground, and at an advance voting place others
 * besides -- so its party vote is several tallies and its candidate vote is a
 * different contest in each. Party votes can therefore be combined and
 * candidate votes cannot.
 *
 * And which electorates those are is not recorded anywhere: it is read back
 * off the tallies themselves. Only the general home seat is known
 * independently, from the place's own record.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

// Several thousand pages whose body a crawler never sees, because the address
// can only be resolved in the browser. Offering them to a search engine would
// promise information the fetched page does not contain.
definePageMeta({ robots: false })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const router = useRouter()
const store = useElectionDataStore()
const source = useInjectedElectionSource()

// Addressed by the Electoral Commission number, as every election-scoped entity
// is, and as the results themselves reference it.
const votingPlaceNumber = computed(() => Number(route.params.votingPlaceId))

/* ------------------------------------------------------------------ *
 * The place itself
 * ------------------------------------------------------------------ */

const indexName = useAlgoliaIndexName('ElectionVotingPlaces')
const algolia = useNuxtApp().$algolia

/**
 * Resolved from Algolia, which is the only source holding one place's record
 * without the several thousand around it.
 *
 * Client only, and so is the heading: InstantSearch cannot be server rendered
 * on Workers, and while a plain search could be, the rest of the page is
 * browser-bound anyway and one boundary is easier to reason about than two.
 *
 * `number` is filtered rather than queried. A text query for "4206" ranks
 * matches, and an identity lookup wants the record or nothing.
 */
const { data: hit, status: hitStatus } = await useAsyncData(
    () => `voting-place-${props.resultsVersion.id}-${votingPlaceNumber.value}`,
    () => algolia.initIndex(indexName).search<VotingPlaceHit>('', {
        filters: `results_version:"${props.resultsVersion.id}" AND number=${votingPlaceNumber.value}`,
        hitsPerPage: 1,
    }).then(response => response.hits[0] ?? null),
    { watch: [votingPlaceNumber], server: false },
)

/**
 * The reference record, where voting place reference data happens to be loaded.
 *
 * A fallback rather than the main path: it arrives only once something has
 * fetched the whole version's places, which this page does not do. When it is
 * there it is the better answer, being the same data Django published.
 */
const reference = computed(() =>
    store.votingPlace(props.election.slug, props.resultsVersion.slug, votingPlaceNumber.value))

const address = computed(() =>
    reference.value?.address ?? hit.value?.address ?? `Voting place ${votingPlaceNumber.value}`)

const latitude = computed(() =>
    reference.value?.latitude ?? hit.value?.latitude ?? hit.value?._geoloc?.lat ?? null)
const longitude = computed(() =>
    reference.value?.longitude ?? hit.value?.longitude ?? hit.value?._geoloc?.lng ?? null)

/**
 * The address split at the first comma.
 *
 * A place has no name; the address is the only identifying string it has, and
 * it is written venue first -- "Grey Lynn Primary School, 44 Surrey Crescent,
 * Grey Lynn". So the leading fragment is the closest thing to a name, and the
 * rest is where it is. A place recorded as a bare street address has no comma
 * and simply gets no subheading.
 */
const primaryName = computed(() => {
    const comma = address.value.indexOf(',')
    return comma === -1 ? address.value : address.value.slice(0, comma).trim()
})

const secondaryName = computed(() => {
    const comma = address.value.indexOf(',')
    return comma === -1 ? null : address.value.slice(comma + 1).trim() || null
})

/*
 * Only a genuine 404 once the search has answered.
 *
 * A number not resolved yet is not a missing page, and nor is one whose
 * reference record is loaded while Algolia has not caught up. A search that
 * failed outright says nothing either way, so it is left alone rather than
 * turned into a missing page.
 *
 * `showError` rather than a thrown `createError`, which is what the sibling
 * entity pages use: they decide during setup, where a throw reaches Nuxt. The
 * answer here arrives from a browser-only request after setup has returned,
 * and a throw in a watcher is an unhandled rejection that leaves the page up.
 */
watch([hit, hitStatus, reference], ([found, status, fallback]) => {
    if (status === 'success' && !found && !fallback) {
        showError(createError({
            statusCode: 404,
            statusMessage: `Page not found: voting place ${votingPlaceNumber.value}`,
            fatal: true,
        }))
    }
}, { immediate: true })

/* ------------------------------------------------------------------ *
 * Results, and the electorates they reveal
 * ------------------------------------------------------------------ */

// Two documents per electorate the place served, released when the page closes.
useResultsScope(() => ({ kind: 'voting-place', votingPlace: votingPlaceNumber.value }))

watch(votingPlaceNumber, (number) => {
    source?.loadVotingPlaceResults(number)
}, { immediate: true })

const sets = computed(() =>
    store.resultsForVotingPlace(
        props.election.slug, props.resultsVersion.slug, votingPlaceNumber.value))

const electorateNumbers = computed(() => [...new Set(
    sets.value.map(set => set.electorate).filter((value): value is EntityNumber => value !== null),
)].sort((a, b) => a - b))

/**
 * The general seat the place stands in.
 *
 * Recorded, unlike the rest: `physical_electorate` on the place's own record,
 * which the Algolia index denormalises as `electorate_number`. The tallies
 * carry it too, as `voting_place_electorate`, which is what answers before the
 * Algolia hit lands.
 */
const homeGeneral = computed(() => (
    hit.value?.electorate_number
    ?? reference.value?.physical_electorate
    ?? sets.value.find(set => set.voting_place_electorate !== null)?.voting_place_electorate
    ?? null
))

const electorateType = (number: EntityNumber) =>
    store.persistentElectorateFor(props.election.slug, props.resultsVersion.slug, number)
        ?.electorate_type ?? null

/**
 * The Māori seat covering the same ground, where it can be identified.
 *
 * Nothing records it -- a voting place has one physical electorate and it is
 * the general one -- so it is read off the tallies: the Māori electorate this
 * place issued votes for. Claimed only where exactly one qualifies. An advance
 * voting place issuing several Māori electorates' ballots has no home among
 * them that this data can distinguish, and guessing at one would be a claim
 * about the place rather than a reading of it, so they all go below instead.
 */
const homeMaori = computed(() => {
    const maori = electorateNumbers.value.filter(number => electorateType(number) === 'maori')
    return maori.length === 1 ? maori[0]! : null
})

const homeElectorates = computed(() =>
    [homeGeneral.value, homeMaori.value]
        .filter((value): value is EntityNumber => value !== null)
        // A home seat the place reported nothing for is still its home seat,
        // but one that is not in the data at all cannot be named here.
        .filter((value, index, all) => all.indexOf(value) === index))

const otherElectorates = computed(() =>
    electorateNumbers.value.filter(number => !homeElectorates.value.includes(number)))

const homeLabel = computed(() =>
    (homeElectorates.value.length === 1 ? 'Home electorate:' : 'Home electorates:'))

/* ------------------------------------------------------------------ *
 * What the reader has asked to see
 * ------------------------------------------------------------------ */

const ALL_ELECTORATES = 'all'

const voteTypeItems = [
    { label: 'Party votes', value: 'party' },
    { label: 'Candidate votes', value: 'candidate' },
]

const voteType = ref<'party' | 'candidate'>(
    route.query.votes === 'candidate' ? 'candidate' : 'party')

const electorateChoice = ref<string>(
    typeof route.query.electorate === 'string' ? route.query.electorate : ALL_ELECTORATES)

const category = computed<ResultsCategory>(() =>
    (voteType.value === 'candidate' ? 'candidate_votes' : 'party_votes'))

const electorateName = (number: EntityNumber) =>
    store.electorate(props.election.slug, props.resultsVersion.slug, number)?.name
    ?? `Electorate ${number}`

/**
 * Party votes may be combined, candidate votes may not.
 *
 * The party vote is the same contest wherever it was cast, so the place's own
 * figure is the sum of every electorate it issued for. Candidate votes are a
 * different contest in each, with different candidates on the paper, so there
 * is nothing to add and no "all" option to offer.
 */
const electorateItems = computed(() => {
    const options = electorateNumbers.value.map(number => ({
        label: electorateName(number),
        value: String(number),
    }))

    return voteType.value === 'party'
        ? [{ label: 'All electorates', value: ALL_ELECTORATES }, ...options]
        : options
})

const electorateHint = computed(() => (voteType.value === 'party'
    ? 'Party votes are the same contest in every electorate, so they can be combined.'
    : 'Each electorate had its own candidates, so one must be chosen.'))

// Choosing candidate votes while showing all electorates has to land somewhere,
// and the place's own seat is the one a reader is most likely to have come for.
watch([voteType, electorateNumbers], ([type, numbers]) => {
    if (type === 'party') return
    if (electorateChoice.value !== ALL_ELECTORATES
        && numbers.includes(Number(electorateChoice.value))) return

    const preferred = homeGeneral.value !== null && numbers.includes(homeGeneral.value)
        ? homeGeneral.value
        : numbers[0]
    electorateChoice.value = preferred === undefined ? ALL_ELECTORATES : String(preferred)
}, { immediate: true })

/** A shareable URL. Replaced, not pushed: a toggle should not fill the back button. */
watch([voteType, electorateChoice], ([type, electorate]) => {
    const next = { ...route.query }
    if (type === 'candidate') next.votes = 'candidate'
    else delete next.votes
    if (electorate !== ALL_ELECTORATES) next.electorate = electorate
    else delete next.electorate

    router.replace({ query: next })
})

const shownSets = computed(() => {
    const ofCategory = sets.value.filter(set => set.results_category === category.value)
    if (electorateChoice.value === ALL_ELECTORATES) return ofCategory

    const chosen = Number(electorateChoice.value)
    return ofCategory.filter(set => set.electorate === chosen)
})

const resultsHeading = computed(() => {
    const noun = voteType.value === 'candidate' ? 'Candidate votes' : 'Party votes'
    if (electorateChoice.value === ALL_ELECTORATES) {
        return electorateNumbers.value.length > 1 ? `${noun}, all electorates` : noun
    }
    return `${noun}, ${electorateName(Number(electorateChoice.value))}`
})

/* ------------------------------------------------------------------ *
 * When there is nothing to show, and why
 * ------------------------------------------------------------------ */

/**
 * Published, asked for, and not yet arrived.
 *
 * Checked against the store rather than against the request, so a page
 * revisited once the file has landed does not flash a spinner it does not need.
 */
const loading = computed(() => (
    !sets.value.length
    && Boolean(source?.votingPlacePagesAvailable.value)
    && !store.hasPlaceResults(
        props.election.slug, props.resultsVersion.slug, votingPlaceNumber.value)
))

/**
 * The reasons a reader sees no figures, kept apart from each other.
 *
 * "Not published" and "nothing counted here" are different facts, and both are
 * ordinary. Collapsing them into one empty state would tell a reader the place
 * reported nothing when the truth is that nobody asked Django to publish it.
 */
const unavailable = computed(() => {
    if (sets.value.length || loading.value) return null

    if (!source?.votingPlacePagesAvailable.value) {
        return {
            title: 'Results for this voting place are not published',
            description: 'This results version was published without per-voting-place '
                + 'figures. The electorate results cover this place.',
        }
    }

    return {
        title: 'Nothing was counted at this voting place',
        description: 'No votes have been reported for this place in this version of the results.',
    }
})

/* ------------------------------------------------------------------ *
 * Framing
 * ------------------------------------------------------------------ */

const mapId = computed(() => `voting-place-${props.resultsVersion.id}-${votingPlaceNumber.value}`)
const mapError = ref('')

const breadcrumbItems = computed(() => [
    {
        label: 'Voting places',
        to: `/elections/${props.election.slug}/${props.resultsVersion.slug}/voting-places`,
        icon: 'i-lucide-map-pin',
    },
    { label: primaryName.value },
])

usePageSeo({
    title: computed(() => `${address.value} — ${props.election.name}`),
    description: computed(() =>
        `Votes counted at ${address.value} at the ${props.election.name}.`),
})
</script>
