<template>
    <UContainer class="my-8 space-y-8">
        <UCard v-if="status === 'error'" variant="subtle" class="w-full">
            <UEmpty title="Bill data unavailable"
                description="We could not load this bill yet, so example data is shown below.">
                <template #actions>
                    <UButton variant="subtle" color="neutral" @click="refresh?.()" class="mt-4"
                        icon="i-lucide-refresh-cw" trailing>
                        Retry
                    </UButton>
                </template>
            </UEmpty>
            <p v-if="error" class="text-muted text-xs text-center mt-4">
                {{ error.statusCode }}: {{ error }}
            </p>
        </UCard>

        <div class="grid gap-6 lg:grid-cols-3">
            <UCard class="lg:col-span-2">
                <template #header>
                    <div class="flex items-center justify-between gap-4">
                        <h2 class="text-lg font-semibold">About this bill</h2>
                    </div>
                </template>

                <p class="text-sm text-muted leading-relaxed">
                    {{ bill.summary }}
                </p>

                <div class="mt-5 space-y-5">
                    <div>
                        <h3 class="text-sm font-semibold">Read the bill</h3>
                        <div class="mt-2 flex flex-col gap-2 text-sm">
                            <ULink v-if="resources.billText" :href="resources.billText.url" target="_blank"
                                class="inline-flex items-center gap-2">
                                <UIcon name="i-lucide-file-text" class="text-muted" />
                                <span>{{ resources.billText.label }}</span>
                                <UIcon name="i-lucide-external-link" class="text-muted" />
                            </ULink>
                        </div>
                    </div>

                    <div v-if="votingMethod">
                        <h3 class="text-sm font-semibold">Voting method</h3>
                        <p class="mt-1 text-sm text-muted">
                            <span class="font-semibold text-default">{{ votingMethod.label }}:</span>
                            {{ votingMethod.description }}
                        </p>
                    </div>

                    <div v-if="proceduralNotes.length">
                        <h3 class="text-sm font-semibold">Procedural notes</h3>
                        <ul class="mt-2 space-y-2 text-sm text-muted">
                            <li v-for="note in proceduralNotes" :key="note.title">
                                <span class="font-semibold text-default">{{ note.title }}:</span>
                                {{ note.description }}
                                <ULink v-if="note.link" :href="note.link.url" target="_blank"
                                    class="inline-flex items-center gap-1">
                                    {{ note.link.label }}
                                    <UIcon name="i-lucide-external-link" class="text-muted" />
                                </ULink>
                            </li>
                        </ul>
                    </div>
                </div>

                <template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <ULink v-if="resources.parliament" :href="resources.parliament.url" target="_blank"
                            class="inline-flex items-center gap-2">
                            {{ resources.parliament.label }}
                            <UIcon name="i-lucide-external-link" class="text-muted" />
                        </ULink>
                        <ULink v-if="resources.json" :href="resources.json.url" target="_blank"
                            class="inline-flex items-center gap-2 text-muted">
                            <UIcon name="i-lucide-code" />
                            {{ resources.json.label }}
                        </ULink>
                    </div>
                </template>
            </UCard>

            <UCard>
                <template #header>
                    <div class="flex items-center justify-between gap-4">
                        <h2 class="text-lg font-semibold">Progress</h2>
                        <UBadge :color="statusMeta.colour" variant="soft">
                            {{ statusMeta.description }}
                        </UBadge>
                    </div>
                </template>
                <div class="space-y-3">
                    <p class="text-2xl font-semibold">{{ statusMeta.description }}</p>
                    <p class="text-sm text-muted">{{ bill.statusSummary }}</p>
                </div>
            </UCard>
        </div>

        <div>
            <h2 class="text-lg font-semibold mb-3">Member responsible</h2>
            <UCard>
                <div class="flex flex-wrap items-center gap-4">
                    <UAvatar :src="member.avatar" :alt="member.name" size="lg" />
                    <div class="flex-1 min-w-[180px]">
                        <p class="font-semibold">{{ member.name }}</p>
                        <p class="text-sm text-muted">{{ member.role }}</p>
                    </div>
                    <UButton v-if="member.link" variant="subtle" color="neutral" :to="member.link"
                        icon="i-lucide-arrow-right" trailing>
                        View profile
                    </UButton>
                </div>
            </UCard>
        </div>

        <div>
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h2 class="text-lg font-semibold">Votes</h2>
                <UBadge variant="soft" color="neutral">{{ votes.length }} readings</UBadge>
            </div>
            <div class="grid gap-4 lg:grid-cols-3">
                <UCard v-for="vote in votes" :key="vote.stage">
                    <div class="flex items-center justify-between gap-4">
                        <p class="text-xs font-semibold uppercase tracking-wide text-muted">{{ vote.stage }}</p>
                        <UBadge :color="voteStatusMeta(vote).color" variant="soft">
                            {{ voteStatusMeta(vote).label }}
                        </UBadge>
                    </div>
                    <p class="mt-2 text-sm text-muted" v-if="vote.date">{{ formatDate(vote.date) }}</p>
                    <p class="mt-2 text-sm text-muted" v-else>Not yet scheduled</p>
                    <p v-if="vote.details" class="mt-4 text-sm text-muted">{{ vote.details }}</p>
                    <div v-else-if="vote.totals" class="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                        <div v-for="total in totalsForVote(vote)" :key="total.label"
                            class="flex flex-col items-center gap-1">
                            <span class="text-lg font-semibold text-default">{{ total.value }}</span>
                            <span class="inline-flex items-center gap-1 text-[10px] uppercase text-muted">
                                <span :class="['h-2 w-2 rounded-full', total.color]" />
                                {{ total.label }}
                            </span>
                        </div>
                    </div>
                    <p v-else class="mt-4 text-sm text-muted">Totals not available yet.</p>
                </UCard>
            </div>
            <p v-if="bill.votesNote" class="mt-4 text-xs text-muted">{{ bill.votesNote }}</p>
            <p v-if="bill.lastSynced" class="mt-2 text-xs text-muted">{{ bill.lastSynced }}</p>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps({
    bill: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    error: {
        type: Object,
        default: null
    },
    refresh: {
        type: Function,
        default: null
    }
})

