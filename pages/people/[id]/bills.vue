<template>
    <UContainer class="my-8">
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-2">Bills</h3>
        </div>
        <WContentPaginatedContent 
            :endpoint="'bills/?person=' + person.slug"
            item-label="bills" 
            :items-per-page="10" 
            url-prefix="bills"
            :query-params="defaultQueryParams">
            <template #filters="{ filters, updateFilter }">
                <UCard variant="subtle" class="mb-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <UFormField label="Sort by" name="ordering">
                            <USelect 
                                :items="sortOptions" 
                                :model-value="filters.ordering || '-introduction_date'"
                                @update:model-value="(value) => updateFilter('ordering', value)"
                                placeholder="Sort by..." class="w-full"
                            />
                        </UFormField>
                        
                        <UFormField label="Status" name="status">
                            <USelect 
                                :items="statusOptions" 
                                :model-value="filters.status || null"
                                @update:model-value="(value) => updateFilter('status', value)"
                                placeholder="All statuses"
                                class="w-full"
                            />
                        </UFormField>
                        
                        <UFormField label="Type" name="bill_type">
                            <USelect 
                                :items="typeOptions" 
                                :model-value="filters.bill_type || null"
                                @update:model-value="(value) => updateFilter('bill_type', value)"
                                placeholder="All types"
                                class="w-full"
                            />
                        </UFormField>
                    </div>
                </UCard>
            </template>
            <template #content="{ items }">
            <UCard variant="subtle" id="bills">
                <div class="space-y-2">
                        <div v-for="(item, i) in items" :key="item.id">
                            <UPageCard variant="ghost" :to="'/bills/' + item.id">
                                <template #body>
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h5>
                                                {{ item.name }}
                                            </h5>
                                        </div>
                                    </div>
                                    <p v-if="item.description" class="text-sm text-muted">
                                        {{ item.description }}
                                    </p>
                                    <div class="space-x-2 mt-2">
                                        <UBadge variant="outline">
                                            Last activity {{ formatRelative(item.last_activity_date) }}
                                        </UBadge>

                                        <UBadge variant="outline" :color="config.public.valueKeys.billStatuses[item.status].colour">
                                            {{ config.public.valueKeys.billStatuses[item.status].description }}
                                        </UBadge>
                                        <span class="text-sm text-muted">
                                            {{ config.public.valueKeys.billTypes[item.bill_type].description }}
                                        </span>
                                    </div>
                                </template>
                            </UPageCard>
                            <USeparator class="my-4" v-if="i < (items?.length || 0) - 1" />
                        </div>
                        <UEmpty v-if="items.length === 0" title="No bills found" description="This person is not responsible for any bills." />
                </div>
            </UCard>
        </template>
        </WContentPaginatedContent>
    </UContainer>
</template>

<script setup>
const config = useRuntimeConfig()
const route = useRoute()

const props = defineProps({
    person: {
        type: Object,
        required: true
    }
})

function formatRelative(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const monthsApprox = Math.floor(days / 30)
    const yearsApprox = Math.floor(days / 365)

    if (seconds < 60) {
        return 'just now'
    } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else if (days < 30) {
        return `${days} day${days !== 1 ? 's' : ''} ago`
    } else if (days < 180) {
        if (monthsApprox === 1) {
            return 'last month'
        } else {
            return `${monthsApprox} months ago`
        }
    } else {
        // Format as DD MMM YYYY, e.g. 15 Nov 2021
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    }
}


// Default query params - sort by introduction date descending
const defaultQueryParams = {
    ordering: '-last_activity_date'
}

// Sort options
const sortOptions = [
    { label: 'Last activity (newest first)', value: '-last_activity_date' },
    { label: 'Last activity (oldest first)', value: 'last_activity_date' },
    { label: 'Introduction date (newest first)', value: '-introduction_date' },
    { label: 'Introduction date (oldest first)', value: 'introduction_date' },
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Name (Z-A)', value: '-name' }
]

// Status options from config
const statusOptions = computed(() => {
    const options = [{ label: 'All statuses', value: null }]
    Object.entries(config.public.valueKeys.billStatuses).forEach(([key, value]) => {
        options.push({ label: value.description, value: key })
    })
    return options
})

// Type options from config
const typeOptions = computed(() => {
    const options = [{ label: 'All types', value: null }]
    Object.entries(config.public.valueKeys.billTypes).forEach(([key, value]) => {
        options.push({ label: value.description, value: key })
    })
    return options
})


</script>