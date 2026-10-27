<template>
    <component :is="to ? resolveComponent('NuxtLink') : 'div'" :to="to ?? undefined"
        class="flex items-center gap-2 min-w-0" :class="to ? 'hover:underline' : ''">
        <ElectionsResultsPartySwatch v-if="swatch" :colour="colour" />
        <span class="truncate">{{ name }}</span>
    </component>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * A party, named and coloured, linking to its profile where there is one.
 *
 * The colour and the link both come from the persistent record rather than the
 * election one: a party at one election is a row in a results feed, and the
 * thing worth linking to is the party that exists across all of them.
 */
const props = withDefaults(defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    party: EntityNumber | null
    swatch?: boolean
    /** Off where the label sits inside something already clickable. */
    link?: boolean
    /** Shown when the party number resolves to nothing. */
    fallback?: string
}>(), { swatch: true, link: true, fallback: 'Unknown party' })

const store = useElectionDataStore()

const slugs = computed(() => ({
    election: props.election.slug,
    version: props.resultsVersion.slug,
}))

const party = computed(() => (props.party === null
    ? null
    : store.party(slugs.value.election, slugs.value.version, props.party)))

const persistent = computed(() => (props.party === null
    ? null
    : store.persistentPartyForParty(slugs.value.election, slugs.value.version, props.party)))

const name = computed(() =>
    persistent.value?.display_name || party.value?.name || props.fallback)

const colour = computed(() =>
    store.partyColour(slugs.value.election, slugs.value.version, props.party))

// Only where the party has been matched to a site record. An unmatched party
// still renders with its name and colour; it just does not lead anywhere.
const to = computed(() => (props.link && persistent.value?.party
    ? `/parties/${persistent.value.party}`
    : null))
</script>
