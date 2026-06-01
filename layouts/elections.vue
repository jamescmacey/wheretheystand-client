<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const electionSlug = computed(() => route.params.electionSlug)
const resultsVersionSlug = computed(() => route.params.resultsVersionSlug)

const open = ref(false)

const linksAvailable = computed(() => {
  return Boolean(resultsVersionSlug.value && electionSlug.value)
})

const links = computed(() => [[{
  label: 'Overview',
  icon: 'i-lucide-layout-dashboard',
  to: '/elections/' + electionSlug.value + '/' + resultsVersionSlug.value + '/',
  exact: true,
  onSelect: () => {
    open.value = false
  },
  disabled: !linksAvailable.value
}, {
  label: 'Candidates',
  icon: 'i-lucide-users',
  to: '/elections/' + electionSlug.value + '/' + resultsVersionSlug.value + '/candidates',
  onSelect: () => {
    open.value = false
  },
  disabled: !linksAvailable.value
}, {
  label: 'Electorates',
  icon: 'i-lucide-map',
  to: '/elections/' + electionSlug.value + '/' + resultsVersionSlug.value + '/electorates',
  onSelect: () => {
    open.value = false
  },
  disabled: !linksAvailable.value
}, {
  label: 'Voting places',
  icon: 'i-lucide-map-pin',
  to: '/elections/' + electionSlug.value + '/' + resultsVersionSlug.value + '/voting-places',
  onSelect: () => {
    open.value = false
  },
  disabled: !linksAvailable.value
}, {
  label: 'Calculations',
  icon: 'i-lucide-grid-3x2',
  to: '/elections/' + electionSlug.value + '/' + resultsVersionSlug.value + '/calculations',
  onSelect: () => {
    open.value = false
  },
  disabled: !linksAvailable.value
}, 
{
  label: 'Settings',
  icon: 'i-lucide-settings',
  to: '/elections/' + electionSlug.value + '/' + resultsVersionSlug.value + '/settings',
  onSelect: () => {
    open.value = false
  },
  disabled: !linksAvailable.value
}], [{
  label: 'All elections',
  icon: 'i-lucide-arrow-left',
  to: '/elections',
  exact: true,
},
{
  label: 'Feedback',
  icon: 'i-lucide-message-circle',
  to: '/contact',
},
{
    label: 'Home',
    to: '/',
    icon: 'i-lucide-house',
}]] satisfies NavigationMenuItem[][])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat()
}])

onMounted(async () => {

})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <div v-if="!collapsed">
          <span class="font-brand text-xl tracking-wide"><span class="font-extrabold text-theme1">WhereTheyStand</span></span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>