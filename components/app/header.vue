<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const electionsEnabled = String(config.public.electionsEnabled).toLowerCase() === 'true'

const headerLinkClass = 'text-inverted dark:text-default hover:underline hover:text-inverted dark:hover:text-default'

const navItems = computed(() => [{
  label: 'People',
  to: '/people',
}, {
  label: 'Parties',
  to: '/parties',
}, {
  label: 'Electorates',
  to: '/electorates',
}, {
  label: 'Bills',
  to: '/bills',
}, {
  label: 'Votes',
  to: '/votes',
},
...(electionsEnabled ? [{
  label: 'Elections',
  to: '/elections',
}] : []),
{
  label: 'Search',
  to: '/search',
},
])

const headerItems = computed(() =>
  navItems.value.map(item => ({ ...item, class: headerLinkClass }))
)
</script>

<template>
  <UHeader
    :ui="{
      root: 'bg-theme1/100 border-b border-theme1/0 h-(--ui-header-height) sticky top-0 z-50',
      toggle: 'text-inverted dark:text-default hover:text-inverted dark:hover:text-default hover:bg-white/10',
    }"
    mode="drawer"
  >
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0 text-inverted dark:text-default" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="headerItems"
      variant="link"
    />

    <template #body>
      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
        variant="link"
        color="neutral"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>