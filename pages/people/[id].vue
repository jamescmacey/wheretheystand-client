<template>
    <div id="person-view" v-if="status === 'success'">

        <PageHeader :pageTitle="person.display_name" :pageSubtitle="person.cached_description" :image="person.photo?.file"
            :colour="person.cached_colour" :pageLinks="links"></PageHeader>
        <NuxtPage :person="person"></NuxtPage>
    </div>
    <div v-else>
        <UContainer class="my-8">
            <UCard v-if="status === 'pending'" class="w-full">
            <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading {{ route.params.id}}...</h3>
                <UProgress animation="swing" />
            </div>
        </UCard>
            <UEmpty v-else :title="'Error loading ' + route.params.id"
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
const electionsEnabled = String(config.public.electionsEnabled).toLowerCase() === 'true'
const route = useRoute()

const personKey = computed(() => `person-${route.params.id}`)
const { data: person, status, error, refresh, clear } = await useAsyncData(personKey, () => $fetch(apiBase + 'people/' + route.params.id + '/'))

const links = computed(() => {
    return [
        {
            to: '/people/' + route.params.id,
            name: 'Overview'
        },
        {
            to: '/people/' + route.params.id + '/details',
            name: 'Details'
        },
        {
            to: '/people/' + route.params.id + '/bills',
            name: 'Bills'
        },
        {
            to: '/people/' + route.params.id + '/votes',
            name: 'Votes'
        },
        {
            to: '/people/' + route.params.id + '/interests',
            name: 'Interests',
        },
        {
            to: '/people/' + route.params.id + '/expenses',
            name: 'Expenses',
        },
        ...(electionsEnabled ? [{
            to: '/people/' + route.params.id + '/elections',
            name: 'Electoral history'
        }] : [])
    ]
})

const personSlug = computed(() => String(route.params.id ?? ''))

usePageSeo({
    title: () => {
        const name = person.value?.display_name
        if (!name) return undefined
        const tab = personTabSeoTitle(route.path, personSlug.value)
        return tab ? `${tab} — ${name}` : name
    },
    description: () => person.value?.cached_description ?? undefined,
    image: () => person.value?.photo?.file ?? undefined,
    imageAlt: () => person.value?.display_name ?? undefined,
})
</script>

<style scoped></style>