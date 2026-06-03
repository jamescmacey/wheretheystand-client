<script setup>
const search = ref('')
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const liveElection = ref(false)
const electionFeaturesEnabled = String(config.public.electionsEnabled).toLowerCase() === 'true'


const { data: homepageData, status, error } = await useAsyncData('homepageData', () => $fetch(`${apiBase}client/homepage/`))

usePageSeo({
    title: 'Wondering where they stand?',
    description: "WhereTheyStand aggregates information about New Zealand's members of Parliament.",
})

import { formatDistanceToNow, format } from 'date-fns'

const relativeDate = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

const formattedDateFull = (date) => {
  return format(new Date(date), 'dd MMMM yyyy')
}

const resetSearch = () => {
  search.value = ''
}

onMounted(resetSearch)
onActivated(resetSearch)

const submitSearch = async () => {
  const term = search.value.trim()
  if (!term) {
    return
  }

  await navigateTo({
    path: '/search',
    query: {
      query: term,
      'refinementList[type][0]': 'Person',
      'refinementList[type][1]': 'Electorate',
      'refinementList[type][2]': 'Party',
    },
  })
}

const loadingRandomPage = ref(false)
const toast = useToast()
const randomPage = async () => {
  if (loadingRandomPage.value) {
    return
  }

  loadingRandomPage.value = true
  try {
    const data = await $fetch(`${apiBase}client/random/`, {
      cache: 'no-store',
      query: { _: Date.now() },
    })
    await navigateTo(data.to)
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error loading random page',
      description: 'Please try again.',
      color: 'error'
    })
  } finally {
    loadingRandomPage.value = false
  }
}
</script>

<template>
  <div>
    <div
      class="relative bg-[url('/images/beehive-day.jpg')] dark:bg-[url('/images/beehive-night.jpg')] bg-cover bg-center bg-no-repeat">
      <div class="absolute inset-0 bg-white/60 dark:bg-black/70"></div> <!-- Optional overlay -->
      <UPageHero class="relative z-10" title="Wondering where they stand?"
        description="WhereTheyStand aggregates information about New Zealand's members of Parliament."
        orientation="horizontal" :ui="{description: '-text-muted dark:-text-muted light:font-semibold text-highlighted'}">
        <div>
          <UPageCard v-if="liveElection && electionFeaturesEnabled" variant="soft" spotlight spotlightColor="error"
            to="/elections/2026-general-election">
            <template #title>
              <h2 class="text-2xl font-bold"><span
                  class="w-4 h-4 rounded-full bg-red-500 animate-pulse inline-block mr-2"> </span>Live election results
              </h2>
            </template>
            <template #description>
              <p>Election results for the 2026 general election will be available as they come in.</p>
            </template>
          </UPageCard>
          <USeparator v-if="liveElection && electionFeaturesEnabled" class="my-4" label="or" />
          <UPageCard variant="soft" spotlight spotlightColor="primary">
            <template #title>
              <h2 class="text-2xl font-bold">Find an MP, electorate or party</h2>
            </template>
            <template #description>
              <p>All MPs who've been in Parliament since 2014 have profiles.</p>

              <form class="mt-4" @submit.prevent="submitSearch">
                <UFormField>
                  <UInput v-model="search" placeholder="MP, party or electorate name" class="w-full" />
                  <template #trailing>
                    <UButton type="submit" variant="link" aria-label="Search">
                      <UIcon name="i-heroicons-magnifying-glass" />
                    </UButton>
                  </template>
                  <template #help>
                    <span class="text-muted text-xs">Search provided by Algolia.</span>
                  </template>
                </UFormField>
              </form>

              <UButton variant="link" @click="randomPage()" class="mt-4 pl-0 text-md" icon="i-heroicons-arrow-right" trailing :loading="loadingRandomPage" >
                Or, go to a random page
              </UButton>
            </template>
          </UPageCard>
        </div>
      </UPageHero>
    </div>
    <UContainer class="my-8">
      <UPageGrid>
        <div :class="{'col-span-2': status === 'error'}">
          <h3 class="text-2xl font-bold mb-4">Recent <span v-if="status === 'error'">bills and </span>votes</h3>
          <UCard v-if="status === 'success' && homepageData && homepageData.votes">
            <div class="flex flex-col gap-4">
              <UPageCard v-for="vote in homepageData.votes" :key="vote.id" variant="soft" :title="vote.name"
                :description="formattedDateFull(vote.date)" :to="'/votes/' + vote.id"></UPageCard>
            </div>
          </UCard>
          <UCard v-else-if="status === 'pending'">
            <div class="flex flex-col gap-4">
              <div v-for="i in 5" :key="i">
                <USkeleton class="w-full h-16" />
              </div>
            </div>
          </UCard>
          <UEmpty v-else-if="status === 'error'" title="Error loading recent bills and votes." description="Please try again." icon="i-heroicons-exclamation-triangle"></UEmpty>
        </div>
        <div v-if="status != 'error'">
          <h3 class="text-2xl font-bold mb-4">Recently updated bills</h3>
          <UCard v-if="status === 'success' && homepageData && homepageData.bills">
            <div class="flex flex-col gap-4">
              <UPageCard v-for="bill in homepageData.bills" :key="bill.id" variant="soft" :title="bill.name"
                :to="'/bills/' + bill.id"></UPageCard>
            </div>
          </UCard>
          <UCard v-else-if="status === 'pending'">
            <div class="flex flex-col gap-4">
              <div v-for="i in 5" :key="i">
                <USkeleton class="w-full h-16" />
              </div>
            </div>
          </UCard>
        </div>
        <div>
          <h3 class="text-2xl font-bold mb-4">Update</h3>
          <UPageCard>
            <template #title>
              Feature improvements to WhereTheyStand
            </template>
            <template #description>
              <div class="space-y-4">
                <p>I've made some changes to WhereTheyStand to ensure that data can keep updating and is presented accurately.</p> 
                <UButton to="/changes" variant="link" icon="i-heroicons-arrow-right" class="pl-0" trailing>Learn more</UButton>
              </div>
            </template>
          </UPageCard>
        </div>
      </UPageGrid>
    </UContainer>
    <div class="dark:hidden">
      <USeparator />
      <UFooter>
        <span class="text-muted text-xs">
          Header image by Wikimedia user "Melonblob", used under licence (CC BY-SA 4.0). Cropped and resized.
        </span>
      </UFooter>
    </div>
  </div>
</template>