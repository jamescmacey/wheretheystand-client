<template>
    <UCard variant="subtle">
        <div class="flex flex-col gap-4">
            <!-- The electorate chooser comes first deliberately. Geolocation
                 needs a gesture, and an empty text box is a dead end for
                 somebody who does not know what to type; an electorate is
                 always answerable and lands the reader somewhere useful. -->
            <UFormField label="Electorate" name="electorate">
                <USelectMenu
                    :model-value="electorateName ?? undefined"
                    :items="electorateNames"
                    :search-input="{ placeholder: 'Filter electorates' }"
                    placeholder="All electorates"
                    icon="i-lucide-land-plot"
                    class="w-full"
                    @update:model-value="emit('update:electorateName', $event ?? null)"
                />
                <template v-if="electorateName" #hint>
                    <UButton
                        variant="link"
                        color="neutral"
                        size="xs"
                        class="p-0"
                        @click="emit('update:electorateName', null)"
                    >
                        Clear
                    </UButton>
                </template>
            </UFormField>

            <UFormField label="Address or suburb" name="address">
                <UInput
                    :model-value="query"
                    placeholder="Street or suburb"
                    icon="i-lucide-search"
                    class="w-full"
                    autocomplete="off"
                    @update:model-value="emit('update:query', String($event))"
                />
            </UFormField>

            <div class="flex flex-wrap items-center gap-2">
                <!-- Hidden outright when the browser cannot answer, rather
                     than offered and then failing. -->
                <UButton
                    v-if="!locationUnsupported"
                    :icon="nearMe ? 'i-lucide-locate-off' : 'i-lucide-locate-fixed'"
                    :loading="locationStatus === 'pending'"
                    :variant="nearMe ? 'solid' : 'subtle'"
                    color="primary"
                    @click="toggleLocation"
                >
                    {{ nearMe ? 'Stop using my location' : 'Use my location' }}
                </UButton>
            </div>

            <UAlert
                v-if="locationStatus === 'denied'"
                color="warning"
                variant="subtle"
                icon="i-lucide-map-pin-off"
                title="Location access was declined"
                description="Search by address or choose an electorate instead."
            />
            <UAlert
                v-else-if="locationStatus === 'timeout'"
                color="warning"
                variant="subtle"
                icon="i-lucide-clock"
                title="Could not get your location in time"
                description="Try again, or search by address instead."
            />
            <UAlert
                v-else-if="locationStatus === 'unavailable'"
                color="warning"
                variant="subtle"
                icon="i-lucide-triangle-alert"
                title="Your location is not available"
                description="Your device could not provide a position. Search by address instead."
            />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { LocationStatus } from '~/composables/useUserLocation'

const props = defineProps<{
    query: string
    electorateName: string | null
    electorateNames: string[]
    locationStatus: LocationStatus
    locationUnsupported: boolean
    /** A proximity search is currently driving the results. */
    nearMe: boolean
}>()

const emit = defineEmits<{
    'update:query': [string]
    'update:electorateName': [string | null]
    'request-location': []
    'clear-location': []
}>()

function toggleLocation() {
    if (props.nearMe) {
        emit('clear-location')
    } else {
        emit('request-location')
    }
}
</script>
