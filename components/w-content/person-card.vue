<template>
    <WContentItemCard :item="{ colour: person.party_affiliation?.party?.colour || party?.colour || person.cached_colour || null }"
        :to="'/people/' + person.slug">
        <template #title>
            <div class="flex items-center gap-3">
                <img :src="profileImageSrc(person)" :alt="person.display_name"
                    class="w-10 h-10 rounded-full object-cover shrink-0 ring ring-default">
                <div class="min-w-0">
                    <p class="font-medium text-highlighted truncate">{{ person.display_name }}</p>
                    <p v-if="cardDescription(person, party)" class="text-sm text-muted truncate">
                        {{ cardDescription(person, party) }}
                    </p>
                    <p v-else class="text-sm text-muted">Person</p>
                </div>
            </div>
        </template>
    </WContentItemCard>

</template>

<script setup>

defineProps({
    person: {
        type: Object,
        required: true,
    },
    party: {
        type: Object,
        default: null
    }
})

function cardDescription(person, party) {
    if (!person) return null

    if (party) return party.display_name

    if (person.party_affiliation !== undefined && person.parliamentary_affiliation !== undefined) {
        const determined_party = person.party_affiliation?.party?.display_name || person.party_affiliation?.party?.name
        const electorate = person.parliamentary_affiliation
            ? (person.parliamentary_affiliation.electorate?.name || 'List')
            : null
        const parts = []
        if (determined_party) parts.push(determined_party)
        if (electorate) parts.push(electorate)
        return parts.join(' · ')
    }

    if (person.cached_description) return person.cached_description
    
}

function profileImageSrc(person) {
    return person.photo?.file || '/images/generic-profile-picture.png'
}

</script>