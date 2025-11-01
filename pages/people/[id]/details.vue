<template>
    <UContainer class="my-8">
        <div v-if="status === 'success'">
            <UPageGrid class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                <UPageGridItem class="col-span-1">
                    <UCard>
                        <h3 class="text-xl font-bold mb-2">Parliamentary career</h3>
                        <div class="space-y-2">
                            <UCard variant="soft"
                                v-for="(affiliation, i) in details.parliamentary_affiliations.slice(0, 100)" :key="i">
                                <h5 class="text-lg font-bold" v-if="affiliation.electorate">MP for <NuxtLink
                                        :to="'/electorates/' + affiliation.electorate.slug">{{
                                            affiliation.electorate.name
                                        }}</NuxtLink>
                                </h5>
                                <h5 class="text-lg font-bold" v-else-if="affiliation.fallback_electorate_slug">MP for
                                    <UTooltip text="No database record for this electorate.">
                                        <span class="text-muted uppercase">{{ affiliation.fallback_electorate_slug
                                            }}</span>
                                    </UTooltip>
                                </h5>
                                <h5 class="text-lg font-bold" v-else>List MP</h5>
                                <h6 class="text-sm text-muted">
                                    {{ ordinal_suffix_of(affiliation.parliament.number) }} Parliament
                                </h6>
                                <h6>{{ formatDate(affiliation.start_date) }} — {{ affiliation.end_date ? formatDate(affiliation.end_date) : 'Present' }}</h6>
                                <span v-if="affiliation.start_reason_desc && showReasons">Reason: {{ affiliation.start_reason_desc }}</span>
                                <span v-if="affiliation.end_date && affiliation.end_reason_desc && showReasons">Reason: {{ affiliation.end_reason_desc }}</span>
                            </UCard>
                        </div>
                    </UCard>
                </UPageGridItem>
                <UPageGridItem class="col-span-1">
                    <UCard variant="subtle">
                        <h3 class="text-xl font-bold">Party affiliations</h3>
                    </UCard>
                </UPageGridItem>
            </UPageGrid>
        </div>
        <UCard variant="subtle" v-else-if="status === 'pending'" class="w-full">
            <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading details...</h3>
                <UProgress animation="swing" />
            </div>
        </UCard>
        <UCard variant="subtle" v-else class="w-full">
            <UEmpty title="Error loading details"
                description="An error occurred while loading details. Please try again.">
                <template #actions>
                    <UButton variant="subtle" color="neutral" @click="refresh()" class="mt-4" icon="i-lucide-refresh-cw"
                        trailing>
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
        </UCard>
    </UContainer>
</template>

<script setup>

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const detailsKey = computed(() => `person-details-${route.params.id}`)
const { data: details, status, error, refresh, clear } = await useAsyncData(detailsKey, () => $fetch(apiBase + '/people/' + route.params.id + '/details/'))

const showReasons = ref(false)
const parliamentaryAffiliationCount = ref(0)
const partyAffiliationCount = ref(1)

import { format } from 'date-fns'

const formatDate = (date) => {
    return format(new Date(date), 'd MMMM yyyy')
}

const props = defineProps({
    person: {
        type: Object,
        required: true
    }
})

const ordinal_suffix_of = (i) => {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

</script>