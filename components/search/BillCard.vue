<template>
    <UPageCard variant="outline" :to="'/bills/' + bill.id">
        <h4 class="font-semibold">{{ bill.name }}</h4>
        <p v-if="bill.description" class="text-sm text-muted mt-2">
            {{ bill.description }}
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
            <UBadge v-if="bill.last_activity_date" variant="outline">
                Last activity {{ formatRelative(bill.last_activity_date) }}
            </UBadge>
            <UBadge v-if="bill.status" variant="outline" :color="statusBadgeColor(bill.status)">
                {{ billStatuses[bill.status]?.description ?? bill.status }}
            </UBadge>
            <span v-if="bill.bill_type" class="text-sm text-muted">
                {{ billTypes[bill.bill_type]?.description ?? bill.bill_type }}
            </span>
        </div>
    </UPageCard>

</template>

<script setup lang="ts">

const config = useRuntimeConfig()
const billStatuses = computed(
    () => (config.public.valueKeys?.billStatuses ?? {}) as Record<string, { description?: string; colour?: string }>,
)
const billTypes = computed(
    () => (config.public.valueKeys?.billTypes ?? {}) as Record<string, { description?: string }>,
)

function formatRelative(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const monthsApprox = Math.floor(days / 30)

    if (seconds < 60) {
        return 'just now'
    }
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    }
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    }
    if (days < 30) {
        return `${days} day${days !== 1 ? 's' : ''} ago`
    }
    if (days < 180) {
        if (monthsApprox === 1) {
            return 'last month'
        }
        return `${monthsApprox} months ago`
    }
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

function statusBadgeColor(status: string): 'error' | 'success' | 'warning' | 'info' | 'primary' | 'neutral' {
    const c = billStatuses.value[status]?.colour
    if (c === 'error' || c === 'success' || c === 'warning' || c === 'info' || c === 'primary' || c === 'neutral') {
        return c
    }
    return 'neutral'
}

defineProps({
    bill: {
        type: Object,
        required: true,
    }
})
</script>