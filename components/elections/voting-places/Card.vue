<template>
    <button
        type="button"
        :aria-current="selected ? 'true' : undefined"
        class="w-full text-left rounded-md ring p-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="selected
            ? 'ring-primary bg-primary/5'
            : 'ring-default bg-default hover:bg-elevated'"
        @click="emit('select', place.number)"
    >
        <!-- The address is the heading because it is the only identifying
             string a voting place has: there is no venue name in the data. -->
        <p class="font-medium text-highlighted">{{ place.address }}</p>

        <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <UBadge variant="subtle" color="neutral" size="sm">
                Place {{ place.number }}
            </UBadge>
            <span class="truncate">{{ place.electorate_name }}</span>
        </div>

        <div v-if="distance || unmapped" class="mt-2 flex flex-wrap items-center gap-2">
            <UBadge v-if="distance" variant="soft" color="primary" size="sm" icon="i-lucide-navigation">
                {{ distance }}
            </UBadge>
            <UBadge v-if="unmapped" variant="soft" color="warning" size="sm" icon="i-lucide-map-pin-off">
                Location not mapped
            </UBadge>
        </div>
    </button>
</template>

<script setup lang="ts">
import type { VotingPlaceHit } from '~/types/elections'
import { formatDistance } from '~/utils/geo/format'

const props = defineProps<{
    place: VotingPlaceHit
    selected?: boolean
    /** Only in proximity mode; a distance from nowhere means nothing. */
    showDistance?: boolean
}>()

const emit = defineEmits<{ select: [number] }>()

const distance = computed(() => (
    props.showDistance ? formatDistance(props.place.distanceMetres) : null
))

/** Said out loud, because such a place is silently absent from the map. */
const unmapped = computed(() => !props.place._geoloc)
</script>
