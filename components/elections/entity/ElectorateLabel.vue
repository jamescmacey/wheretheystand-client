<template>
    <div class="min-w-0">
        <component :is="to ? resolveComponent('NuxtLink') : 'span'" :to="to ?? undefined"
            class="block truncate font-bold" :class="to ? 'hover:underline' : ''">
            {{ name }}
        </component>
        <p v-if="showType && typeLabel" class="text-xs text-muted">{{ typeLabel }}</p>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'

const props = withDefaults(defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: EntityNumber | null
    showType?: boolean
    link?: boolean
    fallback?: string
}>(), { showType: true, link: true, fallback: 'Unknown electorate' })

const store = useElectionDataStore()

const slugs = computed(() => ({
    election: props.election.slug,
    version: props.resultsVersion.slug,
}))

const electorate = computed(() => (props.electorate === null
    ? null
    : store.electorate(slugs.value.election, slugs.value.version, props.electorate)))

const persistent = computed(() => (props.electorate === null
    ? null
    : store.persistentElectorateFor(slugs.value.election, slugs.value.version, props.electorate)))

const name = computed(() => electorate.value?.name ?? props.fallback)

// Only stated where it is known. Guessing "General electorate" for an
// unmatched one would be a claim about the seat, not a formatting default.
const typeLabel = computed(() => {
    switch (persistent.value?.electorate_type) {
        case 'maori': return 'Māori electorate'
        case 'general': return 'General electorate'
        default: return null
    }
})

// Within the dashboard rather than to the site's own electorate page: the
// reader is looking at one election's results and expects to stay in them.
const to = computed(() => (props.link && props.electorate !== null
    ? `/elections/${slugs.value.election}/${slugs.value.version}/electorates/${props.electorate}`
    : null))
</script>
