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
                    <UBreadcrumb v-if="breadcrumb?.length" :items="breadcrumb" />
                    <!-- Both ends of the navbar compete for a phone's width, so the
                         title yields rather than pushing the version switch off. -->
                    <span v-else class="block truncate max-w-[40vw] sm:max-w-none">{{ title }}</span>
                </template>
                <template v-if="$slots.actions" #right>
                    <slot name="actions" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div :class="fill ? 'flex flex-col flex-1 min-h-0 gap-4 p-4' : 'flex flex-col gap-4 p-4'">
                <div v-if="heading || $slots.heading || status" class="space-y-3">
                    <slot name="heading">
                        <h2 v-if="heading" class="text-2xl font-bold">{{ heading }}</h2>
                    </slot>
                    <p v-if="description" class="text-muted">{{ description }}</p>
                    <ElectionsStatusResultsStatusBar v-if="status" :electorate="statusElectorate" />
                </div>

                <slot />
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { EntityNumber } from '~/types/elections'

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
 */
withDefaults(defineProps<{
    /** Shown in the navbar. Ignored when `breadcrumb` is given. */
    title?: string
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
}>(), { status: true, fill: false })
</script>
