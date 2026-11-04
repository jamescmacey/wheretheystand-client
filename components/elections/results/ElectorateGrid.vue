<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Electorates</h3>
                <UButton :to="electoratesHref" variant="link" color="neutral" size="sm" class="p-0"
                    trailing-icon="i-lucide-arrow-right">
                    All electorates
                </UButton>
            </div>
        </template>

        <div class="space-y-4">
            <section v-for="group in groups" :key="group.type" class="space-y-2">
                <h4 class="text-xs uppercase text-muted">{{ group.label }}</h4>
                <ul class="electorate-grid">
                    <li v-for="square in group.squares" :key="square.electorate">
                        <!-- The theme fixes a tooltip to one line's height; these run to four. -->
                        <UTooltip :delay-duration="0" :content="{ side: 'top' }"
                            :ui="{ content: 'h-auto max-w-64 py-1.5' }">
                            <NuxtLink :to="square.href" :aria-label="square.ariaLabel"
                                class="electorate-square block aspect-square rounded-sm transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                :class="square.colour ? '' : 'border border-dashed border-accented'"
                                :style="square.style" />
                            <template #content>
                                <div class="text-left space-y-0.5 py-0.5">
                                    <p class="font-bold">{{ square.name }}</p>
                                    <p>{{ square.leader }}</p>
                                    <p v-if="square.margin" class="text-muted">{{ square.margin }}</p>
                                    <p v-if="square.outcome" class="text-muted">{{ square.outcome }}</p>
                                </div>
                            </template>
                        </UTooltip>
                    </li>
                </ul>
            </section>

            <!-- Only what the squares can actually show. A legend entry for a
                 gain on an election with no curated incumbency would promise a
                 marker that can never appear. -->
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span v-if="canShowFlips" class="flex items-center gap-1.5">
                    <span class="inline-block size-3 rounded-sm" :style="hatchStyle(DEFAULT_PARTY_COLOUR)" />
                    Changing hands
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="inline-block size-3 rounded-sm border border-dashed border-accented" />
                    Not counted or tied
                </span>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useElectionDataStore, DEFAULT_PARTY_COLOUR } from '~/stores/electionData'
import { useIncumbency } from '~/composables/useIncumbency'
import { formatCount, formatPoints } from '~/utils/elections/format'
import { partyFill } from '~/utils/elections/partyFill'

/**
 * Every electorate as a square, coloured for the party whose candidate leads.
 *
 * General electorates A to Z, then Māori electorates A to Z: the order a reader
 * scans for a seat by name, rather than by region or margin, because the square
 * has to be findable before its colour means anything.
 *
 * A seat changing hands is cross-hatched over the leader's colour, so the
 * party is still readable through it. That needs curated incumbency, which no
 * archived election has, and there a seat is simply never marked -- "not a
 * flip" and "cannot tell" look the same here, which is why the legend drops
 * the entry rather than implying the first.
 *
 * Uncounted and tied seats are hollow. Both are a seat with nobody leading it,
 * and filling one with grey would read as an independent ahead.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))
const { incumbency, flippedFor, noteFor } = useIncumbency(
    () => props.election, () => props.resultsVersion)

/** Whether any seat has a holder on record to have changed hands from. */
const canShowFlips = computed(() => Boolean(incumbency.value?.electorates?.length))

const electoratesHref = computed(() => `/elections/${slugs.value.e}/${slugs.value.v}/electorates`)

/**
 * The leader's colour, split along the diagonal where the party has two.
 *
 * The bottom left to top right diagonal, primary colour above, the same as the
 * seats on the Parliament page.
 */
function squareStyle(colour: string, alternate: string | null) {
    return { background: partyFill(colour, alternate, 'diagonal') }
}

/** Diagonal lines both ways over the leader's colour. */
function hatchStyle(colour: string, alternate: string | null = null) {
    const line = 'rgb(255 255 255 / 0.6)'
    const stripes = (angle: number) =>
        `repeating-linear-gradient(${angle}deg, ${line} 0 1.5px, transparent 1.5px 5px)`
    return {
        background: `${stripes(45)}, ${stripes(-45)}, ${partyFill(colour, alternate, 'diagonal')}`,
    }
}

function squareFor(electorate: EntityNumber, name: string) {
    const result = store.computedElectorateResult(slugs.value.e, slugs.value.v, electorate)
    const leader = result?.firstPlace?.length === 1 ? result.firstPlace[0]! : null
    const candidate = leader === null ? null : store.candidate(slugs.value.e, slugs.value.v, leader)
    const party = candidate?.party === null || candidate?.party === undefined
        ? null
        : store.party(slugs.value.e, slugs.value.v, candidate.party)

    const colour = candidate ? store.partyColour(slugs.value.e, slugs.value.v, party?.number ?? null) : null
    const alternate = candidate
        ? store.partyAlternateColour(slugs.value.e, slugs.value.v, party?.number ?? null)
        : null
    const flipped = candidate ? flippedFor(electorate) === true : false

    let leaderText: string
    if (result?.resultStatus === 'indeterminate') leaderText = 'Leading candidates tied'
    else if (candidate) leaderText = `${candidate.name} (${party?.short_name || party?.name || 'Independent'})`
    else leaderText = 'Not counted yet'

    const margin = candidate && result?.margin !== null && result?.margin !== undefined
        ? `Leads by ${formatCount(result.margin)} votes`
            + (result.marginPercentage !== null ? ` (${formatPoints(result.marginPercentage)})` : '')
        : null

    const outcome = candidate ? noteFor(electorate).outcome : null

    return {
        electorate,
        name,
        href: `/elections/${slugs.value.e}/${slugs.value.v}/electorates/${electorate}`,
        colour,
        style: colour
            ? (flipped ? hatchStyle(colour, alternate) : squareStyle(colour, alternate))
            : undefined,
        leader: leaderText,
        margin,
        outcome,
        ariaLabel: [name, leaderText, outcome].filter(Boolean).join('. '),
    }
}

const groups = computed(() => {
    const electorates = store.referenceData(slugs.value.e, slugs.value.v)?.electorates ?? []
    const typeOf = (number: EntityNumber) =>
        store.persistentElectorateFor(slugs.value.e, slugs.value.v, number)?.electorate_type ?? 'general'

    return ([
        { type: 'general', label: 'General electorates' },
        { type: 'maori', label: 'Māori electorates' },
    ] as const)
        .map(group => ({
            ...group,
            squares: electorates
                .filter(electorate => typeOf(electorate.number) === group.type)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(electorate => squareFor(electorate.number, electorate.name)),
        }))
        .filter(group => group.squares.length)
})
</script>

<style scoped>
.electorate-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(1.25rem, 1fr));
    gap: 0.25rem;
}
</style>
