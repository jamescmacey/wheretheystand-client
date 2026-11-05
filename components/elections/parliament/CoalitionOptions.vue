<template>
    <UCard v-if="seated.length" variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Government formation</h3>
                <div class="flex items-center gap-3">
                    <p class="text-sm text-muted">{{ pluralise(majority, 'seat') }} for a majority</p>
                    <UButton color="neutral" variant="subtle" size="sm" icon="i-lucide-plus"
                        label="Add arrangement" @click="add" />
                </div>
            </div>
        </template>

        <ul v-if="rows.length" class="divide-y divide-default -my-2">
            <li v-for="row in rows" :key="row.id" class="py-2 flex items-center gap-3">
                <!-- Gold, and only where the coalition could govern alone: the
                     one fact about a row a reader is scanning for. The slot is
                     kept on every row so the parties line up beneath it. -->
                <span class="w-4 shrink-0 flex">
                    <UIcon v-if="row.hasMajority" name="i-lucide-crown" class="size-4 text-amber-500"
                        role="img" aria-label="Has a majority" />
                </span>
                <!-- One line per coalition: each party's swatch, abbreviation and
                     seats, joined by a plus, so the sum reads as a sum. -->
                <div class="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <template v-for="(party, index) in row.parties" :key="party.key">
                        <span v-if="index" class="text-muted" aria-hidden="true">+</span>
                        <UTooltip v-if="row.editable" :text="`Remove ${party.name}`" :delay-duration="0">
                            <button type="button" :aria-label="`Remove ${party.name}`"
                                class="flex items-stretch gap-1.5 h-5 rounded-sm hover:opacity-60 hover:line-through cursor-pointer"
                                @click="removeParty(row.id, party.key)">
                                <ElectionsResultsPartySwatch :colour="party.colour" :alternate="party.alternate" />
                                <span class="font-medium leading-5">{{ party.abbreviation }}</span>
                                <span class="tabular-nums leading-5 text-muted">{{ party.seats }}</span>
                            </button>
                        </UTooltip>
                        <span v-else class="flex items-stretch gap-1.5 h-5" :title="party.name">
                            <ElectionsResultsPartySwatch :colour="party.colour" :alternate="party.alternate" />
                            <span class="font-medium leading-5">{{ party.abbreviation }}</span>
                            <span class="tabular-nums leading-5 text-muted">{{ party.seats }}</span>
                        </span>
                    </template>

                    <UDropdownMenu v-if="row.editable && row.available.length" :items="row.available"
                        :content="{ align: 'start', collisionPadding: 8 }"
                        :ui="{ content: 'max-h-(--reka-dropdown-menu-content-available-height) max-w-[calc(100vw-1rem)]' }">
                        <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-plus"
                            label="Add party" />
                        <template #item-leading="{ item }">
                            <span class="size-3 rounded-full shrink-0"
                                :style="{ background: partyFill(item.colour, item.alternate, 'horizontal') }" />
                        </template>
                    </UDropdownMenu>
                </div>

                <p class="shrink-0 text-lg font-bold tabular-nums">{{ row.seats }}</p>
                <!-- Kept on every row once any row has a bin, so the totals
                     stay in one column. -->
                <span v-if="custom.length" class="w-6 shrink-0 flex justify-end">
                    <UButton v-if="row.editable" color="neutral" variant="ghost" size="xs"
                        icon="i-lucide-trash-2" aria-label="Remove arrangement" @click="remove(row.id)" />
                </span>
            </li>
        </ul>

        <p v-else class="text-sm text-muted">
            Add a government arrangement to see whether a group of parties has enough seats to govern.
        </p>

        <template #footer>
            <p class="text-xs text-muted">
                Government arrangements you add are saved on this device only. Pre-selected government arrangements are
                configured based on existing coalition arrangements and prevailing media reporting
                of possible arrangements.
            </p>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'
import type { Bloc } from '~/utils/elections/blocs'
import { useElectionDataStore } from '~/stores/electionData'
import { useBlocOrder } from '~/composables/useBlocOrder'
import { useCoalitions } from '~/composables/useCoalitions'
import { coalitionSeats, majorityFor, partyKey } from '~/utils/elections/coalitions'
import { hasBlocs } from '~/utils/elections/blocs'
import { partyFill } from '~/utils/elections/partyFill'
import { pluralise } from '~/utils/elections/format'
import { partyAbbreviation } from '~/utils/elections/partyAbbreviation'

