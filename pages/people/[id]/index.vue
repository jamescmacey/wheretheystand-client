<template>
    <UContainer class="my-8">
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-2">Recent updates</h3>
        </div>
        <div v-if="status === 'success' && data && data.timeline && data.timeline.length > 0">
            <UPageGrid>
                <UPageCard v-for="(card, index) in cards" :key="index" v-bind="card">
                </UPageCard>
            </UPageGrid>
        </div>
        <UCard variant="subtle" v-else-if="status === 'success' || (status === 'error' && error?.statusCode === 404)">
            <UEmpty title="No timeline found"
                description="No timeline found for this person. " />
        </UCard>
        <UCard variant="subtle" v-else-if="status === 'pending'" class="w-full">
            <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading timeline...</h3>
                <UProgress animation="swing" />
            </div>
        </UCard>
        <UCard variant="subtle" v-else="status === 'error'" class="w-full">
            <UEmpty title="Error loading timeline"
                description="An error occurred while loading the timeline. Please try again.">
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

<script setup lang="ts">
const config = useRuntimeConfig()
const props = defineProps({
    person: {
        type: Object,
        required: true
    }
})

const apiBase = config.public.apiBase
const route = useRoute()

type TimelineData = {
    timeline?: unknown[]
}

const timelineKey = computed(() => `person-timeline-${route.params.id}`)
const { data, status, error, refresh, clear } = await useAsyncData<TimelineData>(timelineKey, () => $fetch<TimelineData>(apiBase + 'people/' + route.params.id + '/timeline/'), { lazy: true })


import { format } from 'date-fns'

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

const formatDate = (date: string) => {
    if (!date) return '';
    // Handles YYYY-MM-DD, ISO datetime, and fallback to invalid
    const parsedDate = date.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? new Date(date + 'T00:00:00')
        : new Date(date);
    if (isNaN(parsedDate.getTime())) return date;
    return format(parsedDate, 'd MMMM yyyy');
}

type CardType = "bill_introduction" | "vote" | "parliamentary_affiliation_start" | "parliamentary_affiliation_end" | "ministerial_credit_card_reconciliation" | "party_affiliation_start" | "party_affiliation_end";

const cardForType = (type: CardType, data: object) => {
    const d = data as object;
    switch (type) {
        case "bill_introduction": {
            return {
                title: formatDate(data.date),
                description: 'Introduced the ' + data.item.name + '.',
                icon: 'i-lucide-book-open-text',
                to: '/bills/' + data.item.id,
                variant: 'soft' as const,
            };
        }
        case "vote": {
            return {
                title: formatDate(data.date),
                description: (
                    (data.item.position === "aye" ? "Voted in favour of" :
                        data.item.position === "no" ? "Voted against" :
                        data.item.position === "abstention" ? "Abstained on" :
                        data.item.position === "absent" ? "Was absent for the vote on" :
                        "Voted on") + ' the ' + data.item.bill.name + '.'
                ),
                icon: 'i-lucide-vote',
                to: '/votes/' + data.item.id,
                variant: 'soft' as const,
            };
        }
        case "parliamentary_affiliation_start": {
            return {
                title: formatDate(data.date),
                description: 'Elected as a ' + (data.item.electorate ? ' ' : 'list ') + 'member of the ' + ordinal_suffix_of(data.item.parliament.number) + ' Parliament' + (data.item.electorate ? ' for ' + data.item.electorate.name : '') + '.',
                icon: 'i-lucide-armchair',
                to: '/people/' + route.params.id + '/details#parliamentary',
                variant: 'soft' as const,
            };
        }
        case "parliamentary_affiliation_end": {
            return {
                title: formatDate(data.date),
                description: 'Vacated parliamentary seat.',
                icon: 'i-lucide-armchair',
                to: '/people/' + route.params.id + '/details#parliamentary',
                variant: 'soft' as const,
            };
        }
        case "ministerial_credit_card_reconciliation": {
            return {
                title: formatDate(data.date),
                description: 'Credit card reconciliations for the period ' + formatDate(data.item.start_date) + ' to ' + formatDate(data.item.end_date) + ' uploaded to WhereTheyStand.',
                icon: 'i-lucide-credit-card',
                to: '/people/' + route.params.id + '/expenses#reconciliations',
                variant: 'soft' as const,
            };
        }
        case "party_affiliation_start": {
            return {
                title: formatDate(data.date),
                description: 'Joined ' + data.item.party.display_name + '.',
                icon: 'i-lucide-users-round',
                to: '/people/' + route.params.id + '/details#party',
                variant: 'soft' as const,
            };
        }
        case "party_affiliation_end": {
            return {
                title: formatDate(data.date),
                description: 'Left ' + data.item.party.display_name + '.',
                icon: 'i-lucide-users-round',
                to: '/people/' + route.params.id + '/details#party',
                variant: 'soft' as const,
            };
        }
    }
};
    
const cards = computed(() => {
    return (data.value?.timeline || []).map(item => cardForType(item.type as CardType, item as object))
})

// const cards = ref([
//     {
//         title: 'Theme',
//         description: 'Learn how to customize Nuxt UI components using Tailwind CSS.',
//         icon: 'i-lucide-swatch-book',
//         to: '/docs/getting-started/theme/design-system',
//         class: 'lg:col-span-2',
//         image: {
//             path: 'https://ui2.nuxt.com/illustrations/color-palette',
//             width: 363,
//             height: 152
//         },
//         orientation: 'horizontal' as const
//     },
//     {
//         title: 'Fonts',
//         description: 'Nuxt UI integrates with Nuxt Fonts to provide plug-and-play font optimization.',
//         icon: 'i-lucide-a-large-small',
//         to: '/docs/getting-started/integrations/fonts',
//         variant: 'soft' as const
//     },
//     {
//         title: 'Color Mode',
//         description: 'Nuxt UI integrates with Nuxt Color Mode to switch between light and dark.',
//         icon: 'i-lucide-sun-moon',
//         to: '/docs/getting-started/integrations/color-mode',
//         variant: 'soft' as const
//     },
//     {
//         title: 'Icons',
//         description: 'Nuxt UI integrates with Nuxt Icon to access over 200,000+ icons from Iconify.',
//         icon: 'i-lucide-smile',
//         to: '/docs/getting-started/integrations/icons',
//         image: {
//             path: 'https://ui2.nuxt.com/illustrations/icon-library',
//             width: 362,
//             height: 184
//         },
//         class: 'lg:col-span-2',
//         orientation: 'horizontal' as const,
//         reverse: true
//     }
// ])
</script>