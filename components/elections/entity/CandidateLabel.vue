<template>
    <component :is="to ? resolveComponent('NuxtLink') : 'div'" :to="to ?? undefined"
        class="flex items-center gap-2 min-w-0" :class="to ? 'hover:underline' : ''">
        <ElectionsResultsPartySwatch v-if="swatch" :colour="colour" />
        <div class="min-w-0">
            <p class="truncate">{{ name }}</p>
            <p v-if="showParty" class="text-xs text-muted truncate">{{ partyName }}</p>
        </div>
    </component>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * A candidate, with their party beneath and a link to their profile.
 *
 * Standing without a party is a real thing rather than missing data, so it is
 * named as such: "Independent", not a blank line.
 */
const props = withDefaults(defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    candidate: EntityNumber | null
    swatch?: boolean
    showParty?: boolean
    link?: boolean
    fallback?: string
}>(), { swatch: true, showParty: true, link: true, fallback: 'Unknown candidate' })

const store = useElectionDataStore()

const slugs = computed(() => ({
    election: props.election.slug,
    version: props.resultsVersion.slug,
}))

const candidate = computed(() => (props.candidate === null
    ? null
    : store.candidate(slugs.value.election, slugs.value.version, props.candidate)))

const persistent = computed(() => (props.candidate === null
    ? null
    : store.persistentCandidateFor(slugs.value.election, slugs.value.version, props.candidate)))

const name = computed(() =>
    persistent.value?.display_name || candidate.value?.name || props.fallback)

const party = computed(() => (candidate.value?.party
    ? store.party(slugs.value.election, slugs.value.version, candidate.value.party)
    : null))

const partyName = computed(() => party.value?.name ?? 'Independent')

const colour = computed(() => store.partyColour(
    slugs.value.election, slugs.value.version, candidate.value?.party ?? null))

// Only where the candidate has been matched to a person on the site. Most have
// not been, so this has to degrade to plain text rather than a dead link.
const to = computed(() => (props.link && persistent.value?.person
    ? `/people/${persistent.value.person}`
    : null))
</script>
