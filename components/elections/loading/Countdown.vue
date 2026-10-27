<template>
    <div class="flex flex-col h-full w-full bg-accented flex-grow items-center justify-center px-4 overflow-hidden">
        <div class="relative w-full max-w-lg">
            <div class="absolute top-0 -left-4 w-72 h-72 rounded-full delay-1000 duration-1000 transition-colors light:mix-blend-multiply filter blur-xl opacity-70 animate-blob"
                :class="blobClassBlue">
            </div>
            <div class="absolute -bottom-2 -left-15 w-32 h-32 rounded-full delay-1000 duration-1000 transition-colors light:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-3000"
                :class="blobClassPink">
            </div>
            <div class="absolute top-0 -right-4 w-72 h-72 rounded-full delay-1000 duration-1000 transition-colors light:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
                :class="blobClassRed">
            </div>
            <div class="absolute -bottom-8 left-20 w-72 h-72 rounded-full delay-1000 duration-1000 transition-colors light:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
                :class="blobClassGreen">
            </div>
            <div class="mx-0 lg:m-8 my-8 relative text-left">
                <div class="grid gap-8 items-start justify-center">
                    <div class="relative group">
                        <UCard class="transition-opacity duration-500 relative">
                            <div v-if="isCountdown">
                                <h1 class="text-2xl lg:text-4xl">{{ election.name }}</h1>
                                <p class="text-md mt-4 mb-2 text-left">Voting closes at {{
                                    formatDateTime(election.polls_close) }}. Results will then be made available here as
                                    they are released by
                                    the Electoral Commission.</p>
                                <UCard variant="soft" class="mt-4">
                                    <h4 class="text-lg lg:text-xl font-bold text-left">Voting closes in:</h4>
                                    <h1 class="text-3xl lg:text-4xl font-mono text-justify">{{ remainingTime }}</h1>
                                </UCard>
                            </div>
                            <div v-else>
                                <h5 class="text-lg mb-1 text-left font-brand font-bold">Awaiting data:</h5>
                                <h6 class="text-md mt-1 mb-3 text-left font-brand font-bold">{{ election.name }}</h6>
                                <p class="text-md text-muted">{{ waitingMessage }}</p>
                                <div class="flex items-center gap-2 mt-4 text-sm text-muted">
                                    <span class="relative flex size-2" aria-hidden="true">
                                        <span
                                            class="absolute inline-flex size-full rounded-full bg-primary opacity-75 animate-ping" />
                                        <span class="relative inline-flex size-2 rounded-full bg-primary" />
                                    </span>
                                    <span>{{ activityLabel }}</span>
                                </div>
                                <UProgress animation="carousel" class="mt-4" />
                            </div>
                        </UCard>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { DashboardPhase, ElectionSummary } from '~/types/elections'

/**
 * The election night waiting screen.
 *
 * Presentational. It no longer decides when polls have closed -- the source
 * owns that, so that the countdown, the data gates and the dashboard cannot
 * disagree about what state the event is in. The timer here drives the clock
 * and nothing else.
 */
const props = defineProps<{
    election: ElectionSummary
    phase: DashboardPhase
}>()

const isCountdown = computed(() => props.phase === 'countdown')
const canShowColour = computed(() => !isCountdown.value)

const remainingTime = ref('--h --m --s')
let timer: ReturnType<typeof setInterval> | null = null

function tick() {
    const closesAt = props.election.polls_close
    if (!closesAt) {
        remainingTime.value = 'Polls closed.'
        return
    }

    const secs = Math.floor((new Date(closesAt).getTime() - Date.now()) / 1000)
    if (secs <= 0) {
        remainingTime.value = 'Polls closed.'
        return
    }

    const days = Math.floor(secs / 86400)
    const hours = Math.floor((secs % 86400) / 3600)
    const minutes = Math.floor((secs % 3600) / 60)
    const seconds = secs % 60

    if (secs >= 216000) {
        remainingTime.value = `${days}d ${hours}h ${minutes}m ${seconds}s`
    } else if (secs >= 3600) {
        remainingTime.value = `${Math.floor(secs / 3600)}h ${minutes}m ${seconds}s`
    } else if (secs >= 60) {
        remainingTime.value = `${minutes}m ${seconds}s`
    } else {
        remainingTime.value = `${seconds}s`
    }
}

onMounted(() => {
    tick()
    timer = setInterval(tick, 1000)
})

onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    timer = null
})

const waitingMessage = computed(() => {
    switch (props.phase) {
        case 'awaiting-refdata':
            return 'The Electoral Commission has not published candidate and party details yet. '
                + 'This page will update on its own.'
        case 'awaiting-results':
            return 'Counting has begun. The first results will appear here as they are released.'
        default:
            return 'Loading the data this page needs.'
    }
})

const activityLabel = computed(() =>
    props.phase === 'awaiting-results'
        ? 'Connected, waiting for the first results'
        : 'Connected to the results feed')

const blobClassBlue = computed(() => ({
    'bg-theme1': !canShowColour.value, 'bg-blue-400': canShowColour.value,
}))
const blobClassRed = computed(() => ({
    'bg-theme1': !canShowColour.value, 'bg-red-400': canShowColour.value,
}))
const blobClassPink = computed(() => ({
    'bg-theme1': !canShowColour.value, 'bg-pink-400': canShowColour.value,
}))
const blobClassGreen = computed(() => ({
    'bg-theme1': !canShowColour.value, 'bg-green-400': canShowColour.value,
}))

function formatDateTime(date: string | null) {
    if (!date) return 'an unannounced time'
    const d = new Date(date)
    let hours = d.getHours()
    const minutes = d.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12
    const day = d.getDate()
    const month = d.toLocaleString('en-NZ', { month: 'long' })
    const year = d.getFullYear()
    return `${hours}.${minutes} ${ampm} on ${day} ${month} ${year}`
}
</script>
