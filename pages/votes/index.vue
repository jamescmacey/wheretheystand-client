<template>
    <div>
        <PageHeader pageTitle="Votes"></PageHeader>
        <UContainer class="my-8">
            <div class="prose prose-neutral dark:prose-invert max-w-none mb-8 space-y-4 text-default">
                <h2 class="text-xl font-semibold text-highlighted not-prose">Parliament must vote on a bills at least
                    three times before it becomes law.</h2>
                <p class="text-sm leading-relaxed">
                    A <NuxtLink to="/bills">bill</NuxtLink> must have three "readings" in the House of Representatives
                    before enactment. These are called the first reading, second reading, and third reading. Each
                    reading is voted on and succeeds if more members of Parliament vote in favour than against.
                </p>
                <div>


                    <p class="text-sm leading-relaxed">There are four types of vote:</p>
                    <ul class="text-sm list-disc ml-4">
                        <li><span class="font-semibold">Voice votes</span> are the simplest type of vote. Members of
                            Parliament shout "aye" or "no" and the Speaker makes an assesssment based on how loud each
                            side
                            is. Any member can then call for a more formal vote.</li>
                        <li><span class="font-semibold">Party votes</span> are the most common type of recorded vote.
                            Each
                            party has a number of seats in the House and casts that number of votes (minus any absences)
                            according to its party policy.</li>
                        <li><span class="font-semibold">Personal votes</span> are also called <span
                                class="font-semibold">conscience votes</span>. Each member of Parliament decides how to
                            vote
                            on the bill, independent of any party policy.</li>
                        <li><span class="font-semibold">Split party votes</span> are similar to a party vote, except one
                            or
                            more parties may treat the vote as a personal vote while other parties may treat it as a
                            party
                            vote. If a party splits its party vote across more than one position (yes, no or abstain) it
                            must give notice of which members' votes are being allocated to each position.</li>
                    </ul>
                </div>
                <p class="text-sm leading-relaxed">
                    Other votes may take place during the Committee of the Whole House stage. These votes are on
                    individual amendments to a bill. WhereTheyStand does not currently record these votes.
                </p>
                <p class="text-sm leading-relaxed">
                    If a bill passes all three readings it is given Royal Assent by the Governor-General. It then
                    becomes law, although most bills specify in more detail when its provisions come into effect.
                </p>
            </div>

            <UCard variant="soft">
                <h3 class="text-lg font-semibold">Find a vote</h3>
                <p class="text-sm leading-relaxed mb-4">
                    If you're looking for a specific bill, check the <NuxtLink class="text-primary hover:underline"
                        to="/bills">bills</NuxtLink> page.
                </p>
                <USeparator class="my-4" />
                <UForm class="space-y-4">
                    <UFormField label="Date range" description="Show votes from this date range.">
                        <div class="flex items-center gap-2">
                            <UPopover :content="{ align: 'center' }">
                                <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
                                    {{ label }}
                                </UButton>

                                <template #content>
                                    <div class="flex items-stretch divide-x divide-(--ui-border)">
                                        <div class="hidden sm:flex flex-col justify-center py-2">
                                            <UButton v-for="(range, index) in ranges" :key="index" :label="range.label"
                                                color="neutral" variant="ghost" class="rounded-none px-4"
                                                :class="[isRangeSelected(range) ? 'bg-elevated' : 'hover:bg-elevated/50']"
                                                truncate @click="selectRange(range)" />
                                        </div>

                                        <UCalendar v-model="modelValue" class="p-2"
                                            :number-of-months="isDesktop ? 2 : 1" range />
                                    </div>
                                </template>
                            </UPopover>
                            <UButton color="neutral" v-if="modelValue.start" variant="ghost" icon="i-lucide-x" @click="clearDateRange">
                                Clear
                            </UButton>
                        </div>
                    </UFormField>
                    <UFormField label="Vote type" description="The type of vote to search for.">
                        <USelect v-model="voteType" :items="voteTypeOptions" />
                    </UFormField>
                    <UFormField label="Vote result" description="The result of the vote to search for.">
                        <USelect v-model="voteResult" :items="voteResultOptions" />
                    </UFormField>
                    <UButton type="submit">Search</UButton>
                </UForm>


            </UCard>


        </UContainer>
    </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { DateFormatter, getLocalTimeZone, today, CalendarDate } from '@internationalized/date'

const df = new DateFormatter('en-NZ', { dateStyle: 'long' })
const tz = getLocalTimeZone()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('sm')

const ranges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 14 days', days: 14 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', months: 3 },
    { label: 'Last 6 months', months: 6 },
    { label: 'Last year', years: 1 }
]

const initialEnd = today(tz)
const modelValue = shallowRef({
    start: null as CalendarDate | null,
    end: null as CalendarDate | null
})

function clearDateRange() {
    modelValue.value = {
        start: null,
        end: null,
    }
}

const label = computed(() => {
    const { start, end } = modelValue.value
    if (!start) return 'Pick a date'
    if (!end) return df.format(start.toDate(tz))
    return `${df.format(start.toDate(tz))} — ${df.format(end.toDate(tz))}`
})

function computeStart(range: typeof ranges[number]) {
    const end = today(tz)
    return { start: end.subtract({ days: range.days, months: range.months, years: range.years }), end }
}

function isRangeSelected(range: typeof ranges[number]) {
    if (!modelValue.value?.start || !modelValue.value?.end) return false
    const { start, end } = computeStart(range)
    return modelValue.value.start.compare(start) === 0 && modelValue.value.end.compare(end) === 0
}

function selectRange(range: typeof ranges[number]) {
    modelValue.value = computeStart(range)
}

const voteType = ref<string | null>(null)
const voteResult = ref<string | null>(null)

const voteTypeOptions = [
    { label: 'Voice vote', value: 'voice' },
    { label: 'Party vote', value: 'party' },
    { label: 'Personal vote', value: 'personal' },
    { label: 'Split party vote', value: 'split_party' },
]

const voteResultOptions = [
    { label: 'Any', value: 'any' },
    { label: 'Succeeded', value: 'succeeded' },
    { label: 'Failed', value: 'failed' },
]
</script>