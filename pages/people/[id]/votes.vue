<template>
    <UContainer class="my-8">
        <div v-if="status === 'success'">
            {{ votes }}
        </div>
        <UCard variant="subtle" v-else-if="status === 'pending'" class="w-full">
            <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading votes...</h3>
                <UProgress animation="swing" />
            </div>
        </UCard>
        <UCard variant="subtle" v-else class="w-full">
            <UEmpty title="Error loading votes"
                description="An error occurred while loading votes. Please try again.">
                <template #actions>
                    <UButton variant="subtle" color="neutral" @click="refresh()" class="mt-4" icon="i-lucide-refresh-cw"
                        trailing>
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
        </UCard>
    </UContainer>
</template>

<script setup>

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const votesKey = computed(() => `person-votes-${route.params.id}`)
const { data: votes, status, error, refresh, clear } = await useAsyncData(votesKey, () => $fetch(apiBase + '/people/' + route.params.id + '/votes/'))

const props = defineProps({
    person: {
        type: Object,
        required: true
    }
})

</script>