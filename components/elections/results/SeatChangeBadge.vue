<template>
    <!-- Blank where the seat was not curated, which is every archived
         election: a seat says nothing about how it was held rather
         than guessing at it. -->
    <!-- A gain reads as the old party's colour handing to the new
         one's; a hold as the one colour that kept it. -->
    <!-- In a card this sits on its own line under the electorate's name: the
         two together do not reliably fit across a narrow card. -->
    <div v-if="seatChange" class="flex items-stretch gap-1.5 shrink-0" :title="seatChange.description">
        <template v-if="seatChange.flipped">
            <ElectionsResultsPartySwatch :colour="seatChange.fromColour"
                :alternate="seatChange.fromAlternate" />
            <UIcon name="i-lucide-arrow-right" class="size-4 self-center text-muted" aria-hidden="true" />
        </template>
        <ElectionsResultsPartySwatch :colour="seatChange.toColour"
            :alternate="seatChange.toAlternate" />
        <span class="text-sm font-bold uppercase tracking-wide leading-5 whitespace-nowrap text-highlighted">
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
