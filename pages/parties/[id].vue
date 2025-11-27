<template>
    <div v-if="status === 'success'">
        <PageHeader :pageTitle="party.display_name"
            :colour="party.colour" :pageLinks="links"></PageHeader>
        <UContainer class="my-8">
            {{ party }}
        </UContainer>
    </div>
    <div v-else>
        <UContainer class="my-8">
            <UCard v-if="status === 'pending'" class="w-full">
            <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading {{ route.params.id}}...</h3>
                <UProgress animation="swing" />
            </div>
        </UCard>
            <UEmpty v-else :title="'Error loading ' + route.params.id"
                :description="'An error occurred while loading this party. Please try again.'">
                <template #actions>
                    <UButton variant="subtle" color="neutral" @click="refresh()" class="mt-4" icon="i-lucide-refresh-cw"
                        trailing>
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
            <p v-if="error && status === 'error'" class="text-muted text-xs text-center mt-4">
                {{ error.statusCode }}: {{ error }}
            </p>
        </UContainer>
    </div>
</template>

<script setup>

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const partyKey = computed(() => `party-${route.params.id}`)
const { data: party, status, error, refresh, clear } = await useAsyncData(partyKey, () => $fetch(apiBase + 'parties/' + route.params.id + '/'))

const links = computed(() => {
    return [
        {
            to: '/parties/' + route.params.id,
            name: 'Overview'
        },
        {
            to: '/parties/' + route.params.id + '/votes',
            name: 'Votes'
        },
        {
            to: '/parties/' + route.params.id + '/elections',
            name: 'Electoral history'
        }
    ]
})
</script>

<style scoped></style>