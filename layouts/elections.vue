<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useElectionShape } from '~/composables/useElectionShape'
import { useElectionsDebugEnabled } from '~/composables/useElectionsDebug'

const route = useRoute()
const electionSlug = computed(() => route.params.electionSlug)
const resultsVersionSlug = computed(() => route.params.resultsVersionSlug)

const open = ref(false)

const linksAvailable = computed(() => Boolean(resultsVersionSlug.value && electionSlug.value))

// A by-election returns one member and has no party vote, so Parliament and the
// list of electorates are pages about nothing. Hiding them beats rendering
// them empty, and beats a reader finding out by opening one.
const { hasPartyVote, isSingleElectorate } = useElectionShape()

const debugEnabled = useElectionsDebugEnabled()

const base = computed(() => `/elections/${electionSlug.value}/${resultsVersionSlug.value}`)

interface Section { label: string, icon: string, path?: string, exact?: boolean, when?: () => boolean }

const sections: Section[] = [
  { label: 'Overview', icon: 'i-lucide-layout-dashboard', exact: true },
  { label: 'Parliament', icon: 'i-lucide-landmark', path: '/parliament', when: () => hasPartyVote.value },
  {
    label: 'Electorates',
    icon: 'i-lucide-map',
    path: '/electorates',
    // One electorate is the overview. A list of it is a page with one card.
    when: () => !isSingleElectorate.value,
  },
  { label: 'Voting places', icon: 'i-lucide-map-pin', path: '/voting-places' },
  // Changing the MMP rules is not ready for readers yet.
  { label: 'Settings', icon: 'i-lucide-settings', path: '/settings', when: () => debugEnabled },
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

const colorMode = useColorMode()

const themes = [
  { label: 'Auto', icon: 'i-lucide-monitor', value: 'system' },
  { label: 'Light', icon: 'i-lucide-sun', value: 'light' },
  { label: 'Dark', icon: 'i-lucide-moon', value: 'dark' },
]

const currentTheme = computed(() => themes.find(theme => theme.value === colorMode.preference) ?? themes[0]!)

const themeItems = computed(() => themes.map(theme => ({
  label: theme.label,
  icon: theme.icon,
  type: 'checkbox' as const,
  checked: colorMode.preference === theme.value,
  onSelect: (e: Event) => {
    e.preventDefault()
    colorMode.preference = theme.value
  },
})))
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

        <ClientOnly>
          <UTooltip :text="`Theme: ${currentTheme.label}`" :disabled="!collapsed" :content="{ side: 'right' }">
            <UDropdownMenu
              :items="themeItems"
              :content="{ side: collapsed ? 'right' : 'top', align: 'end' }"
            >
              <UButton
                :icon="currentTheme.icon"
                :label="collapsed ? undefined : `Theme: ${currentTheme.label}`"
                :aria-label="`Theme: ${currentTheme.label}`"
                color="neutral"
                variant="ghost"
                :square="collapsed"
                :block="!collapsed"
                :class="collapsed ? 'mx-auto' : 'justify-start'"
              />
            </UDropdownMenu>
          </UTooltip>
        </ClientOnly>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>