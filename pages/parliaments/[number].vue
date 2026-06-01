<template>
    <div v-if="status === 'success' && parliament">
        <PageHeader :page-title="`${ordinal(parliament.number)} Parliament`"></PageHeader>
        <UContainer class="my-8">
            <UCard>
                <template #header>
                    <h2 class="text-lg font-semibold">Parliament Overview</h2>
                </template>

                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt class="text-sm text-muted">Number</dt>
                        <dd class="font-medium">{{ parliament.number }}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-muted">Start date</dt>
                        <dd class="font-medium">{{ formatDate(parliament.start_date) }}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-muted">End date</dt>
                        <dd class="font-medium">{{ formatDate(parliament.end_date) }}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-muted">Election</dt>
                        <dd class="font-medium">{{ parliament.election ?? "Not linked" }}</dd>
                    </div>
                </dl>
            </UCard>
        </UContainer>
    </div>

    <div v-else>
        <UContainer class="my-8">
            <UCard v-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading parliament {{ route.params.number }}...</h3>
                    <UProgress animation="swing" />
                </div>
            </UCard>
            <UEmpty
                v-else
                :title="'Error loading parliament ' + route.params.number"
                :description="'An error occurred while loading this parliament. Please try again.'"
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
const route = useRoute()

type Parliament = {
    id: string
    number: number
    start_date: string
    end_date: string | null
    election?: string | null
}

const parliamentKey = computed(() => `parliament-${route.params.number}`)
const { data: parliament, status, error, refresh } = await useAsyncData(parliamentKey, () =>
    $fetch<Parliament>(`${apiBase}parliaments/${route.params.number}/`),
)

function formatDate(value: string | null): string {
    if (!value) return "Present"
    const date = new Date(value)
    return new Intl.DateTimeFormat("en-NZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date)
}

function ordinal(n: number): string {
    const suffix =
        n % 100 >= 11 && n % 100 <= 13
            ? "th"
            : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th")
    return `${n}${suffix}`
}
</script>
