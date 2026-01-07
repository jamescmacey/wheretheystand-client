<template>
    <div class="mt-8 lg:mt-16 pl-4 lg:pl-16">
        <h1 class="text-2xl lg:text-4xl font-bold mb-4">{{ election.name }}</h1>
        <p class="text-muted mb-8">Choose a results version to get started.</p>
        <UPageGrid>
            <UPageCard v-for="results_version in election.results_versions" :key="results_version.id"
                :to="'/elections/' + election.slug + '/' + results_version.slug + '/'"
                :spotlight="results_version.is_primary">
                <template #title>
                    {{ results_version.name }}
                </template>
                <template #description>
                    {{ results_version.description }}
                </template>
            </UPageCard>
        </UPageGrid>
    </div>
</template>

<script setup>

const props = defineProps({
    election: {
        type: Object,
        required: true
    }
})

watchEffect(() => {
    if (props.election && Array.isArray(props.election.results_versions) && props.election.results_versions.length === 1) {
        const onlyVersion = props.election.results_versions[0];
        // Navigate programmatically to the only results version
        navigateTo(`/elections/${props.election.slug}/${onlyVersion.slug}/`);
    }
});

// Sort results_versions so that is_primary is first
watchEffect(() => {
    if (props.election && Array.isArray(props.election.results_versions)) {
        props.election.results_versions.sort((a, b) => (b.is_primary === true) - (a.is_primary === true));
    }
});

</script>