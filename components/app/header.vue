<script setup lang="ts">
const route = useRoute()

const items = computed(() => [{
  label: 'People',
  to: '/people',
  class: 'text-inverted dark:text-default hover:underline hover:text-inverted dark:hover:text-default'
}, {
  label: 'Parties',
  to: '/parties',
  class: 'text-inverted dark:text-default hover:underline hover:text-inverted dark:hover:text-default'
}, {
  label: 'Electorates',
  to: '/electorates',
  class: 'text-inverted dark:text-default hover:underline hover:text-inverted dark:hover:text-default'
}, {
  label: 'Bills',
  to: '/bills',
  class: 'text-inverted dark:text-default hover:underline hover:text-inverted dark:hover:text-default'
}, {
  label: 'Votes',
  to: '/votes',
  class: 'text-inverted dark:text-default hover:underline hover:text-inverted dark:hover:text-default'
},
{
  label: 'Elections',
  to: '/elections',
  class: 'text-inverted dark:text-default hover:underline hover:text-inverted dark:hover:text-default'
},
{
  label: 'Search',
  to: '/search',
  class: 'text-inverted dark:text-default hover:underline hover:text-inverted dark:hover:text-default'
},
])
</script>

<template>
  <UHeader :ui="{
    root: 'bg-theme1/100 border-b border-theme1/0 h-(--ui-header-height) sticky top-0 z-50',
  }" mode="drawer">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0 text-inverted dark:text-default" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>