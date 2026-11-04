<template>
    <div class="results-container overflow-x-auto">
        <div class="results-table" :style="gridVars" :class="{ 'results-no-bars': !showBars }">
            <!-- Header -->
            <div class="results-grid items-end gap-3 pb-2 text-sm uppercase text-muted">
                <div :class="$slots['lead-header'] ? 'results-lead-header' : ''"><slot name="lead-header" /></div>
                <!-- Holds the label track under a lead heading that has its own line. -->
                <div v-if="$slots['lead-header']" class="results-lead-spacer" aria-hidden="true" />
                <div class="results-bar"><slot name="bar-header" /></div>
                <div v-for="column in columns" :key="column.key"
                    class="text-right border-b border-default"
                    :class="[column.emphasis ? 'font-bold text-default' : '', column.secondary ? 'results-secondary' : '']">
                    <UTooltip v-if="column.title" :text="column.title">
                        <span class="cursor-help underline decoration-dotted underline-offset-2">
                            {{ column.label }}
                        </span>
                    </UTooltip>
                    <template v-else>{{ column.label }}</template>
                </div>
            </div>

            <!-- Rows -->
            <component :is="row.to ? 'NuxtLink' : 'div'" v-for="row in rows" :key="row.key"
                :to="row.to ?? undefined"
                class="results-grid items-center gap-3 py-2 border-b border-default/50"
                :class="[row.to ? 'hover:bg-elevated/50 transition-colors' : '', row.muted ? 'text-muted' : '']">
                <div class="flex items-center gap-2 min-w-0">
                    <ElectionsResultsPartySwatch v-if="!row.muted" :colour="row.colour"
                        :alternate="row.alternateColour" />
                    <div class="min-w-0">
                        <template v-if="row.shortLabel">
                            <p class="results-label results-label-full">{{ row.label }}</p>
                            <p class="results-label results-label-short" :title="row.label">
                                <span aria-hidden="true">{{ row.shortLabel }}</span>
                                <span class="sr-only">{{ row.label }}</span>
                            </p>
                        </template>
                        <p v-else class="results-label">{{ row.label }}</p>
                        <p v-if="row.sublabel" class="results-label text-xs text-muted">{{ row.sublabel }}</p>
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
                        :colour="row.colour ?? (row.muted ? DEFAULT_PARTY_COLOUR : null)"
                        :alternate="row.alternateColour" />
                </div>
                <div v-for="column in columns" :key="column.key" class="results-figure text-right tabular-nums"
                    :class="[column.emphasis ? 'font-bold' : '', column.secondary ? 'results-secondary' : '',
                             column.muted ? 'text-muted' : '']">
                    <!-- A column that needs more than text, such as a figure
                         with an icon, fills `cell-{key}` instead. -->
                    <slot :name="`cell-${column.key}`" :row="row">
                        {{ row.cells[column.key] ?? '—' }}
                    </slot>
                </div>
            </component>

            <!-- Informals: stated, but outside the total below -->
            <div v-if="informals" class="results-grid items-center gap-3 py-2 mt-2 text-sm text-muted">
                <div class="pl-3 truncate">{{ informals.label }}</div>
                <div class="results-bar truncate">{{ informals.note ?? '' }}</div>
                <div v-for="column in columns" :key="column.key" class="text-right tabular-nums"
                    :class="column.secondary ? 'results-secondary' : ''">
                    {{ informals.cells[column.key] ?? '' }}
                </div>
            </div>

            <!-- Totals -->
            <div v-if="totals" class="results-grid items-center gap-3 py-2 bg-elevated rounded-lg"
                :class="informals ? '' : 'mt-2'">
                <div class="pl-3 text-sm text-muted truncate">{{ totals.label }}</div>
                <div class="results-bar text-sm text-muted truncate">{{ totals.note ?? '' }}</div>
                <!-- Only the last figure is inset from the shaded edge, so the
                     others stay in line with the rows above. -->
                <div v-for="(column, index) in columns" :key="column.key" class="text-right tabular-nums"
                    :class="[column.emphasis ? 'font-bold' : '', column.secondary ? 'results-secondary' : '',
                             index === columns.length - 1 ? 'pr-3' : '']">
                    {{ totals.cells[column.key] ?? '' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ResultsColumn, ResultsRow } from '~/types/electionResults'
import type { ResultsFooterLine } from '~/utils/elections/rows'
import { DEFAULT_PARTY_COLOUR } from '~/stores/electionData'

/**
 * The shared shape of every results table.
 *
 * A results row is a label, a bar that spans whatever space is left, right
 * aligned figures, a totals line, and the informals stated just above it.
 * That is a grid rather than a data table:
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
    totals?: ResultsFooterLine | null
    /** Shown above the totals and not counted in them. */
    informals?: ResultsFooterLine | null
    showBars?: boolean
    leadWidth?: string
}>(), { totals: null, informals: null, showBars: true, leadWidth: 'minmax(8rem, 15rem)' })

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

/*
 * One set of tracks for the whole table, which every line takes as a subgrid.
 * Separate grids per line size their content-sized tracks line by line, and a
 * line with an empty cell -- the totals' share, say -- then sits out of step
 * with the rows above it.
 */
.results-table {
    display: grid;
    grid-template-columns: var(--results-cols-narrow);
}

.results-grid {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
}

.results-bar,
.results-secondary,
.results-label-full {
    display: none;
}

/*
 * Narrow tables give the label whatever the figures leave, which with every
 * column showing can be a few characters. A name cut to "TANGA…" says nothing,
 * so it wraps there instead, and the row grows taller. Wide tables have the
 * room to keep each row to one line.
 */
.results-label {
    overflow-wrap: break-word;
}

/* Every pixel between the figures is one the label does not have. */
.results-grid {
    column-gap: 0.5rem;
}

.results-figure {
    font-size: var(--text-sm);
}

/*
 * A control in the lead heading, such as the show-all switch, gets its own line
 * above the column headings: the label track is too narrow to hold it, and it
 * would otherwise spill across the first heading.
 */
.results-lead-header {
    grid-column: 1 / -1;
}

/* Initials are short enough to keep whole: "NA" over "T" reads as nothing. */
.results-label-short {
    white-space: nowrap;
}

@container (min-width: 40rem) {
    .results-table {
        grid-template-columns: var(--results-cols-wide);
    }

    .results-bar,
    .results-secondary {
        display: block;
    }

    .results-label-full {
        display: block;
    }

    .results-secondary-summary,
    .results-label-short {
        display: none;
    }

    .results-grid {
        column-gap: 0.75rem;
    }

    .results-figure {
        font-size: inherit;
    }

    .results-lead-header {
        grid-column: auto;
    }

    .results-lead-spacer {
        display: none;
    }

    .results-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .results-no-bars .results-bar {
        display: none;
    }
}
</style>
