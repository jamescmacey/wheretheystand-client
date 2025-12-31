<template>
    <div>
        <PageHeader pageTitle="Elections"></PageHeader>
        <UContainer class="my-8">
            <h3 class="text-xl font-bold mb-8">Election results for all elections are available on the <ULink href="https://links.wheretheystand.nz/ec-election-results" target="_blank">Electoral Commission's results website</ULink>.</h3>
            <div v-if="status === 'success'">
                <UPageGrid>
                    <UPageCard v-for="election in sortedElections" :key="election.id" :to="'/elections/' + election.slug">
                        <div>
                            <h4 class="text-lg font-bold mb-2">{{ election.name }}</h4>
                            <p class="text-sm text-muted">{{ formatDate(election.polling_date) }}</p>
                            <USeparator class="my-4" />
                            <div v-if="election.results_versions.length == 0">
                                <p class="text-sm text-muted">Results not on WhereTheyStand.</p>
                            </div>
                            <div v-else>
                                <h5 class="text-sm text-muted mb-2">Available results</h5>
                                <div v-for="results_version in election.results_versions" :key="results_version.id">
                                    <h5 class="mb-2">{{ results_version.name }}</h5>
                                </div>
                            </div>
                        </div>
                    </UPageCard>
                </UPageGrid>
            </div>
            <div v-else-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading elections...</h3>
                    <UProgress animation="swing" />
                </div>
            </div>
            <UCard variant="subtle" v-else class="w-full">
                <UEmpty title="Error loading elections"
                    description="An error occurred while loading elections. Please try again.">
                    <template #actions>
                        <UButton variant="subtle" color="neutral" @click="refresh()" class="mt-4"
                            icon="i-lucide-refresh-cw" trailing>
                            Refresh
                        </UButton>
                    </template>
                </UEmpty>
            </UCard>
        </UContainer>
    </div>
</template>

<script setup>

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const { data: elections, status, error, refresh, clear } = await useAsyncData("elections", () => $fetch(apiBase + 'elections/'), { lazy: true })

const sortedElections = computed(() => elections.value.sort((a, b) => new Date(b.polling_date).getTime() - new Date(a.polling_date).getTime()))

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>