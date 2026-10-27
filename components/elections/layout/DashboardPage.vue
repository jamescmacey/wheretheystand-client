<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <UDashboardSidebarCollapse />
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
            <div class="flex flex-col gap-4 p-4">
                <div v-if="heading || $slots.heading || status" class="space-y-3">
                    <slot name="heading">
                        <h2 v-if="heading" class="text-2xl font-bold">{{ heading }}</h2>
                    </slot>
                    <p v-if="description" class="text-muted">{{ description }}</p>
                    <ElectionsStatusResultsStatusBar v-if="status" />
                </div>

                <slot />
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

/**
 * The frame every dashboard page sits in.
 *
 * Panel, navbar, collapse control, heading and the status bar were repeated
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
}>(), { status: true })
</script>
