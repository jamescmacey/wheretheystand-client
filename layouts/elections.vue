<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useElectionShape } from '~/composables/useElectionShape'
import { useElectionsDebugEnabled } from '~/composables/useElectionsDebug'

const route = useRoute()
const electionSlug = computed(() => route.params.electionSlug)
const resultsVersionSlug = computed(() => route.params.resultsVersionSlug)

const open = ref(false)

const linksAvailable = computed(() => Boolean(resultsVersionSlug.value && electionSlug.value))

// A by-election returns one member and has no party vote, so the House and the
// list of electorates are pages about nothing. Hiding them beats rendering
// them empty, and beats a reader finding out by opening one.
const { hasPartyVote, isSingleElectorate } = useElectionShape()

const debugEnabled = useElectionsDebugEnabled()

const base = computed(() => `/elections/${electionSlug.value}/${resultsVersionSlug.value}`)

interface Section { label: string, icon: string, path?: string, exact?: boolean, when?: () => boolean }

const sections: Section[] = [
  { label: 'Overview', icon: 'i-lucide-layout-dashboard', exact: true },
  { label: 'House', icon: 'i-lucide-landmark', path: '/house', when: () => hasPartyVote.value },
  { label: 'Candidates', icon: 'i-lucide-users', path: '/candidates' },
  {
    label: 'Electorates',
    icon: 'i-lucide-map',
    path: '/electorates',
    // One electorate is the overview. A list of it is a page with one card.
    when: () => !isSingleElectorate.value,
  },
  { label: 'Voting places', icon: 'i-lucide-map-pin', path: '/voting-places' },
  { label: 'Settings', icon: 'i-lucide-settings', path: '/settings' },
  {
    label: 'Debug',
    icon: 'i-lucide-bug',
    path: '/debug',
    when: () => debugEnabled,
  },
]

const links = computed(() => [
  sections
    .filter(section => section.when?.() ?? true)
    .map(section => ({
      label: section.label,
      icon: section.icon,
      to: `${base.value}${section.path ?? '/'}`,
      exact: section.exact,
      onSelect: () => { open.value = false },
      disabled: !linksAvailable.value,
    })),
  [
    { label: 'All elections', icon: 'i-lucide-arrow-left', to: '/elections', exact: true },
    { label: 'Feedback', icon: 'i-lucide-message-circle', to: '/contact' },
    { label: 'Home', icon: 'i-lucide-house', to: '/' },
  ],
] satisfies NavigationMenuItem[][])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat(),
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <!-- Icons only, always. Without `collapsible` the collapsed state is fixed:
         nothing can expand it, and no width is persisted between visits. The
         slideover on phones still opens with labels, where there is room. -->
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      :collapsed="true"
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <!-- The rail is too narrow for the wordmark, so it carries the arch
             mark alone; the slideover on phones has room for the name. -->
        <AppLogomark v-if="collapsed" class="mx-auto size-7" />
        <span v-else class="font-brand text-xl tracking-wide"><span class="font-extrabold text-theme1">WhereTheyStand</span></span>
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