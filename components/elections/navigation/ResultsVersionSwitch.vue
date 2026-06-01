<template>
    <USelect v-if="resultsVersions.length > 1"
        :ui="{ content: 'min-w-fit' }"
        :items="resultsVersions"
        v-model="selectedResultsVersion"
        @change="onVersionChange"
    />
    <span v-else>
        {{ resultsVersion.name }}
    </span>
</template>

<script setup>
const props = defineProps({
    election: {
        type: Object,
        required: true
    },
    resultsVersion: {
        type: Object,
        required: true
    }
})

const router = useRouter()

const resultsVersions = computed(() =>
    props.election.results_versions.map(version => ({
        label: version.name,
        value: version.slug
    }))
)
const selectedResultsVersion = ref(props.resultsVersion.slug)

function onVersionChange() {
    router.push({
        path: `/elections/${props.election.slug}/${selectedResultsVersion.value}`
    })
}

watch(router.currentRoute.value.params, (newParams) => {
    if (newParams.electionSlug && newParams.resultsVersionSlug) {
        selectedResultsVersion.value = newParams.resultsVersionSlug
    }
})
</script>