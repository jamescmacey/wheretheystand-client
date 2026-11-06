<template>
    <!-- Blank where the seat was not curated, which is every archived
         election: a seat says nothing about how it was held rather
         than guessing at it. -->
    <!-- A gain reads as the old party's colour handing to the new
         one's; a hold as the one colour that kept it. -->
    <!-- Beside an electorate's name, give this `grow basis-[min-content]`. The row
         then wraps only if the label stacked as "NAT" over "GAIN" still will not
         fit, and the label stays on one line wherever it has the room. -->
    <div v-if="seatChange" class="flex items-stretch gap-1.5 shrink-0" :title="seatChange.description">
        <template v-if="seatChange.flipped">
            <ElectionsResultsPartySwatch :colour="seatChange.fromColour"
                :alternate="seatChange.fromAlternate" />
            <UIcon name="i-lucide-arrow-right" class="size-4 self-center text-muted" aria-hidden="true" />
        </template>
        <ElectionsResultsPartySwatch :colour="seatChange.toColour"
            :alternate="seatChange.toAlternate" />
        <span class="font-bold uppercase tracking-wide leading-6 text-highlighted">
            {{ seatChange.label }}
        </span>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useIncumbency } from '~/composables/useIncumbency'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: EntityNumber
}>()

const { seatChangeBadgeFor } = useIncumbency(() => props.election, () => props.resultsVersion)

const seatChange = computed(() => seatChangeBadgeFor(props.electorate))
</script>
