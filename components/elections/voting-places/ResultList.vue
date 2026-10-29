<template>
    <div class="flex flex-col gap-3">
        <!-- Loading, per the house pattern. -->
        <UCard v-if="status === 'pending' && !places.length" variant="subtle">
            <div class="flex justify-center py-6">
                <UProgress animation="swing" class="max-w-xs" />
            </div>
        </UCard>

        <template v-else-if="status === 'error'">
            <UCard variant="subtle">
                <UEmpty
                    icon="i-lucide-triangle-alert"
                    title="Could not search voting places"
                    description="The search service did not answer. Nothing is wrong with your query."
                >
                    <template #actions>
                        <UButton
                            variant="subtle"
                            color="neutral"
                            icon="i-lucide-refresh-cw"
                            trailing
                            @click="emit('refresh')"
                        >
                            Refresh
                        </UButton>
                    </template>
                </UEmpty>
            </UCard>
        </template>

        <!-- Nothing asked for yet. Not an empty state: the finder above it is
             the thing to use, so this only points at it. -->
        <UCard v-else-if="!hasCriteria" variant="subtle">
            <UEmpty
                icon="i-lucide-map-pin"
                variant="subtle"
                title="Choose an electorate, or search an address"
                description="Voting places are listed once you narrow them down. There are several thousand at a general election."
            />
        </UCard>

        <UCard v-else-if="awaitingMoreTyping" variant="subtle">
            <UEmpty
                icon="i-lucide-keyboard"
                variant="subtle"
                title="Keep typing to search"
                description="Address search starts at three characters."
            />
        </UCard>

        <UCard v-else-if="!places.length" variant="subtle">
            <UEmpty
                icon="i-lucide-search-x"
                variant="soft"
                title="No voting places match that address"
                description="Addresses are recorded as free text, so a street name usually works better than a full address. You can also pick an electorate and browse."
            >
                <template #actions>
                    <UButton variant="subtle" color="neutral" icon="i-lucide-x" @click="emit('clear')">
                        Clear search
                    </UButton>
                </template>
            </UEmpty>
        </UCard>

        <template v-else>
            <div class="flex flex-wrap items-baseline justify-between gap-2 text-sm text-muted">
                <span>{{ countLabel }}</span>
                <span v-if="unmappedCount > 0" class="text-xs">
                    {{ unmappedLabel }}
                </span>
            </div>

            <!-- Truncation is said out loud rather than letting the reader
                 believe they are seeing everything that matched. -->
            <UAlert
                v-if="truncated"
                color="neutral"
                variant="subtle"
                icon="i-lucide-info"
                :description="`Showing the first ${places.length} of ${formatCount(nbHits)} matches. Narrow the search to see the rest.`"
            />

            <ul class="flex flex-col gap-2">
                <li v-for="place in places" :key="place.objectID">
                    <ElectionsVotingPlacesCard
                        :place="place"
                        :selected="place.number === selectedNumber"
                        :show-distance="showDistance"
                        @select="emit('select', $event)"
                    />
                </li>
            </ul>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { VotingPlaceHit } from '~/types/elections'
import { formatCount, pluralise } from '~/utils/elections/format'

const props = defineProps<{
    places: VotingPlaceHit[]
    selectedNumber: number | null
    status: 'idle' | 'pending' | 'success' | 'error'
    /** Total matches, which may exceed what was returned. */
    nbHits: number
    truncated: boolean
    showDistance: boolean
    /** Whether a query, an electorate or a location is in play at all. */
    hasCriteria: boolean
    /** A text query too short to have been sent. */
    awaitingMoreTyping: boolean
    unmappedCount: number
}>()

const emit = defineEmits<{ select: [number], refresh: [], clear: [] }>()

const countLabel = computed(() => (
    props.showDistance
        ? `${pluralise(props.places.length, 'voting place')}, nearest first`
        : pluralise(props.places.length, 'voting place')
))

const unmappedLabel = computed(() => (
    `${formatCount(props.unmappedCount)} without a mapped location`
))
</script>
