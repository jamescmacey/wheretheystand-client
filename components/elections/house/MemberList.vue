<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Members</h3>
                <p class="text-sm text-muted">{{ summary }}</p>
            </div>
        </template>

        <div class="space-y-6">
            <div v-for="group in groups" :key="group.party ?? 'none'">
                <div class="flex items-center gap-2 mb-2">
                    <ElectionsResultsPartySwatch :colour="group.colour" />
                    <h4 class="font-bold truncate">{{ group.name }}</h4>
                    <span class="text-sm text-muted">{{ pluralise(group.members.length, 'seat') }}</span>
                </div>

                <ul class="divide-y divide-default/50">
                    <li v-for="member in group.members" :key="`${member.origin}-${member.candidate}`"
                        class="flex items-center justify-between gap-3 py-2">
                        <ElectionsEntityCandidateLabel :election="election" :resultsVersion="resultsVersion"
                            :candidate="member.candidate" :swatch="false" :show-party="false" />
                        <span class="text-sm text-muted shrink-0">{{ originLabel(member) }}</span>
                    </li>
                </ul>
            </div>

            <UAlert v-if="allocation.unfilled > 0" color="warning" variant="subtle" icon="i-lucide-user-x"
                title="Seats that cannot be filled"
                :description="`${pluralise(allocation.unfilled, 'seat')} could not be filled because a party's list ran out of candidates.`" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { ElectedMember, SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore } from '~/stores/electionData'
import { pluralise } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const groups = computed(() => {
    const byParty = new Map<EntityNumber | null, ElectedMember[]>()
    for (const member of props.allocation.members) {
        const held = byParty.get(member.party) ?? []
        held.push(member)
        byParty.set(member.party, held)
    }

    return [...byParty.entries()]
        .map(([party, members]) => ({
            party,
            name: party === null
                ? 'Independent'
                : store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party',
            colour: store.partyColour(slugs.value.e, slugs.value.v, party),
            // Electorate members first, then the list in its own order.
            members: [...members].sort((a, b) => {
                if (a.origin !== b.origin) return a.origin === 'electorate' ? -1 : 1
                return (a.listPos ?? 0) - (b.listPos ?? 0)
            }),
        }))
        .sort((a, b) => b.members.length - a.members.length)
})

const summary = computed(() => pluralise(props.allocation.members.length, 'member'))

function originLabel(member: ElectedMember): string {
    if (member.origin === 'list') return `List ${member.listPos ?? ''}`.trim()
    const electorate = member.electorate === null
        ? null
        : store.electorate(slugs.value.e, slugs.value.v, member.electorate)
    return electorate?.name ?? 'Electorate'
}
</script>