const config = useRuntimeConfig()

const { bill, status, error, refresh } = toRefs(props)

const resources = computed(() => bill.value?.resources ?? {})
const member = computed(() => bill.value?.member ?? {})
const votingMethod = computed(() => bill.value?.votingMethod ?? null)
const proceduralNotes = computed(() =>
    Array.isArray(bill.value?.proceduralNotes) ? bill.value.proceduralNotes : []
)
const votes = computed(() => (Array.isArray(bill.value?.votes) ? bill.value.votes : []))

const statusMeta = computed(() => {
    const statuses = config.public.valueKeys?.billStatuses ?? {}
    const key = bill.value?.status ?? 'unknown'
    return (statuses as Record<string, { description?: string; colour?: string }>)[key] ?? {
        description: 'Unknown',
        colour: 'neutral'
    }
})

const voteStatusLookup: Record<string, { label: string; color: string }> = {
    passed: { label: 'Passed', color: 'success' },
    defeated: { label: 'Defeated', color: 'error' },
    not_recorded: { label: 'Not recorded', color: 'neutral' },
    scheduled: { label: 'Scheduled', color: 'primary' }
}

const voteStatusMeta = (vote: Record<string, any>) => {
    return voteStatusLookup[vote.status] ?? { label: vote.status ?? 'Unknown', color: 'neutral' }
}

const totalsForVote = (vote: Record<string, any>) => {
    return [
        { label: 'Ayes', value: vote.totals?.ayes ?? 0, color: 'bg-emerald-500' },
        { label: 'Noes', value: vote.totals?.noes ?? 0, color: 'bg-rose-500' },
        { label: 'Abst.', value: vote.totals?.abstentions ?? 0, color: 'bg-amber-500' },
        { label: 'Abse.', value: vote.totals?.absent ?? 0, color: 'bg-sky-500' }
    ]
}

const formatDate = (date?: string) => {
    if (!date) return ''
    const parsedDate = date.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? new Date(date + 'T00:00:00')
        : new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return date
    return format(parsedDate, 'd MMMM yyyy')
}
</script>
