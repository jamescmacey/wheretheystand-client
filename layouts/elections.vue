<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const eventId = route.params.eventId
const toast = useToast()

const open = ref(false)

const links = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/events/' + eventId + '/',
  exact: true,
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Favourites',
  icon: 'i-lucide-star',
  to: '/favourites',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Candidates',
  icon: 'i-lucide-users',
  to: '/events/' + eventId + '/candidates',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Electorates',
  icon: 'i-lucide-map',
  to: '/events/' + eventId + '/electorates',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Voting places',
  icon: 'i-lucide-map-pin',
  to: '/events/' + eventId + '/voting-places',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Calculations',
  icon: 'i-lucide-grid-3x2',
  to: '/events/' + eventId + '/calculations',
  onSelect: () => {
    open.value = false
  }
}, 
{
  label: 'Settings',
  icon: 'i-lucide-settings',
  to: '/events/' + eventId + '/settings',
  onSelect: () => {
    open.value = false
  }
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
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
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
      resizable
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

    <NotificationsSlideover />
  </UDashboardGroup>
</template>