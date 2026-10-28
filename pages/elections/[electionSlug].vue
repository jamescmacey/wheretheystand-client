<template>
    <!-- The dashboard panel inside is a flex child that scrolls its own body,
         which only works if every wrapper between it and the fixed layout root
         passes a bounded height down. A plain `w-full` here left the panel free
         to grow to its content, so the page overflowed the layout instead of
         scrolling inside it.

         `flex-1 min-w-0` rather than `w-full` for the same reason in the other
         axis. This is a flex child of the layout's row, beside the sidebar, so
         `w-full` is the full width of the row and overflows by exactly the
         sidebar's width. The group clips that, which is why it went unnoticed:
         nothing used to sit against the right edge. The feed panel does. -->
    <div v-if="status === 'success'" class="flex-1 min-w-0 h-full min-h-0 flex flex-col">
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



const route = useRoute()

const { status: manifestStatus, findElection } = await useElectionManifest()

const election = computed(() => findElection(String(route.params.electionSlug)))

// The manifest either has the election or it does not; there is no per-election
// request that could fail on its own.
const status = computed(() => {
    if (manifestStatus.value !== 'success') return manifestStatus.value
    return election.value ? 'success' : 'error'
})

watch(election, found => {
    if (manifestStatus.value === 'success' && !found) {
        throw createError({ statusCode: 404, statusMessage: 'Election not found' })
    }
}, { immediate: true })

usePageSeo({
    title: () => election.value?.name,
    description: () => {
        const e = election.value
        if (!e?.polling_date) return undefined
        return `Election results for ${e.name ?? 'this election'}.`
    },
})

</script>
