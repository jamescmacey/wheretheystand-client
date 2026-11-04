<template>
    <ElectionsLayoutDashboardPage :breadcrumb="breadcrumbItems" :statusElectorate="electorateNumber">
        <!-- The seat's history belongs with its name rather than below the
             tables, which are about this election alone. -->
        <template #heading>
            <div v-if="electorate" class="space-y-1">
                <h2>
                    <ElectionsEntityElectorateBadge :election="election" :resultsVersion="resultsVersion"
                        :electorate="electorateNumber" :link="false" size="lg" />
                </h2>
                <!-- The badge's colour says this too, which nobody can read as
                     a colour: the seat's type is written out underneath it. -->
                <p v-if="typeLabel" class="text-sm text-muted">{{ typeLabel }}</p>
            </div>
            <ElectionsResultsIncumbencyNote v-if="electorate" :election="election"
                :resultsVersion="resultsVersion" :electorate="electorateNumber" />
        </template>

        <template v-if="electorate">
            <!-- Candidate votes first: the contest this electorate decides.
                 Side by side only once there is room for two results tables,
                 whose own columns stop making sense much below that -- and only
                 where there are two, since a by-election has no party vote and a
                 lone table stretched across half the page reads as a gap. -->
            <div class="grid grid-cols-1 gap-4 items-start"
                :class="hasPartyVote ? 'xl:grid-cols-2' : ''">
                <ElectionsResultsElectorateResults v-if="electorate.accepting_candidate_votes"
                    :election="election" :resultsVersion="resultsVersion" :electorate="electorateNumber"
                    category="candidate_votes" />
                <UAlert v-else color="warning" variant="subtle" icon="i-lucide-info"
                    title="No candidate election"
                    description="The candidate election in this electorate was cancelled, so only party votes were counted." />

                <ElectionsResultsElectorateResults v-if="hasPartyVote" :election="election"
                    :resultsVersion="resultsVersion" :electorate="electorateNumber" category="party_votes" />
            </div>

            <!-- The map is the smaller half and leads on a phone, where a list
                 of several hundred addresses above it would bury it. -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div class="order-1 lg:order-2">
                    <UCard variant="subtle">
                        <ElectionsElectoratesBoundaryMap :key="mapId" :election="election"
                            :resultsVersion="resultsVersion" :electorate="electorateNumber"
                            :map-id="mapId" />
                    </UCard>
                </div>

                <div class="order-2 lg:order-1 lg:col-span-2">
                    <ElectionsElectoratesVotingPlaceList :election="election"
                        :resultsVersion="resultsVersion" :electorate="electorateNumber" />
                </div>
            </div>
        </template>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { useResultsScope } from '~/composables/useElectionSource'
import { useElectionShape } from '~/composables/useElectionShape'
import { electorateTypeLabel } from '~/utils/elections/electorates'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const route = useRoute()
const store = useElectionDataStore()

// A by-election has no party vote, so the party-vote card below would render an
// empty state permanently rather than one waiting to be filled.
const { hasPartyVote } = useElectionShape()

// Electorates are addressed by their Electoral Commission number, which is what
// the results reference.
const electorateNumber = computed(() => Number(route.params.electorateId))

const electorate = computed(() =>
    store.electorate(props.election.slug, props.resultsVersion.slug, electorateNumber.value))

// Null for a seat whose persistent record has not been matched, which renders
// nothing rather than a guess at its type.
const typeLabel = computed(() => electorateTypeLabel(
    store.persistentElectorateFor(
        props.election.slug, props.resultsVersion.slug, electorateNumber.value)?.electorate_type))

const referenceLoaded = computed(() =>
    (store.referenceData(props.election.slug, props.resultsVersion.slug)?.electorates.length ?? 0) > 0)

// Only a genuine 404 once there is a list of electorates to be absent from.
// Reference data can arrive after first render during a live event.
watch([electorate, referenceLoaded], ([found, loaded]) => {
    if (loaded && !found) {
        throw createError({ statusCode: 404, statusMessage: 'Electorate not found' })
    }
}, { immediate: true })

// Narrow the live subscription to this electorate: two documents rather than
// every electorate's, and released when the page closes.
useResultsScope(() => ({ kind: 'electorate', electorate: electorateNumber.value }))

/**
 * Also the map's `:key`, so walking from one electorate to the next builds a
 * fresh map rather than refitting one whose camera, source and WebGL context
 * belong to the shape before it.
 */
const mapId = computed(() =>
    `electorate-boundary-${props.resultsVersion.id}-${electorateNumber.value}`)

const breadcrumbItems = computed(() => [
    {
        label: 'Electorates',
        to: `/elections/${props.election.slug}/${props.resultsVersion.slug}/electorates`,
        icon: 'i-lucide-map',
    },
    { label: electorate.value?.name ?? '' },
])
</script>
