<script setup>
const search = ref('')

const liveElection = ref(true)

const config = useRuntimeConfig()
const { data: homepageData } = await useAsyncData('homepageData', () => $fetch(`${config.public.apiBase}client/homepage/`))

import { formatDistanceToNow, format } from 'date-fns'

const relativeDate = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

const formattedDateFull = (date) => {
  return format(new Date(date), 'dd MMMM yyyy')
}

const formattedDate = (date) => {
  return format(new Date(date), 'dd MMMM yyyy')
}
</script>

<template>
  <div>
  <div class="relative bg-[url('https://storage.googleapis.com/wheretheystand-nz/nzpm_app/beehive.jpg')] dark:bg-[url('https://storage.googleapis.com/wheretheystand-nz/nzpm_app/beehive_night.jpg')] bg-cover bg-center bg-no-repeat">
    <div class="absolute inset-0 bg-white/70 dark:bg-black/70"></div> <!-- Optional overlay -->
    <UPageHero
      class="relative z-10"
      title="Wondering where they stand?"
      description="WhereTheyStand aggregates voting data, financial information, biographical information, and more."
      orientation="horizontal">
      <div>
        <UPageCard v-if="liveElection" variant="soft" spotlight spotlightColor="error" to="/elections/2026-general-election">
        <template #title>
          <h2 class="text-2xl font-bold"><span class="w-4 h-4 rounded-full bg-red-500 animate-pulse inline-block mr-2"> </span>Live election results</h2>
        </template>
        <template #description>
          <p>Election results for the 2026 general election will be available as they come in.</p>
        </template>
      </UPageCard>
      <USeparator v-if="liveElection" class="my-4" label="or"/>
      <UPageCard variant="soft" spotlight spotlightColor="primary">
        <template #title>
          <h2 class="text-2xl font-bold">Find an MP, electorate or party</h2>
        </template>
        <template #description>
          <p>All MPs who've been in Parliament since 2014 have profiles.</p>

        <UFormField class="mt-4">
          <UInput v-model="search" placeholder="MP, party or electorate name" class="w-full"/>
          <template #trailing>
            <UButton variant="link">
              <UIcon name="i-heroicons-magnifying-glass" />
            </UButton>
          </template>
          <template #help>
            <span class="text-muted text-xs">Search provided by Algolia.</span>
          </template>
        </UFormField>

        <ULink variant="link" class="mt-4 text-md">
          Or, go to a random page <UIcon name="i-heroicons-arrow-right" />
        </ULink>
        </template>
      </UPageCard>
    </div>
    </UPageHero>
  </div>
<UContainer class="my-8">
  <UPageGrid>
    <UPageGridItem>
      <h3 class="text-2xl font-bold mb-4">Recent votes</h3>
      <UCard v-if="homepageData && homepageData.votes">
        <div class="flex flex-col gap-4">
          <UPageCard v-for="vote in homepageData.votes" :key="vote.id" variant="soft" :title="vote.name" :description="formattedDateFull(vote.date)" :to="'/votes/' + vote.id"></UPageCard>
        </div>
      </UCard>
    </UPageGridItem>
    <UPageGridItem>
      <h3 class="text-2xl font-bold mb-4">Recently updated bills</h3>
      <UCard v-if="homepageData && homepageData.bills">
        <div class="flex flex-col gap-4">
          <UPageCard v-for="bill in homepageData.bills" :key="bill.id" variant="soft" :title="bill.name" :to="'/bills/' + bill.id"></UPageCard>
        </div>
      </UCard>
    </UPageGridItem>
    <UPageGridItem>
      <h3 class="text-2xl font-bold mb-4">Recent elections</h3>
      <UCard>
        <div class="flex flex-col gap-4">
          <UPageCard variant="soft" title="2023 Port Waikato by-election" to="/elections/2023-port-waikato-by-election"></UPageCard>
          <UPageCard variant="soft" title="2023 General election" to="/elections/2023-general-election"></UPageCard>
          <UPageCard variant="soft" title="2022 Hamilton West by-election" to="/elections/2022-hamilton-west"></UPageCard>
          <UPageCard variant="soft" title="2022 Tauranga by-election" to="/elections/2022-tauranga"></UPageCard>
        </div>
      </UCard>
    </UPageGridItem>
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