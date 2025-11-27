<template>
    <div>
        <PageHeader pageTitle="Electorates"></PageHeader>
        <UContainer class="my-8">
            <div v-if="status === 'success'">
                <h2 class="text-2xl font-bold mb-4">New Zealand has {{ electorates.length }} electoral districts,
                    commonly known as electorates.</h2>
                <div class="space-y-4 mb-4">
                    <p>There are {{ generalElectorates.length }} general electorates and {{ maoriElectorates.length }}
                        Māori electorates. The number, sizes, shapes, and names of these electorates are determined by
                        the Representation Commission after each Census in accordance with requirements set out in the
                        Electoral Act 1993. Generally, this means that the electorate boundaries are reviewed every five
                        years, or after every second general election.</p>

                    <p>At an election, voters cast a vote for a candidate who is contesting the electorate they live in.
                        Whichever candidate receives the most votes (a plurality) becomes that electorate's member of
                        Parliament. In a general election, voters also cast a vote for their preferred political party;
                        this vote determines how the remaining seats in Parliament (usually another 48 seats) are
                        filled.</p>

                    <ULink to="https://links.wheretheystand.nz/ec-electorate-map" target="_blank">Find your electorate
                        on a map
                        <UIcon name="i-lucide-external-link" />
                    </ULink>
                </div>

                <div class="mb-2 flex justify-end">
                    <UFormField class="flex-1">
                        <UInput v-model="search" placeholder="Search electorates" size="md" icon="i-lucide-search"
                            class="w-full" />
                    </UFormField>
                    <UTooltip text="Filter by type" class="ml-2">
                        <UTabs v-model="typeFilter" :content="false" :items="types" class="mb-2" size="sm" />
                    </UTooltip>
                </div>
                <p class="text-muted text-sm mb-2">Showing {{ filteredElectorates.length }} of {{ electorates.length }} electorates.</p>


                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <UPageCard v-for="electorate in filteredElectorates" :key="electorate.id"
                        :to="'/electorates/' + electorate.slug">
                        <template #title>
                            {{ electorate.name }}
                        </template>
                        <template #description>
                            {{ electorate.description }}
                        </template>
                    </UPageCard>
                </div>
            </div>
            <UCard v-else-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading {{ route.params.id }}...</h3>
                    <UProgress animation="swing" />
                </div>
            </UCard>
            <UEmpty v-else :title="'Error loading electorates'"
                :description="'An error occurred while loading this person. Please try again.'">
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

const { data: electorates, status, error, refresh, clear } = await useAsyncData("electorates", () => $fetch(apiBase + 'electorates/'))

const sortedElectorates = computed(() => electorates.value.sort((a, b) => a.name.localeCompare(b.name)))
const generalElectorates = computed(() => sortedElectorates.value.filter(electorate => electorate.type === 'general'))
const maoriElectorates = computed(() => sortedElectorates.value.filter(electorate => electorate.type === 'māori'))

const typeFilter = ref('all')
const types = ref([
    {
        label: 'All',
        value: 'all'
    },
    {
        label: 'General',
        value: 'general'
    },
    {
        label: 'Māori',
        value: 'māori'
    }
])

const search = ref('')

const filteredElectorates = computed(() => {
    if (typeFilter.value === 'all' && !search.value) {
        return sortedElectorates.value
    }

    if (search.value) {
        return sortedElectorates.value.filter(electorate => {
            return (electorate.name.toLowerCase().includes(search.value.toLowerCase()) && (typeFilter.value === 'all' || electorate.type === typeFilter.value))
        })
    } else {
        return sortedElectorates.value.filter(electorate => electorate.type === typeFilter.value)
    }
})

</script>