<template>
    <ElectionsLayoutDashboardPage title="Settings" :status="false">
            <div class="max-w-lg mx-auto space-y-4 w-full">
                <UPageCard variant="naked">
                    <template #title>
                        Settings
                    </template>
                    <template #description>
                        These settings are saved to your device, so they apply across every visit
                        to this website.
                    </template>
                </UPageCard>

                <!-- Seat numbers appear on several pages, and every one of them is
                     computed from these rules. Saying so once here is cheaper than a
                     caveat on each page. -->
                <UAlert v-if="!isOfficial" color="warning" variant="subtle" icon="i-lucide-flask-conical"
                    title="Showing a Parliament these rules would produce"
                    description="Seat numbers across the dashboard no longer follow the Electoral Act. Reset below to go back to the official rules.">
                    <template #actions>
                        <UButton color="warning" variant="subtle" size="sm" @click="reset">
                            Reset to official rules
                        </UButton>
                    </template>
                </UAlert>

                <UPageCard variant="subtle">
                    <UFormField name="mmpFormula" label="MMP formula"
                        description="Sainte-Laguë is the formula the Electoral Act uses."
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <USelect v-model="settings.formula" :items="mmpFormulas" />
                    </UFormField>
                    <USeparator />
                    <UFormField name="mmpThreshold" label="MMP threshold"
                        description="The share of the party vote a party needs to share in the list seats."
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <UInputNumber v-model="settings.threshold" :min="0" :max="1" :step="0.01" :format-options="{
                            style: 'percent'
                        }" />
                    </UFormField>
                    <USeparator />
                    <UFormField name="baseSeats" label="Base seats"
                        description="Seats before any overhang."
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <UInputNumber v-model="settings.baseSeats" :min="1" :max="1000" :step="1" />
                    </UFormField>
                    <USeparator />
                    <UFormField name="allowCoattailing" label="Allow coattailing"
                        description="Let a party under the threshold share in the list seats if it wins an electorate."
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <USwitch v-model="settings.allowCoattailing" />
                    </UFormField>
                    <USeparator />
                    <UFormField name="allowOverhang" label="Allow overhang"
                        description="Let Parliament grow when a party wins more electorates than its share of the party vote."
                        class="flex max-sm:flex-col justify-between items-start gap-4">
                        <USwitch v-model="settings.allowOverhang" />
                    </UFormField>
                </UPageCard>
            </div>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useMmpSettings } from '~/composables/useMmpSettings'

defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

// One store for these, rather than a ref per control: they are read by the
// House page and by anything else showing a seat number, and they outlive
// this page.
const { settings, isOfficial, reset } = useMmpSettings()

const mmpFormulas = [
    { label: 'Sainte-Laguë', value: 'sainte-lague' },
    { label: 'D\'Hondt', value: 'dhondt' },
]
</script>
