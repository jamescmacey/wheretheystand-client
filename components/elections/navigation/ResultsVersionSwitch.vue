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
import { listedVersions } from '~/utils/elections/versions'

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
const route = useRoute()

// Listed versions only. An unlisted one is offered only while it is the one
// open, so the select still names the page being viewed.
const resultsVersions = computed(() =>
    listedVersions(props.election)
        .concat(props.resultsVersion.listed ? [] : [props.resultsVersion])
        .map(version => ({
            label: version.name,
            value: version.slug
        }))
)
const selectedResultsVersion = ref(props.resultsVersion.slug)

// Only the version changes, so a reader on Parliament stays on Parliament.
function onVersionChange() {
    const current = `/elections/${props.election.slug}/${route.params.resultsVersionSlug}`
    const page = route.path.startsWith(current) ? route.path.slice(current.length) : ''
    router.push({
        path: `/elections/${props.election.slug}/${selectedResultsVersion.value}${page}`,
        query: route.query
    })
}

// A getter, not the params object itself: that is a plain snapshot, so the
// watcher never fired and the switch stopped following the route.
watch(() => route.params, (newParams) => {
    if (newParams.electionSlug && newParams.resultsVersionSlug) {
        selectedResultsVersion.value = newParams.resultsVersionSlug
    }
}, { deep: true })
</script>