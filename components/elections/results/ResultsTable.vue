<template>
    <div class="results-container overflow-x-auto">
        <div :style="gridVars" :class="{ 'results-no-bars': !showBars }">
            <!-- Header -->
            <div class="results-grid items-end gap-3 pb-2 text-sm uppercase text-muted">
                <div><slot name="lead-header" /></div>
                <div class="results-bar"><slot name="bar-header" /></div>
                <div v-for="column in columns" :key="column.key"
                    class="text-right border-b border-default"
                    :class="[column.emphasis ? 'font-bold text-default' : '', column.secondary ? 'results-secondary' : '']">
                    {{ column.label }}
                </div>
            </div>

            <!-- Rows -->
            <component :is="row.to ? 'NuxtLink' : 'div'" v-for="row in rows" :key="row.key"
                :to="row.to ?? undefined"
                class="results-grid items-center gap-3 py-2 border-b border-default/50"
                :class="[row.to ? 'hover:bg-elevated/50 transition-colors' : '', row.muted ? 'text-muted' : '']">
                <div class="flex items-center gap-2 min-w-0">
                    <ElectionsResultsPartySwatch v-if="!row.muted" :colour="row.colour" />
                    <div class="min-w-0">
                        <p class="truncate">{{ row.label }}</p>
                        <p v-if="row.sublabel" class="text-xs text-muted truncate">{{ row.sublabel }}</p>
                        <!-- Columns dropped on narrow screens reappear here rather
                             than being lost. -->
                        <p v-if="hasSecondary" class="text-xs text-muted results-secondary-summary">
                            {{ secondarySummary(row.cells) }}
                        </p>
                    </div>
                </div>
                <div class="results-bar">
                    <!-- Muted rows fall back to grey rather than the theme colour,
                         which would read as a party's own. -->
                    <ElectionsResultsVoteBar v-if="row.bar !== null && row.bar !== undefined"
                        :value="row.bar"
                        :colour="row.colour ?? (row.muted ? DEFAULT_PARTY_COLOUR : null)" />
                </div>
                <div v-for="column in columns" :key="column.key" class="text-right tabular-nums"
                    :class="[column.emphasis ? 'font-bold' : '', column.secondary ? 'results-secondary' : '']">
                    {{ row.cells[column.key] ?? '—' }}
                </div>
            </component>

            <!-- Totals -->
            <div v-if="totals" class="results-grid items-center gap-3 py-2 mt-2 bg-elevated rounded-lg">
                <div class="pl-3 text-sm text-muted truncate">{{ totals.label }}</div>
                <div class="results-bar text-sm text-muted truncate">{{ totals.note ?? '' }}</div>
                <div v-for="column in columns" :key="column.key" class="text-right tabular-nums pr-3"
                    :class="[column.emphasis ? 'font-bold' : '', column.secondary ? 'results-secondary' : '']">
                    {{ totals.cells[column.key] ?? '' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ResultsColumn, ResultsRow } from '~/types/electionResults'
import { DEFAULT_PARTY_COLOUR } from '~/stores/electionData'

/**
 * The shared shape of every results table.
 *
 * A results row is a label, a bar that spans whatever space is left, right
 * aligned figures, and a totals line. That is a grid rather than a data table:
 * the bar has to stretch, and the columns must line up exactly between the
 * header, the rows and the totals.
 *
 * Narrow tables drop the bar and the columns marked secondary, and the dropped
 * figures reappear under each row's label. The switch is CSS only, so the
 * server and the browser always render the same markup. It is a container
 * query rather than a media query: the same table sits full width on one page
 * and in half a row on another, and only its own width says which fits.
 *
 * A bar is a share of the whole, drawn against a track of 100, never scaled to
 * the largest row: scaled, the leader always fills the track and a 40 per cent
 * party looks like a landslide. `showBars` drops the column outright, for a
 * table set beside something else that needs the width more.
 */
const props = withDefaults(defineProps<{
    columns: ResultsColumn[]
    rows: ResultsRow[]
    totals?: { label: string, note?: string | null, cells: Record<string, string | number | null> } | null
    showBars?: boolean
    leadWidth?: string
}>(), { totals: null, showBars: true, leadWidth: 'minmax(8rem, 15rem)' })

const hasSecondary = computed(() => props.columns.some(column => column.secondary))

const gridVars = computed(() => ({
    // On narrow screens the label takes the space that is left and the figures
    // size to their content. Fixed figure widths there would either push a
    // column off the side or squeeze names down to a few characters.
    '--results-cols-narrow': [
        'minmax(0, 1fr)',
        ...props.columns.filter(c => !c.secondary).map(() => 'auto'),
    ].join(' '),
    // Without bars the label takes the stretch the bar would have had.
    '--results-cols-wide': [
        ...(props.showBars ? [props.leadWidth, 'minmax(0, 1fr)'] : ['minmax(0, 1fr)']),
        ...props.columns.map(c => c.width ?? '4rem'),
    ].join(' '),
}))

function secondarySummary(cells: Record<string, string | number | null>): string {
    return props.columns
        .filter(column => column.secondary)
        .map(column => `${column.label} ${cells[column.key] ?? '—'}`)
        .join(' · ')
}
</script>

<style scoped>
.results-container {
    container-type: inline-size;
}

.results-grid {
    display: grid;
    grid-template-columns: var(--results-cols-narrow);
}

.results-bar,
.results-secondary {
    display: none;
}

@container (min-width: 40rem) {
    .results-grid {
        grid-template-columns: var(--results-cols-wide);
    }

    .results-bar,
    .results-secondary {
        display: block;
    }

    .results-secondary-summary {
        display: none;
    }

    .results-no-bars .results-bar {
        display: none;
    }
}
</style>
