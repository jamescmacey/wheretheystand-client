<template>
    <UCard variant="subtle">
        <div class="flex flex-col gap-3">
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <!-- The address, because it is the only name a voting
                         place has in the data. -->
                    <h3 class="text-lg font-semibold text-highlighted">{{ place.address }}</h3>
                    <p class="mt-1 text-sm text-muted">
                        Voting place {{ place.number }}
                    </p>
                </div>
                <UButton
                    icon="i-lucide-x"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    aria-label="Close voting place details"
                    @click="emit('close')"
                />
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <UBadge variant="subtle" color="neutral" icon="i-lucide-land-plot">
                    {{ place.electorate_name }}
                </UBadge>
                <UBadge v-if="distance" variant="soft" color="primary" icon="i-lucide-navigation">
                    {{ distance }} away
                </UBadge>
                <UBadge v-if="!place._geoloc" variant="soft" color="warning" icon="i-lucide-map-pin-off">
                    Location not mapped
                </UBadge>
            </div>

            <div class="flex flex-wrap gap-2">
                <UButton
                    v-if="placeResultsAvailable"
                    :to="placeTo"
                    variant="subtle"
                    color="primary"
                    icon="i-lucide-chart-no-axes-column"
                    trailing-icon="i-lucide-arrow-right"
                >
                    Results for this place
                </UButton>
                <UButton
                    :to="electorateTo"
                    variant="subtle"
                    color="neutral"
                    icon="i-lucide-land-plot"
                    trailing-icon="i-lucide-arrow-right"
                >
                    Electorate results
                </UButton>
                <UButton
                    variant="ghost"
                    color="neutral"
                    :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                    @click="copyAddress"
                >
                    {{ copied ? 'Copied' : 'Copy address' }}
                </UButton>
            </div>

            <USeparator />

            <!-- Per-place tallies are published by an optional, slow step that
                 usually has not been run, so the honest state is the normal
                 one. Checked rather than attempted: loadVotingPlaceResults
                 returns without doing anything when the paths are absent, so
                 trying would spin for ever. -->
            <ElectionsResultsEmpty
                v-if="!placeResultsAvailable"
                title="Results for this voting place are not published"
                description="This results version was published without per-voting-place figures. The electorate's results cover this place."
            />
            <p v-else class="text-sm text-muted">
                Every electorate this place issued votes for, with the party and
                candidate votes counted here, is on its own page.
            </p>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion, VotingPlaceHit } from '~/types/elections'
import { formatDistance } from '~/utils/geo/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    place: VotingPlaceHit
    showDistance: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const source = useInjectedElectionSource()

// The per-place files specifically, not voting place data in general: a version
// published before those existed has the per-electorate shards and nothing a
// page about one place could read.
const placeResultsAvailable = computed(
    () => Boolean(source?.votingPlacePagesAvailable.value))

const distance = computed(() => (
    props.showDistance ? formatDistance(props.place.distanceMetres) : null
))

const electorateTo = computed(() => (
    `/elections/${props.election.slug}/${props.resultsVersion.slug}/electorates/${props.place.electorate_number}`
))

const placeTo = computed(() => (
    `/elections/${props.election.slug}/${props.resultsVersion.slug}/voting-places/${props.place.number}`
))

/**
 * Copying the address rather than linking to a maps provider: an external map
 * link would have to be routed through links.wheretheystand.nz, and which
 * provider to send people to has not been decided.
 */
const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copyAddress() {
    try {
        await navigator.clipboard.writeText(props.place.address)
        copied.value = true
        clearTimeout(resetTimer)
        resetTimer = setTimeout(() => { copied.value = false }, 2000)
    } catch {
        // A refused clipboard is not worth an error state; the address is on
        // screen and selectable either way.
    }
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>
