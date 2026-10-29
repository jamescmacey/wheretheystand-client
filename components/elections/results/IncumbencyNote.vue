<template>
    <div v-if="note.outcome || note.member" class="text-sm">
        <p v-if="note.outcome">{{ note.outcome }}</p>
        <p v-if="note.member" class="flex items-start gap-1.5 text-muted">
            <UIcon :name="note.member.icon" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{{ note.member.text }}</span>
        </p>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useIncumbency } from '~/composables/useIncumbency'

/**
 * How one seat stood going into the election, in at most two sentences.
 *
 * Sentences rather than a badge, and a line of their own rather than a marker
 * beside the leading candidate's name. Both choices are forced by the same
 * thing: a seat's history is a statement about the seat, and the party that
 * held it is often not the party leading it. A cross next to the name of a
 * candidate who is not the one it refers to would be read as being about them.
 *
 * Renders nothing at all where the links are incomplete or no incumbency has
 * been curated, which is every archived election. A blank says nothing; a
 * marker on a guess says something false about a candidate.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: EntityNumber
}>()

const { noteFor } = useIncumbency(() => props.election, () => props.resultsVersion)

const note = computed(() => noteFor(props.electorate))
</script>
