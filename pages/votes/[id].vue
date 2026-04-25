<template>
    <div>
        <PageHeader
            :pageTitle="pageTitle"
            :pageSubtitle="pageSubtitle"
            :pageDate="vote?.date ?? undefined"
            :metaPageTitle="metaPageTitle"
        />
        <UContainer class="my-8">
            <div v-if="status === 'pending'" class="my-16 flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading vote…</h3>
                <UProgress animation="swing" class="w-48" />
            </div>
            <UEmpty
                v-else-if="status === 'error'"
                title="Vote unavailable"
                description="We could not load this vote. It may have been removed, or there was a temporary problem."
            >
                <template #actions>
                    <UButton
                        variant="subtle"
                        color="neutral"
                        class="mt-4"
                        icon="i-lucide-refresh-cw"
                        trailing
                        @click="refresh()"
                    >
                        Retry
                    </UButton>
                </template>
            </UEmpty>
            <UCard v-else-if="vote" variant="subtle">
                <template #header>
                    <h2 class="text-lg font-semibold">Result</h2>
                </template>
                <div class="flex flex-wrap gap-2 mb-4">
                    <UBadge :color="vote.motion_agreed ? 'success' : 'error'" variant="soft">
                        {{ vote.motion_agreed ? 'Motion agreed' : 'Motion not agreed' }}
                    </UBadge>
                    <UBadge v-if="vote.vote_type" color="neutral" variant="soft" class="capitalize">
                        {{ String(vote.vote_type).replace(/_/g, ' ') }} vote
                    </UBadge>
                    <UBadge color="neutral" variant="outline">
                        {{ ordinalReading(vote.reading) }} reading
                    </UBadge>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div v-for="t in tallyItems" :key="t.label" class="flex flex-col gap-1">
                        <span class="text-2xl font-semibold text-highlighted">{{ t.value }}</span>
                        <span class="text-xs uppercase text-muted">{{ t.label }}</span>
                    </div>
                </div>
                <template #footer>
                    <ULink
                        v-if="billLink"
                        :to="billLink"
                        class="text-sm inline-flex items-center gap-2 text-primary"
                    >
                        View bill: {{ billName }}
                        <UIcon name="i-lucide-arrow-right" class="size-4" />
                    </ULink>
                </template>
            </UCard>
        </UContainer>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

type BillRef = { id?: string; name?: string; ref?: string }

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
    bill?: BillRef | null
}

const voteKey = computed(() => `vote-${route.params.id}`)

const { data: vote, status, error, refresh } = await useAsyncData(
    voteKey,
    () => $fetch<VoteDetail>(`${apiBase}votes/${route.params.id}/`),
    { lazy: true },
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

const metaPageTitle = computed(() => {
    const v = vote.value
    if (!v) return 'Vote'
    const name = v.bill?.name
    return name ? `${name} — Vote` : 'Vote'
})

const billName = computed(() => vote.value?.bill?.name ?? 'Bill')

const billLink = computed(() => {
    const id = vote.value?.bill?.id
    if (!id) return ''
    return `/bills/${id}`
})

const tallyItems = computed(() => {
    const v = vote.value
    if (!v) return []
    return [
        { label: 'Ayes', value: v.ayes },
        { label: 'Noes', value: v.noes },
        { label: 'Abstentions', value: v.abstentions },
        { label: 'Absentees', value: v.absentees },
    ]
})

function ordinalReading(n: number): string {
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
}
</script>
