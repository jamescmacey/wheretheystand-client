<template>
    <div class="mt-8 lg:mt-16 pl-4 lg:pl-16">
        <h1 class="text-2xl lg:text-4xl font-bold mb-4">{{ election.name }}</h1>
        <p class="text-muted mb-8">Choose a results version to get started.</p>
        <UPageGrid>
            <UPageCard v-for="results_version in versions" :key="results_version.id"
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
import { listedVersions } from '~/utils/elections/versions'

const props = defineProps({
    election: {
        type: Object,
        required: true
    }
})

// Listed versions only, primary first. Unlisted ones are reachable by URL alone.
const versions = computed(() => props.election ? listedVersions(props.election) : [])

watchEffect(() => {
    if (versions.value.length === 1) {
        const onlyVersion = versions.value[0];
        // Navigate programmatically to the only results version
        navigateTo(`/elections/${props.election.slug}/${onlyVersion.slug}/`);
    }
});

</script>