<template>
    <div v-if="status === 'success'" class="w-full">
        <NuxtPage :election="election" />
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
const { data: election, status, error, refresh, clear } = await useAsyncData(electionKey, () => $fetch(apiBase + 'elections/' + route.params.electionSlug + '/'))

usePageSeo({
    title: () => election.value?.name,
    description: () => {
        const e = election.value
        if (!e?.polling_date) return undefined
        return `Election results for ${e.name ?? 'this election'}.`
    },
})

</script>
