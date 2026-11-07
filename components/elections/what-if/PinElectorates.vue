<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Pin electorates</h3>
                <UButton v-if="scenario.pins.length" color="neutral" variant="ghost" size="sm"
                    icon="i-lucide-rotate-ccw" label="Reset" @click="resetPins" />
            </div>
        </template>

        <div class="space-y-3">
            <USelectMenu v-model="pinnedElectorates" multiple :items="electorateOptions" value-key="value"
                :search-input="{ placeholder: 'Search electorates' }" icon="i-lucide-search"
                placeholder="Add electorates" class="w-full" aria-label="Electorates to pin">
                <template #default>
                    <span class="text-muted">
                        {{ rows.length ? pluralise(rows.length, 'electorate') + ' selected' : 'Add electorates' }}
                    </span>
                </template>
            </USelectMenu>

            <UAlert v-if="unmatched.length" color="warning" variant="subtle" icon="i-lucide-circle-alert"
                :title="`${pluralise(unmatched.length, 'pin')} can't be matched to this count`"
                description="These are being ignored, because the electorate or candidate isn't part of this count.">
                <template #actions>
                    <UButton color="warning" variant="subtle" size="sm" label="Remove"
                        @click="removePins(unmatched)" />
                </template>
            </UAlert>

            <ul v-if="rows.length" class="divide-y divide-default">
                <li v-for="row in rows" :key="row.key" class="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div class="flex-1 min-w-48">
                        <p class="text-sm font-medium truncate">{{ row.name }}</p>
                        <div class="text-xs text-muted flex items-center gap-1 min-w-0">
                            <span class="shrink-0">Current result:</span>
                            <ElectionsEntityCandidateLabel v-if="row.winner !== null" :election="election"
                                :resultsVersion="resultsVersion" :candidate="row.winner" :showParty="false"
                                :link="false" />
                            <span v-else>{{ row.status }}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 flex-1 min-w-52">
                        <USelect :modelValue="row.selected" :items="row.candidates" placeholder="Pin to a candidate"
                            size="sm" class="flex-1 min-w-0" :aria-label="`Candidate to pin in ${row.name}`"
                            @update:modelValue="setPinnedCandidate(row.key, String($event))" />
                        <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-x"
                            :aria-label="`Stop pinning ${row.name}`" @click="removePins([row.key])" />
                    </div>
                </li>
            </ul>
        </div>

        <template #footer>
            <p class="text-xs text-muted">Electorates you don't pin will be calculated based on real results.</p>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { AppliedScenario } from '~/utils/elections/whatIf'
import { useElectionDataStore } from '~/stores/electionData'
import { useWhatIfScenario } from '~/composables/useWhatIf'
import { partyKey } from '~/utils/elections/coalitions'
import { pluralise } from '~/utils/elections/format'
import { partyAbbreviation } from '~/utils/elections/partyAbbreviation'

/**
 * Who wins an electorate, as the reader would have it.
 *
 * A row does nothing until a candidate is chosen, so adding an electorate never
 * changes the seats by itself.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    applied: AppliedScenario | null
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))
const { scenario, setPinnedElectorates, setPinnedCandidate, removePins, resetPins } =
    useWhatIfScenario(() => props.election.slug)

const reference = computed(() => store.referenceData(slugs.value.e, slugs.value.v))

/** A cancelled candidate election has no result to pin. */
const electorates = computed(() => (reference.value?.electorates ?? [])
    .filter(electorate => electorate.accepting_candidate_votes)
    .map(electorate => ({
        key: partyKey(electorate.number, electorate.persistent_electorate),
        number: electorate.number,
        name: electorate.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en-NZ')))

const electorateOptions = computed(() =>
    electorates.value.map(electorate => ({ label: electorate.name, value: electorate.key })))

const pinnedElectorates = computed<string[]>({
    get: () => scenario.value.pins.map(pin => pin.electorate),
    set: setPinnedElectorates,
})

function candidateLabel(name: string, party: EntityNumber | null): string {
    if (party === null) return `${name} (Independent)`
    const short = partyAbbreviation(
        store.party(slugs.value.e, slugs.value.v, party),
        store.persistentPartyForParty(slugs.value.e, slugs.value.v, party))
    return short ? `${name} (${short})` : name
}

/** Everyone standing and alive, most votes first where the count has reached them. */
function candidatesIn(electorate: EntityNumber) {
    const tally = store.electorateResults(slugs.value.e, slugs.value.v, electorate, 'candidate_votes')
    const votes = new Map((tally?.results ?? []).map(result => [result.candidate, result.count ?? 0]))

    return (reference.value?.candidates ?? [])
        .filter(candidate => candidate.electorate === electorate && !candidate.is_dead)
        .sort((a, b) => (votes.get(b.number) ?? 0) - (votes.get(a.number) ?? 0)
            || a.name.localeCompare(b.name, 'en-NZ'))
        .map(candidate => ({
            label: candidateLabel(candidate.name, candidate.party),
            value: partyKey(candidate.number, candidate.persistent_candidate),
        }))
}

const STATUS_TEXT = {
    indeterminate: 'Tied',
    uncounted: 'Not counted yet',
    no_candidates: 'No candidates',
} as const

function currentResult(electorate: EntityNumber): { winner: EntityNumber | null, status: string } {
    const result = store.computedElectorateResult(slugs.value.e, slugs.value.v, electorate)
    if (!result) return { winner: null, status: 'Not counted yet' }
    if (result.resultStatus === 'determined' || result.resultStatus === 'defaulted') {
        return { winner: result.firstPlace?.[0] ?? null, status: 'Not counted yet' }
    }
    return { winner: null, status: STATUS_TEXT[result.resultStatus] }
}

const rows = computed(() => scenario.value.pins.flatMap(pin => {
    const electorate = electorates.value.find(entry => entry.key === pin.electorate)
    if (!electorate) return []
    const candidates = candidatesIn(electorate.number)
    return [{
        key: electorate.key,
        name: electorate.name,
        candidates,
        selected: candidates.some(option => option.value === pin.candidate)
            ? pin.candidate ?? undefined
            : undefined,
        ...currentResult(electorate.number),
    }]
}))

/** Saved pins this results version has no electorate or candidate for. */
const unmatched = computed(() => {
    const known = new Set(electorates.value.map(electorate => electorate.key))
    const ignored = new Set((props.applied?.ignoredPins ?? []).map(pin => pin.electorate))
    return scenario.value.pins
        .filter(pin => !known.has(pin.electorate) || ignored.has(pin.electorate))
        .map(pin => pin.electorate)
})
</script>
