<template>
    <UContainer class="my-8">
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-2">Electoral history</h3>
            <p>WhereTheyStand's records show that {{ person.display_name }} has stood as a candidate in the following
                elections. 
                <strong class="font-bold">This may not be a complete list</strong>, because WhereTheyStand's election results data only goes back to 2018.</p>
        </div>
        <div v-if="status === 'success'">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <UPageCard v-for="election in results.elections" :key="election.election.id" variant="subtle" :to="'/elections/' + election.election.slug + '/' + election.results_version.slug + '/' + election.candidate.number" class="h-full flex flex-col">
                        <div class="flex items-center justify-between">
                            <h4 class="text-lg font-bold">{{ election.election.name }}</h4>
                                <template v-if="affiliationsByElection[election.election.id]">
                                    <template v-if="affiliationsByElection[election.election.id].electorate && election.candidate.electorate">
                                        <UBadge color="success">Elected</UBadge>
                                    </template>
                                    <template v-else-if="!affiliationsByElection[election.election.id].electorate && !election.candidate.electorate">
                                        <UBadge color="success">Elected from list</UBadge>
                                    </template>
                                    <template v-else-if="!affiliationsByElection[election.election.id].electorate && election.candidate.electorate && !election.candidate.electorate.accepting_candidate_votes">
                                        <UBadge color="success">Elected from list</UBadge>
                                    </template>
                                    <template v-else-if="!affiliationsByElection[election.election.id].electorate && election.candidate.electorate">
                                        <UBadge color="warning">Elected from list</UBadge>
                                    </template>
                            </template>
                            <template v-else-if="election.candidate.electorate && !election.candidate.electorate.accepting_candidate_votes">
                                <UBadge color="error">Candidate poll cancelled</UBadge>
                            </template>
                            <template v-else>
                                <UBadge color="error">Unsuccessful</UBadge>
                            </template>
                        </div>
                        <p>
                            <span class="mr-2"><UBadge v-if="election.candidate.party" :ui="getBadgeUI(election.candidate.party)" :color="!election.candidate.party.persistent_party?.colour ? 'primary' : undefined" :style="getBadgeStyle(election.candidate.party)">{{ election.candidate.party.persistent_party ? election.candidate.party.persistent_party.abbreviation : election.candidate.party.abbreviation }}</UBadge><UBadge v-else color="indigo">Ind.</UBadge></span> <span v-if="election.candidate.electorate">{{ election.candidate.electorate.name }}</span><span v-else>List candidate only</span>
                        </p>
                    </UPageCard>
                </div>




            </div>
            <div v-else-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading elections...</h3>
                    <UProgress animation="swing" />
                </div>
            </div>
            <UCard variant="subtle" v-else class="w-full">
                <UEmpty title="Error loading elections"
                    description="An error occurred while loading elections. Please try again.">
                    <template #actions>
                        <UButton variant="subtle" color="neutral" @click="refresh()" class="mt-4"
                            icon="i-lucide-refresh-cw" trailing>
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

const votesKey = computed(() => `person-elections-${route.params.id}`)
const { data: results, status, error, refresh, clear } = await useAsyncData(votesKey, () => $fetch(apiBase + 'people/' + route.params.id + '/election-results/'))

const props = defineProps({
    person: {
        type: Object,
        required: true
    }
})

const affiliationsByElection = computed(() => {
    // Map person.parliamentary_affiliations with election to a dict: { [election.id]: affiliation }
    if (!props.person?.parliamentary_affiliations || !Array.isArray(props.person?.parliamentary_affiliations)) {
        return {};
    }
    return props.person.parliamentary_affiliations
        .filter(affiliation => affiliation.election && affiliation.election.id)
        .reduce((acc, affiliation) => {
            acc[affiliation.election.id] = {"electorate": affiliation.electorate};
            return acc;
        }, {});
})

// Calculate relative luminance for WCAG contrast calculation
const getRelativeLuminance = (color) => {
    // Parse hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Convert to linear RGB
    const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Calculate contrast ratio between two colors
const getContrastRatio = (color1, color2) => {
    const lum1 = getRelativeLuminance(color1);
    const lum2 = getRelativeLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

// Determine best text color (white or black) for a background color
const getBestTextColor = (backgroundColor) => {
    const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF');
    const blackContrast = getContrastRatio(backgroundColor, '#000000');
    return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

const getBadgeUI = (party) => {
    // Return undefined to use default styling when no custom color
    // The inline styles in getBadgeStyle will handle the color override
    return undefined;
}

const getBadgeStyle = (party) => {
    const color = party?.persistent_party?.colour;
    if (color) {
        const textColor = getBestTextColor(color);
        // Inline styles override any theme-based colors (light/dark mode)
        return {
            backgroundColor: color,
            color: textColor
        };
    }
    return undefined;
}
</script>