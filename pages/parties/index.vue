<template>
    <div>
        <PageHeader page-title="Parties"></PageHeader>
        <UContainer class="my-8">
            <div v-if="loadOk">
                <p class="mb-6">
                    This page shows parties with current members of Parliament, and some other parties which have had members of Parliament before.
                </p>

                <UFormField label="Search" class="mb-4 max-w-xl">
                    <UInput v-model="search" placeholder="Search parties" size="md" icon="i-lucide-search"
                        class="w-full" />
                </UFormField>

                <p class="text-muted text-sm mb-6">
                    Showing {{ filteredCurrent.length }} parties with sitting members of Parliament and {{ filteredOther.length }} others.
                </p>

                <section class="mb-10">
                    <h3 class="text-lg font-semibold mb-3 border-b border-default pb-1">
                        Parties with sitting members of Parliament
                    </h3>
                    <p v-if="filteredCurrent.length === 0" class="text-muted py-4">
                        No parties match your search in this group.
                    </p>
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ContentItemCard
                            v-for="party in filteredCurrent"
                            :key="party.id"
                            :item="party"
                            :to="'/parties/' + party.slug"
                        >
                            <template #title>
                                {{ party.display_name }}
                            </template>
                            <template #description>
                                {{ seatLabel(party.seat_count) }}
                            </template>
                        </ContentItemCard>
                    </div>
                </section>

                <section>
                    <h3 class="text-lg font-semibold mb-3 border-b border-default pb-1">
                        Other parties
                    </h3>
                    <p v-if="filteredOther.length === 0" class="text-muted py-4">
                        No parties match your search in this group.
                    </p>
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ContentItemCard
                            v-for="party in filteredOther"
                            :key="party.id"
                            :item="party"
                            :to="'/parties/' + party.slug"
                        >
                            <template #title>
                                {{ party.display_name }}
                            </template>
                            <template #description>
                                {{ seatLabel(party.seat_count) }}
                            </template>
                        </ContentItemCard>
                    </div>
                </section>
            </div>
            <div v-else-if="pending" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading parties…</h3>
                    <UProgress animation="swing" />
                </div>
            </div>
            <UEmpty v-else :title="'Error loading parties'"
                :description="'An error occurred while loading parties. Please try again.'">
                <template #actions>
                    <UButton variant="subtle" color="neutral" class="mt-4" icon="i-lucide-refresh-cw" trailing
                        @click="refreshAll">
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
            <p v-if="hasError && !pending" class="text-muted text-xs text-center mt-4">
                {{ combinedError }}
            </p>
        </UContainer>
    </div>
</template>

<script setup lang="ts">

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

type PartyRow = {
    id: string
    slug: string
    display_name: string
    short_name: string
    abbreviation?: string
    colour?: string | null
    /** Sitting MPs affiliated with this party (parliamentary seats). */
    seat_count: number
}

type PaginatedParties = {
    count: number
    next: string | null
    previous: string | null
    results: PartyRow[]
}

async function fetchAllPartyPages(group: 'current_mps' | 'other'): Promise<PartyRow[]> {
    const collected: PartyRow[] = []
    let url: string | null =
        `${apiBase}parties/?group=${group}&page_size=1000`
    while (url) {
        const page = await $fetch<PaginatedParties>(url)
        collected.push(...page.results)
        url = page.next
    }
    return collected
}

const {
    data: currentParties,
    status: statusCurrent,
    error: errorCurrent,
    refresh: refreshCurrent,
} = await useAsyncData('parties-group-current-mps', () => fetchAllPartyPages('current_mps'), { lazy: true })

const {
    data: otherParties,
    status: statusOther,
    error: errorOther,
    refresh: refreshOther,
} = await useAsyncData('parties-group-other', () => fetchAllPartyPages('other'), { lazy: true })

const loadOk = computed(
    () => statusCurrent.value === 'success' && statusOther.value === 'success',
)
const pending = computed(
    () => statusCurrent.value === 'pending' || statusOther.value === 'pending',
)
const hasError = computed(
    () => statusCurrent.value === 'error' || statusOther.value === 'error',
)

const combinedError = computed(() => {
    const parts: string[] = []
    if (errorCurrent.value) parts.push(String(errorCurrent.value))
    if (errorOther.value) parts.push(String(errorOther.value))
    return parts.join(' · ')
})

function refreshAll() {
    refreshCurrent()
    refreshOther()
}

function seatLabel(n: number): string {
    if (n === 1) return '1 seat'
    return `${n} seats`
}

const search = ref('')

function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
}

function matchesSearch(party: PartyRow, q: string): boolean {
    if (!q) return true
    const hay = [party.display_name, party.short_name, party.abbreviation]
        .filter(Boolean)
        .join(' ')
    const normalizedHay = normalizeSearchText(hay)
    return normalizedHay.includes(q)
}

const filteredCurrent = computed(() => {
    const q = normalizeSearchText(search.value.trim())
    const list = currentParties.value ?? []
    if (!q) return list
    return list.filter((p) => matchesSearch(p, q))
})

const filteredOther = computed(() => {
    const q = normalizeSearchText(search.value.trim())
    const list = otherParties.value ?? []
    if (!q) return list
    return list.filter((p) => matchesSearch(p, q))
})

</script>
