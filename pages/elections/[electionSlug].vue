<template>
    <div v-if="status === 'success'" class="mt-8 lg:mt-16 pl-4 lg:pl-16">
        <h1 class="text-2xl lg:text-4xl font-bold mb-4">{{ election.name }}</h1>
        <p class="text-muted mb-8">Choose a results version to get started.</p>
        <UPageGrid>
            <UPageCard v-for="results_version in election.results_versions" :key="results_version.id" :to="'/elections/' + election.slug + '/' + results_version.slug + '/'" :spotlight="results_version.is_primary">
                <template #title>
                    {{ results_version.name }}
                </template>
                <template #description>
                    {{ results_version.description }}
                </template>
            </UPageCard>
        </UPageGrid>

    </div>
    <div v-else-if="status === 'pending'" class="flex flex-col items-center justify-center min-h-[40vh] w-full">
        <div>
        <h1 class="text-xl mb-2 px-8">Loading election...</h1>
        <UProgress animation="swing" />
    </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center min-h-[40vh]">
        <h1 class="text-2xl font-bold">Error loading election</h1>
    </div>
</template>


<script setup>



const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const electionKey = computed(() => `election-${route.params.electionSlug}`)
const { data: election, status, error, refresh, clear } = await useAsyncData(electionKey, () => $fetch(apiBase + 'elections/' + route.params.electionSlug + '/'), { lazy: true })

watchEffect(() => {
    if (status.value === 'success' && election.value && Array.isArray(election.value.results_versions) && election.value.results_versions.length === 1) {
        const onlyVersion = election.value.results_versions[0];
        // Navigate programmatically to the only results version
        navigateTo(`/elections/${election.value.slug}/${onlyVersion.slug}/`);
    }
});

// Sort results_versions so that is_primary is first
watchEffect(() => {
    if (status.value === 'success' && election.value && Array.isArray(election.value.results_versions)) {
        election.value.results_versions.sort((a, b) => (b.is_primary === true) - (a.is_primary === true));
    }
});


</script>
