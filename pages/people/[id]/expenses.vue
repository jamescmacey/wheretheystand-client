<template>
    <UContainer class="my-8">
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-2">Expenses</h3>
            <h5>On this page</h5>
            <ul class="list-disc list-inside">
                <li>
                    <ULink to="#reconciliations">Ministerial credit card reconciliations</ULink>
                </li>
            </ul>
            <p class="text-sm text-muted mt-2">Previously, WhereTheyStand also showed the quarterly expense returns by members of Parliament and others.  This information has been temporarily removed from WhereTheyStand while work is done to display this information in a clearer way.</p>
        </div>

        
        <ContentPaginatedContent :endpoint="'credit-card-reconciliations/?person=' + person.id"
            item-label="reconciliations" items-per-page="10" url-prefix="reconciliations">
            <template #content="{ items }">
            <UCard variant="subtle" id="reconciliations">
                <div class="my-4">
                    <h3 class="text-lg font-bold mb-2">Ministerial credit card reconciliations</h3>
                    <p class="text-sm text-muted mb-2">The Department of Internal Affairs publishes quarterly reconciliations of ministers' credit card statements (including purchases made by their staff).</p>
                </div>
                <div class="space-y-2">
                        <div v-for="(item, i) in items" :key="item.id">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h5>
                                        {{ formatMonthYear(item.start_date) }} to {{ formatMonthYear(item.end_date) }}
                                    </h5>
                                </div>
                                <div v-if="item.file">
                                    <FileModal :file="item.file" buttonText="View file" />
                                </div>
                            </div>
                            <USeparator class="my-4" v-if="i < (items?.length || 0) - 1" />
                        </div>
                        <UEmpty v-if="items.length === 0" title="No reconciliations found" description="This person may never have been a minister or there may not have been reconciliations published and loaded yet." />
                </div>
            </UCard>
        </template>
        </ContentPaginatedContent>
    </UContainer>
</template>

<script setup>

const props = defineProps({
    person: {
        type: Object,
        required: true
    }
})

import { format } from 'date-fns'

const formatMonthYear = (date) => {
    return format(new Date(date), 'MMMM yyyy')
}
</script>