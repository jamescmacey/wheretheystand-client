<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #title>
                    Calculations
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-y-auto pt-0">
                <div class="flex flex-col gap-4 px-4">
                    
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup>
const props = defineProps({
    election: {
        type: Object,
        required: true
    },
    resultsVersion: {
        type: Object,
        required: true
    }
})
</script>