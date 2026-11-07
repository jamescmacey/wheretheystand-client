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
                    <ElectionsResultsPartySwatch :colour="group.colour" :alternate="group.alternate" />
                    <h4 class="font-bold truncate">{{ group.name }}</h4>
                    <span class="text-sm text-muted">{{ pluralise(group.members.length, 'seat') }}</span>
                </div>

                <ul class="divide-y divide-default/50">
                    <li v-for="member in group.members" :key="`${member.origin}-${member.candidate}`"
                        class="flex items-center justify-between gap-3 py-2">
                        <ElectionsEntityCandidateLabel :link="false" :election="election" :resultsVersion="resultsVersion"
                            :candidate="member.candidate" :swatch="false" :show-party="false" />
                        <span class="text-sm text-muted shrink-0">{{ originLabel(member) }}</span>
                    </li>
                </ul>
            </div>
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

/** The same name `CandidateLabel` shows for the member. */
function memberName(member: ElectedMember): string {
    const { e, v } = slugs.value
    if (member.candidate === null) return ''
    return store.candidate(e, v, member.candidate)?.name || ''
}

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
            alternate: store.partyAlternateColour(slugs.value.e, slugs.value.v, party),
            // A to Z by the name the row shows, so a reader can find someone.
            members: [...members].sort((a, b) =>
                memberName(a).localeCompare(memberName(b), undefined, { sensitivity: 'base' })),
        }))
        .sort((a, b) => b.members.length - a.members.length)
})

const summary = computed(() => pluralise(props.allocation.members.length, 'member'))

function originLabel(member: ElectedMember): string {
    if (member.origin === 'list') return 'List'
    const electorate = member.electorate === null
        ? null
        : store.electorate(slugs.value.e, slugs.value.v, member.electorate)
    return electorate?.name ?? 'Electorate'
}
</script>
