<template>
    <UContainer class="my-8">
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-2">Details</h3>
            <h5>On this page</h5>
            <ul class="list-disc list-inside">
                <li>
                    <ULink to="#parliamentary">Parliamentary history</ULink>
                </li>
                <li>
                    <ULink to="#party">Party history</ULink>
                </li>
                <li>
                    <ULink to="#ministerial">Ministerial portfolios and responsibilities</ULink>
                </li>
            </ul>
        </div>
        <div class="space-y-8">
            <UCard variant="subtle" id="parliamentary">
                <div class="flex my-4">
                    <h3 class="text-lg font-bold mb-2 flex-1">Parliamentary history</h3>
                    <div>
                        <div class="flex justify-end items-center">
                            <USwitch id="showReasons" v-model="showReasons" />
                        </div>
                        <label for="showReasons" class="text-sm text-muted">Show reasons</label>
                    </div>
                </div>
                <div class="space-y-2">
                    <template
                        v-for="(affiliation, i) in person?.parliamentary_affiliations.sort((a, b) => new Date(b.elected_date || b.sworn_date).getTime() - new Date(a.elected_date || a.sworn_date).getTime()) || []"
                        :key="i">
                        <div>
                            <div class="flex justify-between items-center">
                                <div>
                                    <h5 class="text-lg font-bold" v-if="affiliation.electorate">
                                        MP for
                                        <ULink :to="'/electorates/' + affiliation.electorate.slug">
                                            {{ affiliation.electorate.name }}
                                        </ULink>
                                    </h5>
                                    <h5 class="text-lg font-bold" v-else-if="affiliation.fallback_electorate_slug">
                                        MP for
                                        <UTooltip text="No database record for this electorate.">
                                            <span class="text-muted uppercase">{{ affiliation.fallback_electorate_slug
                                                }}</span>
                                        </UTooltip>
                                    </h5>
                                    <h5 class="text-lg font-bold" v-else>List MP</h5>
                                    <h6 class="text-sm text-muted">
                                        {{ ordinal_suffix_of(affiliation.parliament.number) }} Parliament
                                    </h6>
                                </div>
                                <div>
                                    <h5 class="text-right">
                                        {{ formatDate(affiliation.sworn_date) }} —
                                        {{ affiliation.end_date ? formatDate(affiliation.end_date) : 'Present' }}
                                    </h5>
                                    <h6 class="text-sm text-muted text-right" v-if="affiliation.elected_date">
                                        Declared elected {{ formatDate(affiliation.elected_date) }}
                                    </h6>
                                </div>
                            </div>
                            <div class="grid-cols-1 sm:grid-cols-2 flex flex-col gap-2 mt-2" v-if="showReasons">
                                <div class="text-sm col-span-1" v-if="affiliation.start_reason">
                                    <h6 class="text-muted">Election reason:</h6>
                                    {{ config.public.valueKeys.startReasons[affiliation.start_reason].description }}
                                    <ULink v-if="affiliation.election" :to="'/people/' + person.slug + '/elections'">
                                        ({{ affiliation.election.name }})
                                    </ULink>
                                    <span class="text-xs text-muted block"
                                        v-if="config.public.valueKeys.startReasons[affiliation.start_reason].statutoryProvision">
                                        {{
                                            config.public.valueKeys.startReasons[affiliation.start_reason].statutoryProvision
                                        }}
                                    </span>
                                    <div v-if="affiliation.gazette_notice_election?.file" class="my-1">
                                        <FileModal :file="affiliation.gazette_notice_election.file"
                                            buttonText="View gazette notice"
                                            :title="'Gazette notice for election on ' + formatDate(affiliation.elected_date || affiliation.sworn_date)" />
                                    </div>
                                </div>
                                <div class="text-sm col-span-1" v-if="affiliation.end_date && affiliation.end_reason">
                                    <h6 class="text-muted">Vacation reason:</h6>
                                    {{ config.public.valueKeys.endReasons[affiliation.end_reason].description }}
                                    <span class="text-xs text-muted block"
                                        v-if="config.public.valueKeys.endReasons[affiliation.end_reason].statutoryProvision">
                                        {{ config.public.valueKeys.endReasons[affiliation.end_reason].statutoryProvision
                                        }}
                                    </span>
                                    <div v-if="affiliation.gazette_notice_vacation?.file" class="my-1">
                                        <FileModal :file="affiliation.gazette_notice_vacation.file"
                                            buttonText="View gazette notice"
                                            :title="'Gazette notice for vacation on ' + formatDate(affiliation.end_date)" />
                                    </div>
                                </div>
                            </div>
                            <USeparator class="my-4" v-if="i < (person?.parliamentary_affiliations?.length || 0) - 1" />
                        </div>
                    </template>
                </div>
            </UCard>
            <UCard variant="subtle" id="party">
                <div class="flex my-4">
                    <h3 class="text-lg font-bold mb-2 flex-1" >Party history</h3>
                </div>
                <div class="space-y-2">
                    <template
                        v-for="(affiliation, i) in person?.party_affiliations.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()) || []"
                        :key="i">
                        <div class="flex justify-between items-center">
                                <div>
                                <h5 class="text-lg font-bold" v-if="affiliation.party">
                                    <ULink :to="'/parties/' + affiliation.party">
                                        {{ affiliation.party }}
                                    </ULink>
                                </h5>
                                </div>
                                <div>
                                    <h5 class="text-right">
                                        {{ formatDate(affiliation.start_date) }} —
                                        {{ affiliation.end_date ? formatDate(affiliation.end_date) : 'Present' }}
                                    </h5>
                                </div>
                        </div>
                        <USeparator class="my-4" v-if="i < (person?.party_affiliations?.length || 0) - 1" />
                    </template>
                </div>
            </UCard>
            <UCard variant="subtle" id="ministerial">
                <div class="flex my-4">
                    <h3 class="text-lg font-bold mb-2 flex-1">Ministerial portfolios and responsibilities</h3>
                </div>
                <div class="space-y-2">
                    <template
                        v-for="(affiliation, i) in sortedPortfolios"
                        :key="i">
                        <div class="flex justify-between items-center">
                                <div>
                                <h5 class="text-lg">
                                    {{ affiliation.title }} {{ affiliation.conjunction }} {{ affiliation.portfolio }}
                                </h5>
                                </div>
                                <div>
                                    <h5 class="text-right">
                                        {{ formatDate(affiliation.start_date) }} —
                                        {{ affiliation.end_date ? formatDate(affiliation.end_date) : 'Present' }}
                                    </h5>
                                </div>
                        </div>
                        <USeparator class="my-4" v-if="i < (person?.ministerial_affiliations?.length || 0) - 1" />

                    </template>
                </div>
            </UCard>
        </div>
    </UContainer>
</template>

<script setup>

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const showReasons = ref(false)


import { format } from 'date-fns'

const formatDate = (date) => {
    return format(new Date(date), 'd MMMM yyyy')
}

const sortedPortfolios = computed(() => {
    // Sort by: 1. Current (no end_date) first, 2. By most recent start_date, 3. Title alphabetically
    return [...props.person.ministerial_affiliations].sort((a, b) => {
        // 1. Current portfolios (no end_date) before ended portfolios
        if (!a.end_date && b.end_date) return -1
        if (a.end_date && !b.end_date) return 1
        // 2. Most recent start_date first
        const startCmp = new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        if (startCmp !== 0) return startCmp
        // 3. Prime Minister and Deputy Prime Minister first, then alphabetical by full_description
        if (a.portfolio?.name === 'Prime Minister') return -1
        if (b.portfolio?.name === 'Prime Minister') return 1
        if (a.portfolio?.name === 'Deputy Prime Minister') return -1
        if (b.portfolio?.name === 'Deputy Prime Minister') return 1


        // Otherwise, alphabetical
        return (a.portolio?.name || '').localeCompare(b.portfolio?.name || '');
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