<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Special votes</h3>
                <UButton v-if="changed" color="neutral" variant="ghost" size="sm"
                    icon="i-lucide-rotate-ccw" label="Reset" @click="resetSpecials" />
            </div>
        </template>

        <div class="space-y-3">
            <UFormField name="specialVotes" label="Special votes to add"
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInputNumber v-model="count" :min="0" :max="MAX_SPECIAL_VOTES" :step="1000"
                    :format-options="{ maximumFractionDigits: 0 }" class="w-40" />
            </UFormField>

            <UAlert v-if="resultsVersion.is_final" color="neutral" variant="subtle" icon="i-lucide-info"
                description="These results are final and already include special votes, so any added here are on top of them." />

            <div>
                <div class="flex justify-between gap-3 text-xs text-muted pb-1">
                    <span>Share of the party vote</span>
                    <span class="tabular-nums" :class="scaled ? 'text-warning' : ''">Total {{ formatPercent(totalPercent) }}</span>
                </div>
                <ul class="divide-y divide-default max-h-96 overflow-y-auto">
                    <li v-for="row in rows" :key="row.key" class="py-1.5 flex items-center gap-3 pr-1">
                        <ElectionsResultsPartySwatch :colour="row.colour" :alternate="row.alternate" />
                        <div class="flex-1 min-w-0">
                            <p class="text-sm truncate">{{ row.name }}</p>
                            <p v-if="row.added" class="text-xs text-muted tabular-nums">+{{ row.added }} votes</p>
                        </div>
                        <UInputNumber :modelValue="row.percent" :min="0" :max="100" :step="0.1" size="sm"
                            :format-options="{ maximumFractionDigits: 1 }" class="w-28 shrink-0"
                            :aria-label="`Share of special votes for ${row.name}, per cent`"
                            @update:modelValue="setShare(row.key, row.percent, $event)" />
                    </li>
                </ul>
            </div>

            <UAlert v-if="scaled" color="warning" variant="subtle" icon="i-lucide-scale"
                :description="`These percentages add up to ${formatPercent(totalPercent)}, so they have been scaled to 100% for the calculation.`" />
        </div>

        <template #footer>
            <p class="text-xs text-muted">
                Special votes change the party vote only. To change who wins an electorate, pin it.
            </p>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { AllocationInput } from '~/utils/elections/mmp'
import type { AppliedScenario, WhatIfLookup } from '~/utils/elections/whatIf'
import { useElectionDataStore } from '~/stores/electionData'
import { useWhatIfScenario } from '~/composables/useWhatIf'
import { formatCount, formatPercent } from '~/utils/elections/format'
import { MAX_SPECIAL_VOTES } from '~/utils/elections/whatIf'

/**
 * Votes to add to the party vote, and how they split.
 *
 * Each party starts on its share of the real party vote, and only the shares a
 * reader changes are saved, so the rest keep following the count.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    realInput: AllocationInput | null
    applied: AppliedScenario | null
    lookup: WhatIfLookup
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))
const { scenario, resetSpecials } = useWhatIfScenario(() => props.election.slug)

const count = computed<number>({
    get: () => scenario.value.specials.count,
    set: value => {
        // Cleared or mistyped, the input hands back null or NaN.
        const clean = Number.isFinite(value) ? Math.round(value) : 0
        scenario.value.specials.count = Math.min(MAX_SPECIAL_VOTES, Math.max(0, clean))
    },
})

const changed = computed(() => scenario.value.specials.count > 0
    || Object.keys(scenario.value.specials.shares).length > 0)

const rounded = (value: number) => Math.round(value * 10) / 10

const rows = computed(() => {
    const parties = props.realInput?.partyVotes ?? []
    const total = parties.reduce((sum, party) => sum + (party.votes || 0), 0)

    return [...parties].sort((a, b) => b.votes - a.votes).map(({ party, votes }) => {
        const key = props.lookup.partyKeys.get(party) ?? `#${party}`
        const added = props.applied?.specials.votes.get(party) ?? 0
        return {
            key,
            name: store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party',
            colour: store.partyColour(slugs.value.e, slugs.value.v, party),
            alternate: store.partyAlternateColour(slugs.value.e, slugs.value.v, party),
            percent: rounded(scenario.value.specials.shares[key] ?? (total > 0 ? (votes / total) * 100 : 0)),
            added: added ? formatCount(added) : null,
        }
    })
})

const totalPercent = computed(() => props.applied?.specials.totalPercent ?? 0)
const scaled = computed(() => props.applied?.specials.scaled ?? false)

/**
 * Save a share only if it really changed. An input can echo its value back when
 * it loses focus, and that must not fix a party's share against the count.
 */
function setShare(key: string, shown: number, value: number) {
    if (!Number.isFinite(value) || value === shown) return
    scenario.value.specials.shares[key] = Math.min(100, Math.max(0, value))
}
</script>
