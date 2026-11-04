<template>
    <UCard variant="subtle">
        <div class="flex flex-col gap-3">
            <div class="flex items-start justify-between gap-3">
                <!-- The address, because it is the only name a voting place
                     has in the data. -->
                <h3 class="min-w-0 text-lg font-semibold text-highlighted">{{ place.address }}</h3>
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
                <!-- The badge is the way to the electorate's results. -->
                <ElectionsEntityElectorateBadge
                    v-if="place.electorate_number"
                    :election="election"
                    :results-version="resultsVersion"
                    :electorate="place.electorate_number"
                />
                <UBadge v-if="distance" variant="soft" color="primary" icon="i-lucide-navigation">
                    {{ distance }} away
                </UBadge>
                <UBadge v-if="!place._geoloc" variant="soft" color="warning" icon="i-lucide-map-pin-off">
                    Location not mapped
                </UBadge>
            </div>

            <!-- Offered whether or not per-place tallies were published: the
                 place's own page says which, and has its map and address. -->
            <div>
                <UButton
                    :to="placeTo"
                    variant="subtle"
                    color="primary"
                    icon="i-lucide-chart-no-axes-column"
                    trailing-icon="i-lucide-arrow-right"
                >
                    Results for this place
                </UButton>
            </div>
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

const distance = computed(() => (
    props.showDistance ? formatDistance(props.place.distanceMetres) : null
))

const placeTo = computed(() => (
    `/elections/${props.election.slug}/${props.resultsVersion.slug}/voting-places/${props.place.number}`
))
</script>
