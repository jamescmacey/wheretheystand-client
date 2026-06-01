<template>
    <div v-if="statusParty === 'success' && statusMps === 'success'">
        <PageHeader :pageTitle="party.display_name" :colour="party.colour" :pageLinks="links" />
        <UContainer class="my-8">
            <p class="text-muted mb-6">
                Showing {{ filteredPartyMps.length }} current member<span v-if="filteredPartyMps.length !== 1">s</span> of Parliament for
                {{ party.display_name }}.
            </p>

            <div class="mb-6 max-w-xl">
                <UFormField label="Search party MPs">
                    <UInput v-model="search" placeholder="Search by name" size="md" icon="i-lucide-search" class="w-full" />
                </UFormField>
            </div>

            <section>
                <h3 class="text-lg font-semibold mb-3 border-b border-default pb-1">
                    Members of Parliament
                </h3>
                <p v-if="filteredPartyMps.length === 0" class="text-muted py-4">
                    No current MPs match your search.
                </p>
                <div
                    v-else
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:auto-rows-[minmax(4.25rem,auto)]"
                >
                    <WContentItemCard
                        v-for="mp in orderedLeaderMps"
                        :key="'leader-' + mp.id"
                        class="sm:row-span-2 h-full min-h-0"
                        :item="{ colour: party.colour }"
                        :to="'/people/' + mp.slug"
                    >
                        <div class="flex h-full min-h-0 flex-col items-center justify-center text-center py-2 gap-2.5">
                            <img
                                :src="profileImageSrc(mp)"
                                :alt="mp.display_name"
                                class="w-24 h-24 rounded-full object-cover shrink-0 ring ring-default"
                            >
                            <p class="w-full text-center text-xl font-semibold text-highlighted">
                                {{ mp.display_name }}
                            </p>
                            <p v-if="party.party_leader_role" class="w-full text-center text-sm font-medium text-muted">
                                {{ party.party_leader_role }}
                            </p>
                            <p class="w-full text-center text-base text-muted">
                                {{ mpCardDescription(mp) }}
                            </p>
                        </div>
                    </WContentItemCard>
                    <WContentItemCard
                        v-for="mp in nonLeaderFilteredMps"
                        :key="mp.id"
                        :item="{ colour: party.colour }"
                        :to="'/people/' + mp.slug"
                    >
                        <template #title>
                            <div class="flex items-center gap-3">
                                <img
                                    :src="profileImageSrc(mp)"
                                    :alt="mp.display_name"
                                    class="w-10 h-10 rounded-full object-cover shrink-0 ring ring-default"
                                >
                                <div class="min-w-0">
                                    <p class="font-medium text-highlighted truncate">{{ mp.display_name }}</p>
                                    <p class="text-sm text-muted truncate">{{ mpCardDescription(mp) }}</p>
                                </div>
                            </div>
                        </template>
                    </WContentItemCard>
                </div>
            </section>
        </UContainer>
    </div>

    <div v-else>
        <UContainer class="my-8">
            <UCard v-if="statusParty === 'pending' || statusMps === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading party...</h3>
                    <UProgress animation="swing" />
                </div>
            </UCard>
            <UEmpty
                v-else
                :title="'Error loading ' + route.params.id"
                :description="'An error occurred while loading this party. Please try again.'"
            >
                <template #actions>
                    <UButton
                        variant="subtle"
                        color="neutral"
                        class="mt-4"
                        icon="i-lucide-refresh-cw"
                        trailing
                        @click="refreshAll()"
                    >
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
            <p v-if="combinedError && (statusParty === 'error' || statusMps === 'error')" class="text-muted text-xs text-center mt-4">
                {{ combinedError }}
            </p>
        </UContainer>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const electionsEnabled = String(config.public.electionsEnabled).toLowerCase() === 'true'
const route = useRoute()

type PartyLeaderPerson = {
    id: string
    slug: string
    display_name: string
    first_name?: string
    last_name?: string
    photo?: { file?: string | null } | null
    cached_description?: string | null
    cached_colour?: string | null
}

type PartyLeaderRow = {
    id: string
    person: PartyLeaderPerson
    start_date?: string
    end_date?: string | null
}

