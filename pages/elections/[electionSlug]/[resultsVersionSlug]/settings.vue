<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #title>
                    Settings
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="max-w-lg mx-auto space-y-4">
                <UPageCard variant="naked">
                    <template #title>
                        Settings
                    </template>
                    <template #description>
                        These settings will be saved to your local device so that they apply across all visits to this
                        website.
                    </template>
                </UPageCard>
                <UPageCard variant="subtle">
                    <UFormField name="mmpFormula" label="MMP formula"
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <USelect v-model="mmpFormula" :items="mmpFormulas" />
                    </UFormField>
                    <USeparator />
                    <UFormField name="mmpThreshold" label="MMP threshold"
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <UInputNumber :min="0" :max="1" v-model="mmpThreshold" :step="0.01" :format-options="{
                            style: 'percent'
                        }" />
                    </UFormField>
                    <USeparator />
                    <UFormField name="baseSeats" label="Base seats"
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <UInputNumber :min="0" v-model="baseSeats" :step="1" />
                    </UFormField>
                    <USeparator />
                    <UFormField name="allowCoattailing" label="Allow coattailing"
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <USwitch v-model="allowCoattailing" />
                    </UFormField>
                    <USeparator />
                    <UFormField name="allowOverhang" label="Allow overhang"
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <USwitch v-model="allowOverhang" />
                    </UFormField>
                    <USeparator />
                </UPageCard>
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

const mmpFormula = ref('sainte-lague')
const allowCoattailing = ref(true)
const allowOverhang = ref(true)
const mmpThreshold = ref(0.05)
const mmpFormulas = ref([
    {
        label: 'D\'Hondt',
        value: 'dhondt'
    },
    {
        label: 'Sainte-Laguë',
        value: 'sainte-lague'
    }
])
const baseSeats = ref(120)
</script>