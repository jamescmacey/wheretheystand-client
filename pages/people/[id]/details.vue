<template>
    <UContainer class="my-8">
        <div v-if="status === 'success'">
            <UPageGrid class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                <UPageGridItem class="col-span-1">
                    <UCard>
                        <div class="flex my-4">
                            <h3 class="text-xl font-bold mb-2 flex-1">Parliamentary career</h3>
                            <div>
                                <div class="flex justify-end items-center">
                                    <USwitch id="showReasons" v-model="showReasons" />
                                </div>
                                <label for="showReasons" class="text-sm text-muted">Show reasons</label>
                            </div>
                            
                        </div>
                        
                        <div class="space-y-2">
                            <UCard variant="soft"
                                v-for="(affiliation, i) in details.parliamentary_affiliations.slice(0, 100)" :key="i">
                                <h5 class="text-lg font-bold" v-if="affiliation.electorate">MP for <ULink
                                        :to="'/electorates/' + affiliation.electorate.slug">{{
                                            affiliation.electorate.name
                                        }}</ULink>
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
                                <div class="text-sm mt-2" v-if="affiliation.start_reason_desc && showReasons">
                                    <h6 class="text-muted">Election reason:</h6>{{ affiliation.start_reason_desc }}<ULink v-if="affiliation.elected_at" :to="'/elections/' + affiliation.elected_at.slug"> {{ affiliation.elected_at.name}}</ULink></div>
                                <div class="text-sm mt-2" v-if="affiliation.end_date && affiliation.end_reason_desc && showReasons">
                                    <h6 class="text-muted">Vacation reason:</h6> {{ affiliation.end_reason_desc }}<ULink v-if="affiliation.vacated_at" :to="'/elections/' + affiliation.vacated_at.slug"> {{ affiliation.vacated_at.name}}</ULink></div>
                            </UCard>
                        </div>
                    </UCard>
                </UPageGridItem>
                <UPageGridItem class="col-span-1">
                    <UCard>
                        <h3 class="text-xl font-bold mb-2">Party affiliations</h3>
                        <div class="space-y-2">
                        <UPageCard variant="soft"
                                v-for="(affiliation, i) in details.party_affiliations.slice(0, 100)" :key="i" :to="'/parties/' + affiliation.party.slug">
                                <template #title class="text-lg font-bold">{{ affiliation.party.display_name }}
                                </template>
                                <template #description>{{ formatDate(affiliation.start_date) }} — {{ affiliation.end_date ? formatDate(affiliation.end_date) : 'Present' }}</template>
                            </UPageCard>
                        </div>
                    </UCard>

                    <UCard class="mt-8" v-if="sortedPortfolios.length > 0">
                        <h3 class="text-xl font-bold mb-2">Portfolios</h3>
                        <p class="text-sm text-muted mb-2">Only portfolios held since the 51st Parliament (October 2014) are shown.</p>
                        <div class="space-y-2">
                        <UPageCard variant="soft"
                                v-for="(portfolio, i) in sortedPortfolios" :key="i">
                                <template #title class="text-lg font-bold">{{ portfolio.full_description }}
                                </template>
                                <template #description>{{ formatDate(portfolio.start_date) }} — {{ portfolio.end_date ? formatDate(portfolio.end_date) : 'Present' }}</template>
                            </UPageCard>
                        </div>
                    </UCard>
                    <UEmpty v-else class="mt-8" title="No portfolios" description="This person has not held any portfolios." />
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

const sortedPortfolios = computed(() => {
    // Sort by: 1. Current (no end_date) first, 2. By most recent start_date, 3. Title alphabetically
    return [...props.person.portfolios].sort((a, b) => {
        // 1. Current portfolios (no end_date) before ended portfolios
        if (!a.end_date && b.end_date) return -1
        if (a.end_date && !b.end_date) return 1
        // 2. Most recent start_date first
        const startCmp = new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        if (startCmp !== 0) return startCmp
        // 3. Prime Minister and Deputy Prime Minister first, then alphabetical by full_description
        if (a.full_description === 'Prime Minister') return -1
        if (b.full_description === 'Prime Minister') return 1
        if (a.full_description === 'Deputy Prime Minister') return -1
        if (b.full_description === 'Deputy Prime Minister') return 1


        // Otherwise, alphabetical
        return (a.full_description || '').localeCompare(b.full_description || '');
    })
})

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