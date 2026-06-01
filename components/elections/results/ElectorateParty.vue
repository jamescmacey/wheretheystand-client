<template>
    <UCard variant="soft">
        <!-- Table header -->
        <div class="flex items-center gap-4 font-medium mb-2">
            <div class="flex-shrink-0 w-60 font-bold">
                
            </div>
            <div class="flex-grow">

            </div>
            <div class="flex-shrink-0 w-24 text-right border-b border-gray-200 text-sm uppercase text-muted">
                Votes
            </div>
            <div class="flex-shrink-0 w-24 text-right border-b border-gray-200 text-sm uppercase text-muted">
                Share
            </div>
        </div>
        <!-- Example rows -->
        <div class="flex items-center gap-4 py-2" v-for="result in results.results" :key="result.id">
            <div class="flex-shrink-0 w-60">
                <div class="flex items-center space-x-2">
                    <div class="flex-shrink-0 w-2 self-stretch flex items-center justify-center rounded-md"
                        :style="{ backgroundColor: electionDataStore.getPersistentPartyForParty(election.slug, resultsVersion.slug, {id: result.party, number: Number(result.party)})?.colour || 'gray' }">
                    </div>
                    <div class="flex flex-col">
                        {{ electionDataStore.getPartyForParty(election.slug, resultsVersion.slug, {id: result.party, number: Number(result.party)})?.name || ('Unknown party' + ' (' + result.party.slice(-4) + ')') }}
                    </div>
                </div>
            </div>
            <div class="flex-grow">
                <UProgress :model-value="(result.count / results.total_votes_cast * 100).toFixed(2)" size="xl" :max="100"
                                    :ui="{ base: 'relative overflow-hidden rounded-sm bg-accented', 
                                    indicator: 'rounded-sm size-full transition-transform duration-200 ease-out' }" />
            </div>
            <div class="flex-shrink-0 w-16 text-right">
                {{ result.count.toLocaleString() }}
            </div>
            <div class="flex-shrink-0 w-24 text-right">
                {{ (result.count / results.total_votes_cast * 100).toFixed(2) }}%
            </div>
        </div>
        <div class="flex items-center gap-4 py-2">
            <div class="flex-shrink-0 w-60 text-muted">
                Party informals
            </div>
            <div class="flex-grow">
                <UProgress :model-value="(results.informals / results.total_votes_cast).toFixed(2)" size="xl" :max="100"
                                    :ui="{ base: 'relative overflow-hidden rounded-sm bg-accented', 
                                    indicator: 'rounded-sm size-full transition-transform duration-200 ease-out' }" />
            </div>
            <div class="flex-shrink-0 w-16 text-right">
                {{ results.informals.toLocaleString() }}
            </div>
            <div class="flex-shrink-0 w-24 text-right">
                {{ (results.informals / results.total_votes_cast).toFixed(2) }}%
            </div>
        </div>
        <div class="flex items-center gap-4 py-2 mt-2 bg-elevated rounded-full">
            <div class="flex-grow text-muted text-sm px-4">
                A majority is required to win.
            </div>
            <div class="flex-shrink-0 w-16 text-right">
                {{ results.total_votes_cast.toLocaleString() }}
            </div>
            <div class="flex-shrink-0 w-24 text-right">

            </div>
        </div>
    </UCard>
</template>

<script setup>
const props = defineProps({
    electorate: {
        type: Object,
        required: true
    },
    election: {
        type: Object,
        required: true
    },
    resultsVersion: {
        type: Object,
        required: true
    },
    results: {
        type: Object,
        required: true
    }
})

const electionDataStore = useElectionDataStore()
</script>