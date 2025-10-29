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
    root: 'bg-theme1/100 backdrop-blur border-b border-theme1/50 h-(--ui-header-height) sticky top-0 z-50',
  }">
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

      <USeparator class="my-6" />

      <UButton
        label="Sign in"
        color="neutral"
        variant="subtle"
        to="/login"
        block
        class="mb-3"
      />
      <UButton
        label="Sign up"
        color="neutral"
        to="/signup"
        block
      />
    </template>
  </UHeader>
</template>