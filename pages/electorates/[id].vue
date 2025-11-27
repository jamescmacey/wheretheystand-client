<template>
    <div v-if="status === 'success'">
        <PageHeader :pageTitle="electorate.name" :pageSubtitle="electorate.description"></PageHeader>
        <UContainer class="my-8">
            <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="col-span-1" v-if="electorate.status === 'current' || electorate.incumbent">
                    <h3 class="text-lg font-bold mb-2">Current member of Parliament</h3>
                    <UCard v-if="!electorate.incumbent">
                        <UEmpty title="Vacant" description="No current member of Parliament for this electorate." />
                    </UCard>
                    <UCard v-else>
                        <div class="flex justify-center my-4">
                            <img :src="electorate.incumbent.image" :alt="electorate.incumbent.display_name" class="w-32 h-32 rounded-full"></img>
                        </div>
                        <div class="text-center">
                            <div>
                                <h4 class="text-xl font-bold">{{ electorate.incumbent.display_name }}</h4>
                                <p class="text-md text-muted">{{ electorate.incumbent.description }}</p>
                            </div>
                        </div>
                    </UCard>
                </div>
                <div class="col-span-2">
                    <h3 class="text-lg font-bold mb-2">All members of Parliament</h3>
                    <UCard v-if="electorateHistoryStatus === 'success' && electorateHistory.length > 0">

                    </UCard>
                    <UEmpty v-else-if="electorateHistoryStatus === 'success'" title="No history found" description="This electorate has not had any members of Parliament." />
                    <UCard variant="subtle" v-else-if="electorateHistoryStatus === 'pending'" class="w-full">
                        <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                            <h3 class="mb-2 text-muted">Loading history...</h3>
                            <UProgress animation="swing" />
                        </div>
                    </UCard>
                    <UCard variant="subtle" v-else-if="electorateHistoryStatus === 'error'" class="w-full">
                        <UEmpty title="Error loading history" description="An error occurred while loading this electorate's history. Please try again.">
                            <template #actions>
                                <UButton variant="subtle" color="neutral" @click="electorateHistoryRefresh()" class="mt-4" icon="i-lucide-refresh-cw" trailing >
                                    Refresh
                                </UButton>
                            </template>
                        </UEmpty>
                    </UCard>

                </div>
            </div>

            <USeparator icon="i-lucide-history" class="my-8" />
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <div v-if="electorate.replaced_electorate">
                    <h3 class="text-lg font-bold mb-2">Former electorate</h3>
                    <UPageCard :to="'/electorates/' + electorate.replaced_electorate.slug">
                        <template #title>
                            {{ electorate.replaced_electorate.name }}
                        </template>
                        <template #description>
                            Replaced on {{ formatDate(electorate.valid_from) }}
                        </template>
                    </UPageCard>
                </div>
                <div v-else></div>
                <div v-if="electorate.replaced_by" class="">
                    <h3 class="text-lg font-bold mb-2">Replaced by</h3>
                    <UPageCard :to="'/electorates/' + electorate.replaced_by.slug">
                        <template #title>
                            <div class="flex">
                                {{ electorate.replaced_by.name }}
                            </div>
                            
                        </template>
                        <template #description>
                            <div class="flex">
                                Replaced on {{ formatDate(electorate.valid_to, 1) }}
                            </div>
                        </template>
                    </UPageCard>
                </div>
            </div>
        </UContainer>
    </div>
    <div v-else>
        <UContainer class="my-8">
            <UCard v-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading {{ route.params.id }}...</h3>
                    <UProgress animation="swing" />
                </div>
            </UCard>
            <UEmpty v-else :title="'Error loading ' + route.params.id"
                :description="'An error occurred while loading this electorate. Please try again.'">
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

import { format, addDays, parse } from 'date-fns'



const formatDate = (date, daysToAdd = 0) => {

    if (daysToAdd > 0) {
        // convert the date to an object to add a day
        const dateObject = parse(date, 'yyyy-MM-dd', new Date())
        const newDate = addDays(dateObject, daysToAdd)
        return format(newDate, 'd MMMM yyyy')
    } else {
        return format(date, 'd MMMM yyyy')
    }
}

const electorateHistoryKey = computed(() => `electorate-history-${route.params.id}`)
const { data: electorateHistory, status: electorateHistoryStatus, error: electorateHistoryError, refresh: electorateHistoryRefresh, clear: electorateHistoryClear } = await useAsyncData(electorateHistoryKey, () => $fetch(apiBase + 'electorates/' + route.params.id + '/history/'))

const electorateKey = computed(() => `electorate-${route.params.id}`)
const { data: electorate, status, error, refresh, clear } = await useAsyncData(electorateKey, () => $fetch(apiBase + 'electorates/' + route.params.id + '/'))

</script>

<style scoped></style>