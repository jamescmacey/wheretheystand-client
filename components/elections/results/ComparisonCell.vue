<template>
    <span v-if="!figures.length">—</span>
    <!-- One figure at the table's own size. Two, which happens where a
         candidate has changed party, stack in a smaller size so both fit the
         column. -->
    <span v-else class="inline-flex flex-col items-end"
        :class="figures.length > 1 ? 'text-xs leading-tight' : ''">
        <span v-for="figure in figures" :key="figure.basis" class="inline-flex items-center gap-1">
            <UIcon v-if="figure.basis !== 'same'" :name="COMPARISON_ICONS[figure.basis]"
                class="size-3.5 shrink-0" aria-hidden="true" />
            <span v-if="figure.basis !== 'same'" class="sr-only">{{ COMPARISON_ICON_LABELS[figure.basis] }}:</span>
            {{ formatPercent(figure.per_cent) ?? '—' }}
        </span>
    </span>
</template>

<script setup lang="ts">
import type { CandidateComparisonFigure } from '~/utils/elections/comparison'
import { COMPARISON_ICON_LABELS, COMPARISON_ICONS } from '~/utils/elections/comparison'
import { formatPercent } from '~/utils/elections/format'

/** A candidate's figure from the last election, marked with whose it was. */
defineProps<{ figures: CandidateComparisonFigure[] }>()
</script>
