<template>
    <div>
        <h3 class="text-lg font-bold mb-2">All members of Parliament</h3>
        <UCard v-if="status === 'success' && groups.length > 0">
            <div class="divide-y divide-default">
                <div
                    v-for="group in groups"
                    :key="group.key"
                    class="py-3 flex items-start justify-between gap-4"
                >
                    <div>
                        <NuxtLink
                            :to="'/people/' + group.person.slug"
                            class="font-semibold text-highlighted hover:underline"
                        >
                            {{ group.person.display_name }}
                        </NuxtLink>
                        <p class="text-sm text-muted">{{ group.partyLabel }}</p>
                    </div>
                    <div class="text-sm text-muted text-right">
                        <p
                            v-for="(dateRange, dateIndex) in group.dateRanges"
                            :key="`${group.key}-date-${dateIndex}`"
                            class="whitespace-nowrap"
                        >
                            {{ dateRange }}
                        </p>
                    </div>
                </div>
            </div>
        </UCard>
        <UEmpty
            v-else-if="status === 'success'"
            title="No history found"
            description="This electorate has not had any members of Parliament."
        />
        <UCard v-else-if="status === 'pending'" variant="subtle" class="w-full">
            <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading history...</h3>
                <UProgress animation="swing" />
            </div>
        </UCard>
        <UCard v-else-if="status === 'error'" variant="subtle" class="w-full">
            <UEmpty
                title="Error loading history"
                description="An error occurred while loading this electorate's history. Please try again."
            >
                <template #actions>
                    <UButton
                        variant="subtle"
                        color="neutral"
                        class="mt-4"
                        icon="i-lucide-refresh-cw"
                        trailing
                        @click="$emit('refresh')"
                    >
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
        </UCard>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    groups: Array<{
        key: string
        person: { slug: string; display_name: string }
        partyLabel: string
        dateRanges: string[]
    }>
    status: string
}>()

defineEmits<{
    refresh: []
}>()
</script>
