<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <!-- Only where it will not squeeze the election name: a
                         phone shows the mark in the slideover instead. -->
                    <span class="hidden md:block font-brand text-base font-extrabold tracking-wide text-theme1 shrink-0">WhereTheyStand</span>
                    <span class="hidden md:block h-5 w-px bg-accented shrink-0" aria-hidden="true" />
                </template>
                <template #title>
                    <div v-if="breadcrumb?.length" class="min-w-0">
                        <UBreadcrumb :items="breadcrumb" />
                        <!-- No room beside the breadcrumb until `xl`, so it sits below. -->
                        <p v-if="electionContext" class="xl:hidden text-xs font-normal text-muted truncate">
                            {{ electionContext }}
                        </p>
                    </div>
                    <!-- Both ends of the navbar compete for a phone's width, so the
                         name yields rather than pushing the version switch off.
                         It wraps rather than truncating: "2023 general electi…"
                         loses the one word that says what the page is. -->
                    <span v-else-if="election"
                        class="block whitespace-normal line-clamp-2 leading-tight max-w-[40vw] sm:max-w-none">{{ election.name }}</span>
                </template>
                <template #right>
                    <span v-if="breadcrumb?.length && electionContext"
                        class="hidden xl:block text-sm text-muted whitespace-nowrap">{{ electionContext }}</span>
                    <ElectionsNavigationResultsVersionSwitch v-else-if="!breadcrumb?.length && election && resultsVersion"
                        class="min-w-0" :election="election" :resultsVersion="resultsVersion" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <!-- A container, because the feed panel takes a share of the width that a
                 viewport breakpoint cannot see. Pages lay out against this. -->
            <div class="@container" :class="fill ? 'flex flex-col flex-1 min-h-0 gap-4 p-4' : 'flex flex-col gap-4 p-4'">
                <div v-if="heading || $slots.heading || status" class="space-y-3">
                    <slot name="heading">
                        <h2 v-if="heading" class="text-2xl font-bold">{{ heading }}</h2>
                    </slot>
                    <p v-if="description" class="text-muted">{{ description }}</p>
                    <ElectionsStatusResultsStatusBar v-if="status" :electorate="statusElectorate"
                        :progress="statusProgress" />
                </div>

                <slot />
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { EntityNumber } from '~/types/elections'
import { useElectionShape } from '~/composables/useElectionShape'

/**
 * The frame every dashboard page sits in.
 *
 * Panel, navbar, heading and the status bar were repeated
 * verbatim across eight pages, which is how the spacing above the heading came
 * to differ between three of them. Everything a page varies is a prop or a
 * slot; everything it does not is here.
 *
 * `status` defaults on. Every page showing figures has to say where they came
 * from and how current they are, and a page that forgets is worse than one that
 * has to opt out.
 *
 * The navbar says which election and version the page belongs to, never which
 * page it is: that is the heading's job, and it was saying it twice.
 */
const { election, resultsVersion } = useElectionShape()

const electionContext = computed(() => (election.value && resultsVersion.value
    ? `${election.value.name} · ${resultsVersion.value.name}`
    : null))

withDefaults(defineProps<{
    breadcrumb?: BreadcrumbItem[]
    /** The page's own heading, above the status bar. */
    heading?: string
    description?: string
    status?: boolean
    /**
     * Narrow the status bar to one electorate, where the page is about one.
     *
     * The bar otherwise speaks for the whole election, which beside a single
     * seat's figures reads as a statement about that seat.
     */
    statusElectorate?: EntityNumber
    /** Show the counting progress in the status bar. */
    statusProgress?: boolean
    /**
     * Let the page's content fill the panel rather than growing with its own
     * height.
     *
     * The panel body is the scroll container, so by default a page is a column
     * that gets as tall as it needs and scrolls. A page whose own content
     * scrolls -- a map beside a list -- needs the opposite: a wrapper that
     * stops at the panel's height and hands the overflow to its children.
     * Without `min-h-0` a flex child refuses to shrink below its content and
     * the whole panel grows instead.
     */
    fill?: boolean
}>(), { status: true, statusProgress: true, fill: false })
</script>
