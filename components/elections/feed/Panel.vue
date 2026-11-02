<template>
    <!-- Folded away, the panel leaves a rail just wide enough to bring it
         back, so the results get the width without the feed being lost. -->
    <div v-if="collapsed" class="hidden lg:flex flex-col items-center shrink-0 w-12 py-3">
        <UTooltip text="Show updates">
            <UButton icon="i-lucide-panel-right-open" color="neutral" variant="ghost"
                aria-label="Show updates" @click="setCollapsed(false)" />
        </UTooltip>
    </div>

    <UDashboardPanel v-else id="election-feed" :default-size="22" class="hidden lg:flex"
        :ui="{ body: 'p-0 sm:p-0 gap-0' }">
        <template #header>
            <UDashboardNavbar title="Updates" icon="i-lucide-rss" :toggle="false">
                <template #right>
                    <UTooltip text="Hide updates">
                        <UButton icon="i-lucide-panel-right-close" color="neutral" variant="ghost"
                            aria-label="Hide updates" @click="setCollapsed(true)" />
                    </UTooltip>
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <ElectionsFeedList :election="election" :resultsVersion="resultsVersion"
                :messages="source?.feed.value ?? []" :live="live"
                :connection="source?.feedConnection.value ?? 'archived'" />
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useInjectedElectionSource } from '~/composables/useElectionSource'

/**
 * The feed, beside the dashboard.
 *
 * A second `UDashboardPanel` in the same group as the page itself, so it keeps
 * its own scroll and the group gives it a width of its own. It sits in the
 * results version page rather than in any one child, because it is about the
 * count rather than about whichever page is open, and because the listener
 * behind it is held by the source composable at that level -- moving between
 * the overview and the electorates list must not re-subscribe.
 *
 * `default-size` is what gives the panel a fixed width: without it the panel
 * falls back to `flex-1` and takes half the screen from the results. The
 * group is in `rem`, so this is 22rem.
 *
 * Not resizable, although the component offers it. The resize handle renders
 * after the panel it belongs to, which puts it on the far right of the screen
 * for a panel on the right rather than between the two, and the side cannot
 * be changed from here.
 *
 * Hidden below `lg`, where there is no room for two panels at once.
 * `ElectionsFeedDrawer` is what a phone gets instead. The divider is the main
 * panel's own trailing border, so there is none to add here.
 *
 * Collapsible, for a reader who wants the results at full width. Remembered in
 * a cookie rather than local storage, so the server renders the panel the way
 * the reader left it instead of opening it and snapping shut on hydration.
 */
defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const source = useInjectedElectionSource()

const live = computed(() => source?.mode.value === 'live')

const collapsed = useCookie<boolean>('elections-feed-collapsed', {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
})

function setCollapsed(value: boolean) {
    collapsed.value = value
}
</script>
