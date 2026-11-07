<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Electoral law</h3>
                <UButton v-if="!official" color="neutral" variant="ghost" size="sm"
                    icon="i-lucide-rotate-ccw" label="Reset" @click="resetLaw" />
            </div>
        </template>

        <div class="space-y-4">
            <UFormField name="whatIfFormula" label="MMP calculation"
                description="Sainte-Laguë is the calculation the Electoral Act uses."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <USelect v-model="scenario.law.formula" :items="formulas" class="w-36" />
            </UFormField>
            <USeparator />
            <UFormField name="whatIfThreshold" label="MMP threshold"
                description="The share of the party vote a party needs to share in the list seats."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInputNumber v-model="threshold" :min="0" :max="1" :step="0.005" class="w-36"
                    :format-options="{ style: 'percent', maximumFractionDigits: 1 }" />
            </UFormField>
            <USeparator />
            <UFormField name="whatIfCoattailing" label="Allow coattailing"
                description="Let a party under the threshold share in the list seats if it wins an electorate."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <USwitch v-model="scenario.law.allowCoattailing" />
            </UFormField>
            <USeparator />
            <UFormField name="whatIfBaseSeats" label="Base Parliament size"
                description="Seats before any overhang."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInputNumber v-model="baseSeats" :min="1" :max="MAX_BASE_SEATS" :step="1" class="w-36"
                    :format-options="{ maximumFractionDigits: 0 }" />
            </UFormField>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { useWhatIfScenario } from '~/composables/useWhatIf'
import { MAX_BASE_SEATS, defaultLaw, isLawOfficial } from '~/utils/elections/whatIf'

/** The rules this page calculates under, which apply on this page only. */
const props = defineProps<{ electionSlug: string }>()

const { scenario, resetLaw } = useWhatIfScenario(() => props.electionSlug)

const official = computed(() => isLawOfficial(scenario.value.law))

const formulas = [
    { label: 'Sainte-Laguë', value: 'sainte-lague' },
    { label: 'D\'Hondt', value: 'dhondt' },
]

// A cleared input hands back null or NaN, which is not a rule to calculate under.
const threshold = computed<number>({
    get: () => scenario.value.law.threshold,
    set: value => {
        scenario.value.law.threshold = Number.isFinite(value)
            ? Math.min(1, Math.max(0, value))
            : defaultLaw().threshold
    },
})

const baseSeats = computed<number>({
    get: () => scenario.value.law.baseSeats,
    set: value => {
        scenario.value.law.baseSeats = Number.isFinite(value)
            ? Math.min(MAX_BASE_SEATS, Math.max(1, Math.round(value)))
            : defaultLaw().baseSeats
    },
})
</script>
