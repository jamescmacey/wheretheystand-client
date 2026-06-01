<template>
    <UContainer class="my-8">
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-2">Votes</h3>
            <p class="text-sm text-muted">
                Reading votes this member participated in. Only votes with a matched individual record are shown.
            </p>
        </div>
        <WContentPaginatedContent
            :endpoint="'votes/?person_slug=' + person.slug"
            item-label="votes"
            :items-per-page="10"
            url-prefix="votes"
            :query-params="defaultQueryParams"
        >
            <template #filters="{ filters, updateFilter }">
                <UCard variant="subtle" class="mb-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <UFormField label="Sort by" name="ordering">
                            <USelect
                                :items="sortOptions"
                                :model-value="filters.ordering || '-date'"
                                @update:model-value="(value) => updateFilter('ordering', value)"
                                placeholder="Sort by..."
                                class="w-full"
                            />
                        </UFormField>

                        <UFormField label="Their vote" name="position">
                            <USelect
                                :items="positionOptions"
                                :model-value="filters.position || null"
                                @update:model-value="(value) => updateFilter('position', value)"
                                placeholder="All positions"
                                class="w-full"
                            />
                        </UFormField>

                        <UFormField label="Vote result" name="motion_agreed">
                            <USelect
                                :items="voteResultOptions"
                                :model-value="filters.motion_agreed ?? null"
                                @update:model-value="(value) => updateFilter('motion_agreed', value)"
                                placeholder="Any result"
                                class="w-full"
                            />
                        </UFormField>

                        <UFormField label="Vote type" name="vote_type">
                            <USelect
                                :items="voteTypeOptions"
                                :model-value="filters.vote_type || null"
                                @update:model-value="(value) => updateFilter('vote_type', value)"
                                placeholder="All types"
                                class="w-full"
                            />
                        </UFormField>
                    </div>
                </UCard>
            </template>
            <template #content="{ items }">
                <UCard variant="subtle" id="votes">
                    <div class="space-y-2">
                        <div v-for="(item, i) in items" :key="item.id">
                            <UPageCard variant="ghost" :to="'/votes/' + item.id">
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div class="min-w-0 space-y-2">
                                            <h5 class="font-semibold">
                                                {{ item.bill?.name ?? 'Unknown bill' }}
                                            </h5>
                                            <p class="text-sm text-muted">
                                                {{ formatVoteDate(item.date) }} · {{ ordinalReading(item.reading) }} reading
                                                <span v-if="voteTypeLabel(item)">
                                                    · {{ voteTypeLabel(item) }}
                                                </span>
                                            </p>
                                            <div class="flex flex-wrap items-center gap-2">
                                                <UBadge
                                                    v-if="item.position"
                                                    variant="soft"
                                                    :color="positionBadgeColor(item.position)"
                                                >
                                                    {{ positionLabel(item.position) }}
                                                </UBadge>
                                                <UBadge
                                                    variant="outline"
                                                    :color="item.motion_agreed ? 'success' : 'error'"
                                                >
                                                    {{ item.motion_agreed ? 'Passed' : 'Defeated' }}
                                                </UBadge>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-4 gap-2 text-center">
                                            <div class="flex flex-col items-center">
                                                <span class="font-semibold">{{ item.ayes }}</span>
                                                <span class="text-muted text-xs pb-1 border-b-2 border-emerald-500">Aye</span>
                                            </div>
                                            <div class="flex flex-col items-center">
                                                <span class="font-semibold">{{ item.noes }}</span>
                                                <span class="text-muted text-xs pb-1 border-b-2 border-rose-500">No</span>
                                            </div>
                                            <div class="flex flex-col items-center">
                                                <span class="font-semibold">{{ item.abstentions }}</span>
                                                <span class="text-muted text-xs pb-1 border-b-2 border-amber-500">Abstain</span>
                                            </div>
                                            <div class="flex flex-col items-center">
                                                <span class="font-semibold">{{ item.absentees }}</span>
                                                <span class="text-muted text-xs pb-1 border-b-2 border-sky-500">Absent</span>
                                            </div>
                                        </div>
                                    </div>
                            </UPageCard>
                            <USeparator v-if="i < (items?.length || 0) - 1" class="my-4" />
                        </div>
                        <UEmpty
                            v-if="items.length === 0"
                            title="No votes found"
                            description="No reading votes with a matched record were found for this person."
                        />
                    </div>
                </UCard>
            </template>
        </WContentPaginatedContent>
    </UContainer>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

defineProps({
    person: {
        type: Object,
        required: true,
    },
})

type VoteRow = {
    id: string
    date: string
    reading: number
    ayes: number
    noes: number
    abstentions: number
    absentees: number
    motion_agreed: boolean
    vote_type?: string | null
    contains_split_party_votes?: boolean
    position?: 'aye' | 'no' | 'abstention' | 'absent' | null
    bill?: { id?: string; name?: string } | null
}

const defaultQueryParams = {
    ordering: '-date',
}

const sortOptions = [
    { label: 'Date (newest first)', value: '-date' },
    { label: 'Date (oldest first)', value: 'date' },
    { label: 'Bill name (A-Z)', value: 'bill__name' },
    { label: 'Bill name (Z-A)', value: '-bill__name' },
]

const positionOptions = [
    { label: 'All positions', value: null },
    { label: 'Aye', value: 'aye' },
    { label: 'No', value: 'no' },
    { label: 'Abstention', value: 'abstention' },
    { label: 'Absent', value: 'absent' },
]

const voteResultOptions = [
    { label: 'Any result', value: null },
    { label: 'Passed', value: 'true' },
    { label: 'Defeated', value: 'false' },
]

const voteTypeOptions = [
    { label: 'All types', value: null },
    { label: 'Party vote', value: 'party' },
    { label: 'Personal vote', value: 'personal' },
]

function formatVoteDate(date: string) {
    return format(new Date(date), 'd MMMM yyyy')
}

function ordinalReading(n: number): string {
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
}

function voteTypeLabel(vote: VoteRow): string | null {
    if (vote.contains_split_party_votes) return 'Split party vote'
    if (vote.vote_type === 'party') return 'Party vote'
    if (vote.vote_type === 'personal') return 'Personal vote'
    return null
}

function positionLabel(position: VoteRow['position']): string {
    if (position === 'aye') return 'Voted aye'
    if (position === 'no') return 'Voted no'
    if (position === 'abstention') return 'Abstained'
    if (position === 'absent') return 'Absent'
    return 'Unknown'
}

function positionBadgeColor(position: VoteRow['position']): 'success' | 'error' | 'warning' | 'info' {
    if (position === 'aye') return 'success'
    if (position === 'no') return 'error'
    if (position === 'abstention') return 'warning'
    return 'info'
}
</script>
