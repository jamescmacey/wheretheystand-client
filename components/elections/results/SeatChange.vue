<template>
    <span v-if="note" class="inline-flex items-center gap-0.5 tabular-nums"
        :title="note.description">
        <UIcon v-if="note.icon" :name="note.icon" class="size-3.5 shrink-0" aria-hidden="true" />
        <span aria-hidden="true">{{ compact ? note.label : note.phrase }}</span>
        <!-- The figure on its own does not say what it is measured against. -->
        <span class="sr-only">{{ note.description }}</span>
    </span>
</template>

<script setup lang="ts">
import type { SeatChangeNote } from '~/utils/elections/incumbency'

/**
 * Seats won against seats held, as a figure a reader can scan.
 *
 * Deliberately not coloured. Green for a gain and red for a loss would read as
 * approval, and this is the one number on the page where the site would be
 * taking a side by styling it.
 */
withDefaults(defineProps<{
    note: SeatChangeNote | null
    /** "+3" rather than "3 more", for a right aligned numeric column. */
    compact?: boolean
}>(), { compact: false })
</script>