/**
 * Who could govern together, and whether they have the seats to.
 *
 * The two curated blocs come first, since they are the coalitions most readers
 * will be asking about. Below them, any the reader has built one party at a
 * time, saved on the device for this election.
 *
 * Read from the same allocation as the chamber above, so a coalition's total
 * always agrees with the seats drawn for its parties.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))
const { blocs, order, bloc } = useBlocOrder(() => props.election, () => props.resultsVersion)
const { custom, add, remove, addParty, removeParty } = useCoalitions(() => props.election.slug)

const majority = computed(() => majorityFor(props.allocation.houseSize))

const persistentFor = (party: EntityNumber) =>
    store.persistentPartyForParty(slugs.value.e, slugs.value.v, party)

const keyFor = (party: EntityNumber) => partyKey(party, persistentFor(party)?.id ?? null)

interface CoalitionParty {
    key: string
    number: EntityNumber
    name: string
    abbreviation: string
    seats: number
    colour: string
    alternate: string | null
}

function describe(party: EntityNumber, seats: number): CoalitionParty {
    const reference = store.party(slugs.value.e, slugs.value.v, party)
    const persistent = persistentFor(party)
    const name = reference?.name ?? 'Unknown party'
    return {
        key: keyFor(party),
        number: party,
        name,
        // The same short form the results table uses on narrow screens.
        abbreviation: partyAbbreviation(reference, persistent) ?? name,
        seats,
        colour: store.partyColour(slugs.value.e, slugs.value.v, party),
        alternate: store.partyAlternateColour(slugs.value.e, slugs.value.v, party),
    }
}

/** Every party with a seat, in chamber order. */
const seated = computed<CoalitionParty[]>(() =>
    order([...props.allocation.totalSeats.entries()].filter(([, seats]) => seats > 0))
        .map(([party, seats]) => describe(party, seats)))

/**
 * Parties with a party vote but no seat, largest vote first.
 *
 * Offered after the seated parties rather than left out: a party short of a
 * seat can still be part of an arrangement, and the reader may want to see
 * that it adds nothing.
 */
const unseated = computed<CoalitionParty[]>(() => props.allocation.qualification
    .filter(entry => entry.votes > 0 && !(props.allocation.totalSeats.get(entry.party) ?? 0))
    .sort((a, b) => b.votes - a.votes)
    .map(entry => describe(entry.party, 0)))

type PartyItem = DropdownMenuItem & { colour: string, alternate: string | null }

interface Row {
    id: string
    editable: boolean
    /** Parties in the coalition with a seat in this result, largest first. */
    parties: CoalitionParty[]
    /** Parties that could still be added: those with a seat, then those without. */
    available: PartyItem[][]
    seats: number
    hasMajority: boolean
}

/** Largest first, then by abbreviation, so the party leading a bloc reads first. */
const bySize = (a: CoalitionParty, b: CoalitionParty) =>
    b.seats - a.seats || a.abbreviation.localeCompare(b.abbreviation, 'en-NZ')

function row(id: string, editable: boolean, keys: string[]): Row {
    const wanted = new Set(keys)
    const seats = coalitionSeats(keys, props.allocation.totalSeats, keyFor)
    const item = (party: CoalitionParty): PartyItem => ({
        label: `${party.name} (${party.seats})`,
        colour: party.colour,
        alternate: party.alternate,
        onSelect: () => addParty(id, party.key),
    })
    // Grouped, so the menu draws a divider between the parties with seats
    // and the ones without.
    const available = editable
        ? [seated.value, unseated.value]
            .map(group => group.filter(party => !wanted.has(party.key)).map(item))
            .filter(group => group.length)
        : []
    return {
        id,
        editable,
        // Parties without a seat sort last of their own accord, on zero.
        parties: [...seated.value, ...unseated.value]
            .filter(party => wanted.has(party.key)).sort(bySize),
        available,
        seats,
        hasMajority: seats >= majority.value,
    }
}

const blocRow = (side: Exclude<Bloc, 'crossbench'>) => row(`bloc-${side}`, false,
    seated.value.filter(party => bloc(party.number) === side).map(party => party.key))

const rows = computed<Row[]>(() => [
    ...(hasBlocs(blocs.value) ? [blocRow('left'), blocRow('right')] : []),
    ...custom.value.map(coalition => row(coalition.id, true, coalition.parties)),
])
</script>
