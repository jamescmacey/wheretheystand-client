<template>
    <div>
        <PageHeader page-title="Parliaments"></PageHeader>
        <UContainer class="my-8">
            <div v-if="status === 'success'">
                <p class="mb-6">
                    WhereTheyStand has information on New Zealand parliaments from the 51st Parliament onwards.
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <WContentItemCard
                        v-for="parliament in data ?? []"
                        :key="parliament.id"
                        :item="parliament"
                        :to="`/parliaments/${parliament.number}`"
                    >
                        <template #title>
                            <span class="text-2xl font-bold leading-tight">
                                {{ ordinal(parliament.number) }} Parliament
                            </span>
                        </template>
                        <template #description>
                            {{ fullDateRange(parliament) }}
                        </template>
                    </WContentItemCard>
                </div>
            </div>

            <UCard v-else-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading parliaments...</h3>
                    <UProgress animation="swing" />
                </div>
            </UCard>

            <UEmpty
                v-else
                :title="'Error loading parliaments'"
                :description="'An error occurred while loading parliaments. Please try again.'"
            >
                <template #actions>
                    <UButton
                        variant="subtle"
                        color="neutral"
                        @click="refresh()"
                        class="mt-4"
                        icon="i-lucide-refresh-cw"
                        trailing
                    >
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
            <p v-if="error && status === 'error'" class="text-muted text-xs text-center mt-4">
                {{ error.statusCode }}: {{ error }}
            </p>
        </UContainer>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

type Parliament = {
    id: string
    number: number
    start_date: string
    end_date: string | null
    election?: string | null
}

const { data, status, error, refresh } = await useAsyncData("parliaments-list", () =>
    $fetch<Parliament[]>(`${apiBase}parliaments/?number_gte=51`),
)

function formatDate(value: string | null): string {
    if (!value) return "Present"
    const date = new Date(value)
    const formatted = new Intl.DateTimeFormat("en-NZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date)
    return formatted.replace(/ /g, "\u00A0")
}

function ordinal(n: number): string {
    const suffix =
        n % 100 >= 11 && n % 100 <= 13
            ? "th"
            : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th")
    return `${n}${suffix}`
}

function fullDateRange(parliament: Parliament): string {
    return `${formatDate(parliament.start_date)} – ${formatDate(parliament.end_date)}`
}
</script>
