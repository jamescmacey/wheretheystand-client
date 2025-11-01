<template>
        <UContainer class="my-8">
            <UPageGrid class="grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">
                <UPageGridItem class="col-span-3 md:col-span-1 md:col-span-1 lg:col-span-1 w-full">
                    <UCard variant="subtle">
                        <div v-if="status === 'success' && interests.interests" class="w-full">
                            <h3 class="text-lg font-bold">Select report</h3>
                            <USelect :items="availableReports" v-model="selectedReport" class="w-full my-2" />
                            <DocumentModal v-if="interests.document" :document="interests.document" />
                        </div>
                        <p class="text-sm text-muted py-2">Each year, members of Parliament are required to declare their financial interests, along with other specified interests.</p>
                        <p class="text-sm text-muted py-2">
                             This page shows all the interests declared when the register was last compiled. From time to time, amendments are also made and are incorporated into the list you see here.</p>
                        <p class="text-sm text-muted py-2">Learn more on the <NuxtLink class="text-primary" href="https://links.wheretheystand.nz/parliament-financial-interests" target="_blank">Parliament website</NuxtLink>.</p>
                    </UCard>
                </UPageGridItem>
                <UPageGridItem class="col-span-3 md:col-span-2 sm:col-span-2 lg:col-span-2 w-full">
                    <UCard variant="subtle" v-if="status === 'success' && interests.interests">
                        <h3 class="text-xl font-bold">Interests for {{ person.display_name }} as at {{
                            formattedDate(interests.filing_date) }}</h3>
                        <div v-for="i in 14" :key="i">
                            <div v-if="interestsForType(i).length">
                                <h6 class="mb-2 mt-4 font-bold text-lg"><span class="text-muted">{{ i }} </span> {{ interestTypeDescription(i) }}</h6>
                                <div class="space-y-2">

                                
                                <UPageCard v-for="(interest, j) in interestsForType(i)" :key="j" :title="interest.description">
                                    <template #title>
                                        {{ interest.description }}
                                    </template>
                                    <template #description v-if="interest.nzbn_match.nzbn">
                                        <span class="text-muted">NZBN: {{ interest.nzbn_match.nzbn }}</span>
                                    </template>
                                </UPageCard>
                            </div>
                            </div>
                        </div>
                    </UCard>
                    <UCard variant="subtle" v-else-if="status === 'success'">
                        <UEmpty title="No interests found" description="No interests found for this person.  WhereTheyStand doesn't have interests for recently elected MPs or MPs who left Parliament before the 52nd Parliament opened. " />
                    </UCard>
                    <UCard variant="subtle" v-else-if="status === 'pending'" class="w-full">
                        <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                            <h3 class="mb-2 text-muted">Loading interests...</h3>
                            <UProgress animation="swing" />
                        </div>
                    </UCard>
                    <UCard variant="subtle" v-else="status === 'error'" class="w-full">
                        <UEmpty title="Error loading interests" description="An error occurred while loading interests. Please try again.">
                            <template #actions>
                                <UButton variant="subtle" color="neutral" @click="refresh()" class="mt-4" icon="i-lucide-refresh-cw" trailing >
                                    Refresh
                                </UButton>
                            </template>
                        </UEmpty>
                    </UCard>
                </UPageGridItem>
            </UPageGrid>
        </UContainer>
</template>

<script setup>

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()
const selectedReport = ref('latest')

const onMounted = () => {
    selectedReport.value = 'latest'
}

const interestsKey = computed(() => `person-interests-${route.params.id}-${selectedReport.value}`)
const { data: interests, status, error, refresh, clear } = await useAsyncData(interestsKey, () => $fetch(apiBase + '/people/' + route.params.id + '/interests/' + (selectedReport.value === 'latest' ? '' : selectedReport.value + '/')))

const props = defineProps({
    person: {
        type: Object,
        required: true
    }
})

const availableReports = computed(() => {

    if (interests.value && interests.value.available_dates) {
        return interests.value.available_dates.sort().reverse().map((date) => {
            return {
                label: date === interests.value.available_dates[0] ? 'Latest available (' + formattedDate(date) + ')' : formattedDate(date),
                value: date
            }
        })
    } else if (interests.value && interests.value.filing_date) {
        return [
            {
                label: 'Latest (' + formattedDate(interests.value.filing_date) + ')',
                value: 'latest'
            }
        ]
    } else {
        return []
    }


})


import { format } from 'date-fns'

const formattedDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy')
}

const hasChangedDebt = computed(() => {
    if (interests.value && (Object.keys(interests.value).length !== 0)) {
        return interests.value.interests.filter((element) => {
            return (element.description.endsWith('*'))
        })
    } else {
        return false
    }
})

const interestsForType = (type) => {
    if (interests.value && (Object.keys(interests.value).length !== 0)) {
        return interests.value.interests.filter((element) => {
            return (element.type === type.toString())
        })
    } else { return [] }
}

const interestTypeDescription = (type) => {
    return {
        1: 'Company directorships and controlling interests',
        2: 'Other companies and business entities',
        3: 'Employment',
        4: 'Beneficial interests in, and trusteeships of, trusts',
        5: 'Organisations and trusts seeking Government funding',
        6: 'Real property',
        7: 'Retirement (superannuation) schemes',
        8: 'Investment schemes',
        9: 'Debtors (those who owe ' + props.person.display_name + ' money)',
        10: 'Creditors (those who ' + props.person.display_name + ' owes money to)',
        11: 'Overseas travel costs',
        12: 'Gifts',
        13: 'Discharged debts',
        14: 'Payments for activities'
    }[type]
}
</script>