type Party = {
    id: string
    slug: string
    display_name: string
    colour?: string | null
    party_leader_role?: string | null
    party_leader_role_plural?: string | null
    party_leaders?: PartyLeaderRow[]
}

type MpRow = {
    id: string
    slug: string
    display_name: string
    first_name: string
    last_name: string
    photo?: { file?: string | null } | null
    parliamentary_affiliation?: { electorate?: { name?: string | null } | null } | null
    party_affiliation?: { party?: { id?: string; slug?: string | null; display_name?: string | null } | null } | null
}

type PaginatedMpResponse = {
    count: number
    next: string | null
    previous: string | null
    results: MpRow[]
}

const partyKey = computed(() => `party-${route.params.id}`)
const { data: party, status: statusParty, error: errorParty, refresh: refreshParty } = await useAsyncData<Party>(
    partyKey,
    () => $fetch(`${apiBase}parties/${route.params.id}/`),
)

async function fetchAllMps(): Promise<MpRow[]> {
    const collected: MpRow[] = []
    const partySlug = encodeURIComponent(String(route.params.id || ''))
    let url: string | null = `${apiBase}members-of-parliament/?page_size=200&party_slug=${partySlug}`
    while (url) {
        const page = await $fetch<PaginatedMpResponse>(url)
        collected.push(...page.results)
        url = page.next
    }
    return collected
}

const mpKey = computed(() => `party-mps-${route.params.id}`)
const { data: mps, status: statusMps, error: errorMps, refresh: refreshMps } = await useAsyncData<MpRow[]>(
    mpKey,
    fetchAllMps,
    { lazy: true },
)

const search = ref('')

function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
}

function sortByName(a: MpRow, b: MpRow): number {
    return (
        (a.last_name || '').localeCompare(b.last_name || '', 'en-NZ') ||
        (a.first_name || '').localeCompare(b.first_name || '', 'en-NZ')
    )
}

const partyMps = computed(() => {
    const list = mps.value ?? []
    return list.slice().sort(sortByName)
})

const filteredPartyMps = computed(() => {
    const q = normalizeSearchText(search.value.trim())
    if (!q) return partyMps.value
    return partyMps.value.filter((mp) => normalizeSearchText(mp.display_name || '').includes(q))
})

/** Current party leadership rows (no end date). */
const activePartyLeaders = computed(() => {
    const rows = party.value?.party_leaders ?? []
    return rows.filter((pl) => !pl.end_date)
})

const leaderPersonIdSet = computed(() => {
    const ids = new Set<string>()
    for (const pl of activePartyLeaders.value) {
        if (pl.person?.id) ids.add(pl.person.id)
    }
    return ids
})

/**
 * MPs who are party leaders, in API order (party_leaders), intersected with the filtered list.
 */
const orderedLeaderMps = computed(() => {
    const byId = new Map((filteredPartyMps.value ?? []).map((mp) => [mp.id, mp]))
    const out: MpRow[] = []
    for (const pl of activePartyLeaders.value) {
        const mp = byId.get(pl.person.id)
        if (mp) out.push(mp)
    }
    return out
})

const nonLeaderFilteredMps = computed(() => {
    const leaders = leaderPersonIdSet.value
    return (filteredPartyMps.value ?? []).filter((mp) => !leaders.has(mp.id))
})

function mpCardDescription(mp: MpRow): string {
    const electorate = mp.parliamentary_affiliation?.electorate?.name || 'List'
    return `${electorate}`
}

function profileImageSrc(mp: MpRow): string {
    return mp.photo?.file || '/images/generic-profile-picture.png'
}

const combinedError = computed(() => {
    const parts: string[] = []
    if (errorParty.value) parts.push(String(errorParty.value))
    if (errorMps.value) parts.push(String(errorMps.value))
    return parts.join(' · ')
})

function refreshAll(): void {
    refreshParty()
    refreshMps()
}

const links = computed(() => [
    {
        to: '/parties/' + route.params.id,
        name: 'Overview',
    },
    ...(electionsEnabled ? [{
        to: '/parties/' + route.params.id + '/elections',
        name: 'Electoral history',
    }] : []),
])
</script>
