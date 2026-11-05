<template>
    <!-- Card beside the chamber on a wide screen; on a narrow one the
         chamber comes first, as the picture the figures explain. -->
    <div class="grid gap-4 @4xl:grid-cols-2">
        <ElectionsParliamentSeatAlerts :election="election" :resultsVersion="resultsVersion"
            :allocation="allocation" class="@4xl:col-span-2" />
        <ElectionsParliamentPartySeats :election="election" :resultsVersion="resultsVersion"
            :allocation="allocation" :to="to" :title="title" variant="soft" />
        <!-- Carded to match its neighbour, and stretched to its height
             with the chamber centred, so it does not float beside it. -->
        <UCard variant="soft" class="order-first @4xl:order-last"
            :ui="{ body: 'h-full flex items-center justify-center' }">
            <ElectionsParliamentSeatGrid :election="election" :resultsVersion="resultsVersion"
                :allocation="allocation" class="w-full" />
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'

/**
 * The seats card and the chamber, side by side.
 *
 * Shared by the overview and the Parliament page, from the same allocation,
 * so the two can never disagree about a seat or be laid out differently.
 */
withDefaults(defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
    /** Where the seats card's header links to, for a page away from Parliament. */
    to?: string
    title?: string
}>(), { title: 'Seats' })
</script>
