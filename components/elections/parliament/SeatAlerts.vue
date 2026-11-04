<template>
    <div v-if="lastSeat || electorates || underhang" class="space-y-2">
        <UAlert v-if="underhang" color="warning" variant="subtle" icon="i-lucide-user-x"
            :title="underhang.title" :description="underhang.description" />
        <UAlert v-if="lastSeat" color="warning" variant="subtle" icon="i-lucide-scale"
            :title="lastSeat.title" :description="lastSeat.description" />
        <UAlert v-if="electorates" color="warning" variant="subtle" icon="i-lucide-scale"
            :title="electorates.title" :description="electorates.description" />
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore } from '~/stores/electionData'
import { pluralise } from '~/utils/elections/format'

/**
 * Seats nobody has won yet, said beside the totals they are missing from.
 *
 * Shown wherever seat totals are, rather than only on the Parliament page:
 * a tied seat is left out of every party's total and drawn as an empty seat,
 * and a reader looking at those totals needs to know why they do not add up.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

/** "A and B", or "A, B and C". */
function joined(names: string[], conjunction = 'and'): string {
    if (names.length <= 1) return names.join('')
    return `${names.slice(0, -1).join(', ')} ${conjunction} ${names[names.length - 1]}`
}

/**
 * Seats left vacant because a list ran out.
 *
 * Named per party, and kept apart from any overhang: one can offset the other
 * in the House's size, which is exactly when a reader would otherwise miss both.
 */
const underhang = computed(() => {
    const { underhang: seats, underhangByParty, overhang, houseSize } = props.allocation
    if (seats === 0) return null

    const parties = [...underhangByParty.entries()].map(([party, vacant]) => {
        const name = store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party'
        return `${name} is entitled to ${pluralise(vacant, 'more seat')} than its list has `
            + 'candidates to fill.'
    })

    const net = overhang > 0
        ? ` This is separate from the overhang of ${pluralise(overhang, 'seat')}, so Parliament `
            + `has ${pluralise(houseSize, 'seat')}.`
        : ` Parliament has ${pluralise(seats, 'fewer member')} as a result.`

    return {
        title: seats === 1 ? 'A seat is left vacant' : `${seats} seats are left vacant`,
        description: `${parties.join(' ')} Those seats stay vacant until the next election and `
            + `are not given to any other party.${net}`,
    }
})

const lastSeat = computed(() => {
    const seats = props.allocation.undecidedSeats
    if (seats === 0) return null

    const parties = [...new Set(props.allocation.ties.map(quotient => quotient.party))]
        .map(party => store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party')

    return {
        title: seats === 1 ? 'The last seat is tied' : `The last ${seats} seats are tied`,
        description: `${joined(parties)} have an equal claim to `
            + `${seats === 1 ? 'the final seat' : `the final ${seats} seats`}. `
            + 'The law settles this by lot, so '
            + `${seats === 1 ? 'the seat is' : 'the seats are'} left empty and not counted to any party.`,
    }
})

const electorates = computed(() => {
    const tied = props.allocation.undecidedElectorates
    if (tied.length === 0) return null

    const names = tied.map(number =>
        store.electorate(slugs.value.e, slugs.value.v, number)?.name ?? 'Unknown electorate')

    const one = tied.length === 1
    const outcomes = props.allocation.tieOutcomes
    const sizes = outcomes?.houseSizes ?? []

    // What hangs on the lot. Worked out by trying each result, so this says
    // only what is so -- not every tie can change the House.
    let consequence: string
    if (outcomes === null) {
        consequence = `The determination of the ${one ? 'tie' : 'ties'} may affect the size of `
            + 'Parliament and the seats each party holds.'
    }
    else if (sizes.length > 1) {
        consequence = `The determination of the ${one ? 'tie' : 'ties'} may affect the size of `
            + `Parliament, which would have ${joined(sizes.map(String), 'or')} seats.`
    }
    else if (sizes[0] !== props.allocation.houseSize || outcomes.totalsVary) {
        consequence = `The determination of the ${one ? 'tie' : 'ties'} may affect the seats `
            + 'each party holds.'
            + (sizes[0] !== props.allocation.houseSize
                ? ` Parliament would have ${sizes[0]} seats once it is decided.`
                : '')
    }
    else {
        consequence = `The determination of the ${one ? 'tie' : 'ties'} does not change the size `
            + 'of Parliament or any party\'s total, only whether '
            + `${one ? 'that seat is' : 'those seats are'} held by an electorate or a list member.`
    }

    return {
        title: one ? 'An electorate is tied' : `${tied.length} electorates are tied`,
        description: `The leading candidates in ${joined(names)} have the same number of votes, `
            + `so ${one ? 'the electorate is' : 'those electorates are'} not counted to any `
            + `party. ${consequence}`,
    }
})
</script>
