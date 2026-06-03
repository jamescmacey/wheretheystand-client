<template>
    <div>
        <PageHeader :pageTitle="pageTitle" :pageSubtitle="pageSubtitle" :pageDate="vote?.date ?? undefined" />
        <UContainer class="mb-8">
            <div v-if="status === 'pending'" class="my-16 flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading vote…</h3>
                <UProgress animation="swing" class="w-48" />
            </div>
            <UEmpty v-else-if="status === 'error'" title="Vote unavailable"
                description="We could not load this vote. It may have been removed, or there was a temporary problem.">
                <template #actions>
                    <UButton variant="subtle" color="neutral" class="mt-4" icon="i-lucide-refresh-cw" trailing
                        @click="refresh()">
                        Retry
                    </UButton>
                </template>
            </UEmpty>
            <template v-else-if="vote">
                <div class="my-4 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-x-2">
                        <UButton
                        :to="`/bills/${vote.bill?.id}`"
                        variant="outline"
                        icon="i-lucide-arrow-left"
                        class="mb-2 lg:mb-0"
                    >
                        Back to bill
                    </UButton>
                    <UButton v-if="vote.stub && vote.stub.hansard_search_result"
                        :href="`https://hansard.parliament.nz/hansard-transcript/${vote.stub?.hansard_search_result?.result_sitting_date}/?sId=${vote.stub?.hansard_search_result?.result_id.replace(/-/g, '')}`"
                        target="_blank"
                        variant="outline"
                        icon="i-lucide-book-open"
                        class="mb-2 lg:mb-0"
                    >
                        Read in Hansard
                    </UButton>
                    </div>
                    
                    <div class="text-muted font-semibold">
                        {{ voteTypeLabel(vote) }}
                    </div>
                </div>
     
                <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-2 space-y-2">
                    <div class="contents">
                        <UCard variant="subtle" class="col-span-1 h-full flex items-center justify-center"
                            style="height: 100%;">
                            <div v-if="vote.motion_agreed" class="text-center">
                                <UIcon name="i-material-symbols-check-circle-rounded" class="w-12 h-12 text-success" />
                                <h4 class="font-semibold text-xl">{{ vote.reading === 3 ? "Bill passed" : "Reading agreed" }}</h4>
                            </div>
                            <div v-else class="text-center">
                                <UIcon name="i-mdi-close-circle" class="w-12 h-12 text-error" />
                                <h4 class="font-semibold text-xl">Bill defeated</h4>
                            </div>
                        </UCard>
                        <UPageCard variant="subtle" class="col-span-2 h-full flex items-center mt-2 lg:mt-0" style="height: 100%;">
                            <div class="w-full">
                                <div class="grid grid-cols-4 gap-2 text-center">
                                    <div class="flex flex-col items-center">
                                        <span class="font-semibold text-2xl xl:text-3xl">{{ vote.ayes }}</span>
                                        <span class="text-muted text-sm pb-1 border-b-2 border-emerald-500">Aye</span>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <span class="font-semibold text-2xl xl:text-3xl">{{ vote.noes }}</span>
                                        <span class="text-muted text-sm pb-1 border-b-2 border-rose-500">No</span>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <span class="font-semibold text-2xl xl:text-3xl">{{ vote.abstentions }}</span>
                                        <span
                                            class="text-muted text-sm pb-1 border-b-2 border-amber-500">Abstentions</span>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <span class="font-semibold text-2xl xl:text-3xl">{{ vote.absentees }}</span>
                                        <span class="text-muted text-sm pb-1 border-b-2 border-sky-500">Absent</span>
                                    </div>
                                </div>
                            </div>
                        </UPageCard>
                    </div>
                </div>
                <UPageCard variant="subtle" class="mt-4" v-if="vote.reason_text">
                    <p>
                        {{ vote.reason_text }} <span class="font-semibold" v-if="vote.outcome_text">{{ vote.outcome_text }}</span>
             
                    </p>
                </UPageCard>
                <USeparator class="my-4"/>
                <div>
                    <h3 class="text-lg font-bold mb-2">Ayes</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <template v-for="record in ayes" :key="record.id">
                        <VotesPartyCard v-if="record.party && !record.person" :party="record.party" :contribution="record.contribution ?? 0" />
                        <WContentPersonCard v-if="record.person" :person="record.person" :party="record.party" />
                    </template>
                    <p v-if="!ayes || ayes.length === 0" class="text-muted text-sm">No ayes</p>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-bold my-2">Noes</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <template v-for="record in noes" :key="record.id">
                        <VotesPartyCard v-if="record.party && !record.person" :party="record.party" :contribution="record.contribution ?? 0" />
                        <WContentPersonCard v-if="record.person" :person="record.person" :party="record.party" />
                    </template>
                    <p v-if="!noes || noes.length === 0" class="text-muted text-sm">No noes</p>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-bold my-2">Abstentions</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <template v-for="record in abstentions" :key="record.id">
                        <VotesPartyCard v-if="record.party && !record.person" :party="record.party" :contribution="record.contribution ?? 0" />
                        <WContentPersonCard v-if="record.person" :person="record.person" :party="record.party" />
                    </template>
                    <p v-if="!abstentions || abstentions.length === 0" class="text-muted text-sm">No abstentions</p>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-bold my-2">Absentees</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <template v-for="record in absentees" :key="record.id">
                        <VotesPartyCard v-if="record.party && !record.person" :party="record.party" :contribution="record.contribution ?? 0" />
                        <WContentPersonCard v-if="record.person" :person="record.person" :party="record.party" />
                    </template>
                    <p v-if="!absentees || absentees.length === 0" class="text-muted text-sm">No absentees</p>
                    </div>
                </div>
                <p v-if="vote.retrieved_at" class="mt-8 text-xs text-muted">Last updated at {{ formatDateTime(vote.retrieved_at) }} {{ methodTextForMethod(vote.import_method) }}</p>
            </template>
        </UContainer>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

