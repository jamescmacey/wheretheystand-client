<template>
    <UCollapsible class="group">
        <UButton color="neutral" variant="soft" block class="justify-between gap-3"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }">
            <span class="flex flex-1 items-center justify-between gap-3 min-w-0">
                <ElectionsEntityPartyLabel v-if="group.party !== null" :election="election"
                    :resultsVersion="resultsVersion" :party="group.party" :link="false" />
                <span v-else class="flex items-center gap-2 min-w-0">
                    <ElectionsResultsPartySwatch :colour="independentColour" />
                    <span class="truncate">Independent</span>
                </span>
                <span class="shrink-0 text-xs font-normal text-muted tabular-nums">{{ countLabel }}</span>
            </span>
        </UButton>

        <template #content>
            <div class="pt-3 pb-1 px-1 space-y-4">
                <section v-if="group.list.length">
                    <h4 class="text-sm font-semibold mb-1">Party list</h4>
                    <ol class="divide-y divide-default">
                        <li v-for="candidate in group.list" :key="candidate.number"
                            class="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline py-1.5 text-sm">
                            <span class="tabular-nums text-muted">{{ candidate.list_pos }}</span>
                            <ElectionsCandidatesRow :election="election" :resultsVersion="resultsVersion"
                                :candidate="candidate" />
                        </li>
                    </ol>
                </section>

                <section v-if="group.electorateOnly.length">
                    <!-- Everyone in the independent group is here, so a heading
                         would only be telling the reader what the group means. -->
                    <h4 v-if="group.party !== null" class="text-sm font-semibold mb-1">
                        Standing only in electorates
                    </h4>
                    <ul class="divide-y divide-default">
                        <li v-for="candidate in group.electorateOnly" :key="candidate.number"
                            class="py-1.5 text-sm">
                            <ElectionsCandidatesRow :election="election" :resultsVersion="resultsVersion"
                                :candidate="candidate" />
                        </li>
                    </ul>
                </section>
            </div>
        </template>
    </UCollapsible>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { CandidateGroup } from '~/utils/elections/candidates'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * One party's candidates: the list by rank, then anyone standing only in an
 * electorate. Folded by default, because a full list runs to 70 or more names.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    group: CandidateGroup
}>()

const store = useElectionDataStore()

const independentColour = computed(() =>
    store.partyColour(props.election.slug, props.resultsVersion.slug, null))

const countLabel = computed(() => {
    const count = props.group.list.length + props.group.electorateOnly.length
    return `${count} ${count === 1 ? 'candidate' : 'candidates'}`
})
</script>
