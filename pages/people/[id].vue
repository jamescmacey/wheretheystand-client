<template>
    <div id="person-view" v-if="status === 'success'">

        <Head>
            <Meta name="twitter:card" content="summary" />
            <Meta name="twitter:image" :content="person.image" />
            <Meta name="twitter:image:alt" :content="person.display_name" />

            <Meta property="og:image:alt" :content="person.display_name" />
            <Meta property="og:image" :content="person.image" />
            <Meta name="twitter:card" content="summary" />

            <Meta name="twitter:site" content="@wheretheystand_" />
            <Meta name="twitter:title" :content="person.display_name + ' - WhereTheyStand'" />
            <Meta name="twitter:description" :content="person.description" />

            <Meta property="og:site_name" content="WhereTheyStand" />
            <Meta property="og:locale" content="en_NZ" />

            <Meta property="og:description" :content="person.description" />
            <Meta property="og:title" :content="person.display_name + ' - WhereTheyStand'" />
        </Head>
        <PageHeader :pageTitle="person.display_name" :pageSubtitle="person.description" :image="person.image"
            :colour="person.colour" :pageLinks="links"></PageHeader>
        <NuxtPage :person="person"></NuxtPage>
    </div>
    <div v-else>
        {{ status }} {{ error }}
    </div>
</template>

<script setup>
import { usePeopleStore } from '../../stores/people'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const personKey = computed(() => `person-${route.params.id}`)
const { data: person, status, error, refresh, clear } = await useAsyncData(personKey, () => $fetch(apiBase + '/people/' + route.params.id + '/'))

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
            name: 'Interests'
        },
        {
            to: '/people/' + route.params.id + '/expenses',
            name: 'Expenses'
        },
        {
            to: '/people/' + route.params.id + '/elections',
            name: 'Electoral history'
        }
    ]
})
</script>

<style scoped></style>