type BillRef = { id?: string; name?: string; ref?: string }
type PersonRef = { id?: string; display_name?: string, first_name?: string, last_name?: string, photo?: { file?: string } | null, cached_description?: string | null, cached_colour?: string | null }
type PartyRef = { id?: string; display_name?: string, short_name?: string, abbreviation?: string, colour?: string, slug?: string }
type StubRef = {
    date: string,
    hansard_search_result: {
        result_id: string,
        result_sitting_date: string,
    }
}

type VoteRecord = {
    id: string
    person: PersonRef
    party: PartyRef
    is_proxy_vote: boolean
    is_split_party_vote: boolean
    position: "aye" | "no" | "abstention" | "absent"
    contribution: number | null
}

type VoteDetail = {
    id: string
    date: string
    reading: number
    ayes: number
    noes: number
    abstentions: number
    absentees: number
    motion_agreed: boolean
    vote_type?: string | null
    bill?: BillRef | null,
    contains_split_party_votes: boolean | null
    import_method: "parse" | "api" | "manual" | "ai"
    outcome_text: string | null
    reason_text: string | null
    hansard_status: string | null
    hansard_api_id: string | null
    parliament_document_id: string | null
    legacy_id: number | null
    retrieved_at: string | null
    created_at: string | null
    updated_at: string | null
    vote_records: VoteRecord[]
    stub?: StubRef | null
}

const voteKey = computed(() => `vote-${route.params.id}`)

function methodTextForMethod(method: "parse" | "api" | "manual" | "ai"): string {
    if (method === 'parse') return 'using the WhereTheyStand v1 parser.'
    if (method === 'api') return 'using the WhereTheyStand v2 parser.'
    if (method === 'manual') return 'manually.'
    if (method === 'ai') return 'using artificial intelligence-assisted parsing.'
    return ''
}

const { data: vote, status, error, refresh } = await useAsyncData(
    voteKey,
    () => $fetch<VoteDetail>(`${apiBase}votes/${route.params.id}/`),
)

const pageTitle = computed(() => {
    const b = vote.value?.bill
    const name = b?.name
    if (name) return name
    return 'Vote'
})

const pageSubtitle = computed(() => {
    const v = vote.value
    if (!v) return ''
    return `${ordinalReading(v.reading)} reading`
})

function ordinalReading(n: number): string {
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
}

import { format } from 'date-fns'

function voteTypeLabel(vote: VoteDetail): string | null {
    if (vote.vote_type === 'voice') return 'Voice vote'
    if (vote.vote_type === 'party') return 'Party vote'
    if (vote.vote_type === 'personal') return 'Personal vote'
    return null
}

usePageSeo({
    title: () => {
        const v = vote.value
        if (!v) return 'Vote'
        const name = v.bill?.name
        return name ? `${name} — Vote` : 'Vote'
    },
    description: () => {
        const v = vote.value
        if (!v) return undefined
        const parts: string[] = []
        if (v.bill?.name) parts.push(`Parliamentary vote on ${v.bill.name}.`)
        const label = voteTypeLabel(v)
        if (label) parts.push(`${label}.`)
        if (v.date) parts.push(format(new Date(v.date), 'd MMMM yyyy') + '.')
        return parts.join(' ')
    },
})

function formatDateTime(date?: string | null): string {
    if (!date) return ''
    return format(new Date(date), 'd MMMM yyyy HH:mm')
}

const ayes = computed(() => {
    return vote.value?.vote_records
        .filter(record => record.position === 'aye')
        .sort((a, b) => (a.party?.display_name ?? '').localeCompare(b.party?.display_name ?? ''))
        .sort((a, b) => (a.person?.first_name ?? '').localeCompare(b.person?.first_name ?? ''))
        .sort((a, b) => (a.person?.last_name ?? '').localeCompare(b.person?.last_name ?? ''))
        .sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0))
})

const noes = computed(() => {
    return vote.value?.vote_records
        .filter(record => record.position === 'no')
        .sort((a, b) => (a.party?.display_name ?? '').localeCompare(b.party?.display_name ?? ''))
        .sort((a, b) => (a.person?.first_name ?? '').localeCompare(b.person?.first_name ?? ''))
        .sort((a, b) => (a.person?.last_name ?? '').localeCompare(b.person?.last_name ?? ''))
        .sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0))
})

const abstentions = computed(() => {
    return vote.value?.vote_records
        .filter(record => record.position === 'abstention')
        .sort((a, b) => (a.party?.display_name ?? '').localeCompare(b.party?.display_name ?? ''))
        .sort((a, b) => (a.person?.first_name ?? '').localeCompare(b.person?.first_name ?? ''))
        .sort((a, b) => (a.person?.last_name ?? '').localeCompare(b.person?.last_name ?? ''))
        .sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0))
})

const absentees = computed(() => {
    return vote.value?.vote_records
        .filter(record => record.position === 'absent')
        .sort((a, b) => (a.party?.display_name ?? '').localeCompare(b.party?.display_name ?? ''))
        .sort((a, b) => (a.person?.first_name ?? '').localeCompare(b.person?.first_name ?? ''))
        .sort((a, b) => (a.person?.last_name ?? '').localeCompare(b.person?.last_name ?? ''))
        .sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0))
})
</script>
