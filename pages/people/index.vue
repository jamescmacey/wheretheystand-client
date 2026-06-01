<template>
    <div>
        <PageHeader page-title="People" :page-subtitle="pageSubtitle">
        </PageHeader>
        <UContainer class="my-8">
            <div v-if="status === 'success' && paginatedResponse">
                <div class="flex flex-col sm:flex-row sm:items-end gap-4 my-4">
                    <UFormField label="Members as at" class="w-full sm:w-auto shrink-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <UPopover v-model:open="datePickerOpen" :content="{ align: 'start', side: 'bottom', sideOffset: 8 }">
                                <UButton
                                    color="neutral"
                                    variant="outline"
                                    size="md"
                                    icon="i-lucide-calendar-days"
                                    trailing-icon="i-lucide-chevron-down"
                                    class="justify-between gap-2"
                                >
                                    {{ asAtLabel }}
                                </UButton>
                                <template #content>
                                    <UCalendar
                                        v-model="asAtCalendar"
                                        class="p-2"
                                        :min-value="minDate"
                                        :max-value="maxDate"
                                    />
                                </template>
                            </UPopover>
                            <UButton
                                v-if="!isTodaySelected"
                                color="neutral"
                                variant="subtle"
                                size="sm"
                                @click="goToToday"
                            >
                                Today
                            </UButton>
                        </div>
                    </UFormField>
                    <UFormField class="w-full min-w-0 flex-1 sm:min-w-[10rem]">
                        <UInput v-model="search" placeholder="Search by name" size="md" icon="i-lucide-search"
                            class="w-full" />
                    </UFormField>
                </div>

                <p class="text-muted text-sm mb-3">
                    Showing {{ filteredMps.length }} members of Parliament<span v-if="asAtLabel"> on {{
                        asAtLabel }}</span>.
                </p>

                <!-- Sentinel: when this leaves the viewport from the top, the sticky letter bar is "stuck" -->
                <div
                    ref="letterSentinelRef"
                    class="h-px w-full pointer-events-none shrink-0"
                    aria-hidden="true"
                />
                <div
                    class="sticky z-40 -mx-4 px-4 pt-2 pb-0 mb-6 bg-default/95 backdrop-blur supports-[backdrop-filter]:bg-default/80 top-(--ui-header-height)"
                >
                    <div
                        class="flex flex-wrap gap-1 justify-center sm:justify-start pb-2"
                        role="navigation"
                        aria-label="Jump to surname initial"
                    >
                        <UButton v-for="ch in latinLetters" :key="ch" :disabled="!letterCounts[ch]"
                            variant="ghost" color="neutral" size="xs"
                            class="min-w-8 w-8 h-8 shrink-0 p-0 flex items-center justify-center text-center font-semibold text-highlighted"
                            :aria-label="letterCounts[ch] ? `Jump to surnames starting with ${ch}` : `No surnames starting with ${ch}`"
                            @click="letterCounts[ch] && scrollToLetter(ch)">
                            {{ ch }}
                        </UButton>
                        <UButton v-if="letterCounts['#']" key="hash" variant="ghost" color="neutral" size="xs"
                            class="min-w-8 w-8 h-8 shrink-0 p-0 flex items-center justify-center text-center font-semibold text-highlighted"
                            aria-label="Jump to other surnames"
                            @click="scrollToLetter('#')">
                            #
                        </UButton>
                    </div>
                    <div
                        class="border-b border-default transition-[margin,width] duration-300 ease-out"
                        :class="
                            isLetterBarStuck
                                ? 'w-screen ml-[calc(50%-50vw)] max-w-none'
                                : 'w-full ml-0'
                        "
                        aria-hidden="true"
                    />
                </div>

                <div v-if="groupedSections.length === 0" class="text-muted py-8">
                    No members match your search.
                </div>

                <div v-for="section in groupedSections" :key="section.letter" class="mb-10">
                    <h3 :id="letterSectionId(section.letter)"
                        class="text-lg font-semibold mb-3 scroll-mt-[calc(var(--ui-header-height)+5.5rem)] border-b border-default pb-1">
                        {{ section.letter === '#' ? 'Other' : section.letter }}
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <WContentItemCard
                            v-for="mp in section.people"
                            :key="mp.id"
                            :item="{ colour: mp.party_affiliation?.party?.colour }"
                            :to="'/people/' + mp.slug"
                        >
                            <template #title>
                                <div class="flex items-center gap-3">
                                    <img
                                        :src="profileImageSrc(mp)"
                                        :alt="mp.display_name"
                                        class="w-10 h-10 rounded-full object-cover shrink-0 ring ring-default"
                                    >
                                    <div class="min-w-0">
                                        <p class="font-medium text-highlighted truncate">{{ mp.display_name }}</p>
                                        <p v-if="cardDescription(mp)" class="text-sm text-muted truncate">
                                            {{ cardDescription(mp) }}
                                        </p>
                                        <p v-else class="text-sm text-muted">Member of Parliament</p>
                                    </div>
                                </div>
                            </template>
                        </WContentItemCard>
                    </div>
                </div>
            </div>
            <div v-else-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading members…</h3>
                    <UProgress animation="swing" />
                </div>
            </div>
            <UEmpty v-else :title="'Error loading members'"
                :description="'An error occurred while loading members of Parliament. Please try again.'">
                <template #actions>
                    <UButton variant="subtle" color="neutral" class="mt-4" icon="i-lucide-refresh-cw" trailing
                        @click="refresh()">
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
import {
    CalendarDate,
    getLocalTimeZone,
    isEqualDay,
    parseDate,
    today,
} from '@internationalized/date'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()
const router = useRouter()

function formatLocalDate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** Earliest selectable date (inclusive). */
const minDate = new CalendarDate(2020, 1, 1)

function clampYmd(ymd: string): string {
    const minStr = minDate.toString()
    const maxStr = today(getLocalTimeZone()).toString()
    if (ymd < minStr) return minStr
    if (ymd > maxStr) return maxStr
    return ymd
}

const latinLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') as string[]

const effectiveAsAt = computed(() => {
    const q = route.query.as_at
    const raw =
        typeof q === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : formatLocalDate(new Date())
    return clampYmd(raw)
})

const maxDate = computed(() => today(getLocalTimeZone()))
const todayYmd = computed(() => maxDate.value.toString())

const isTodaySelected = computed(
    () => effectiveAsAt.value === todayYmd.value,
)

const datePickerOpen = ref(false)

function goToToday() {
    const nextQuery = { ...route.query } as Record<string, string>
    delete nextQuery.as_at
    router.replace({ query: nextQuery })
    datePickerOpen.value = false
}

function queryWithOptionalAsAt(ymd: string): Record<string, string> {
    const next = { ...route.query } as Record<string, string>
    if (ymd === todayYmd.value) {
        delete next.as_at
    } else {
        next.as_at = ymd
    }
    return next
}

if (import.meta.client) {
    watch(
        () => route.query.as_at,
        (q) => {
            if (typeof q !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(q)) return
            const clamped = clampYmd(q)
            const nextQuery = queryWithOptionalAsAt(clamped)
            if (q !== clamped || (clamped === todayYmd.value && route.query.as_at !== undefined)) {
                router.replace({ query: nextQuery })
            }
        },
        { immediate: true },
    )
}

const asAtLabel = computed(() => {
    const s = effectiveAsAt.value
    if (!s) return ''
    const [y, m, d] = s.split('-').map(Number)
    if (!y || !m || !d) return s
    try {
        return new Date(y, m - 1, d).toLocaleDateString('en-NZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    } catch {
        return s
    }
})

const pageSubtitle = computed(() =>
    asAtLabel.value ? `Members of Parliament as at ${asAtLabel.value}` : 'Members of Parliament',
)

const asAtCalendar = shallowRef<CalendarDate>(parseDate(effectiveAsAt.value))

watch(
    effectiveAsAt,
    (s) => {
        const next = parseDate(s)
        if (!isEqualDay(asAtCalendar.value, next)) {
            asAtCalendar.value = next
        }
    },
    { flush: 'sync' },
)

watch(asAtCalendar, (cd) => {
    const ymd = cd.toString()
    if (ymd !== effectiveAsAt.value && import.meta.client) {
        router.replace({ query: queryWithOptionalAsAt(ymd) })
    }
})

onMounted(() => {
    if (route.query.as_at !== undefined && effectiveAsAt.value === todayYmd.value) {
        router.replace({ query: queryWithOptionalAsAt(effectiveAsAt.value) })
    }
})

type MpRow = {
    id: string
    slug: string
    display_name: string
    first_name: string
    last_name: string
    photo?: { file?: string | null } | null
    parliamentary_affiliation?: { electorate?: { name?: string | null } | null } | null
    party_affiliation?: {
        party?: { display_name?: string | null; name?: string | null; colour?: string | null } | null
    } | null
}

type PaginatedResponse = {
    count: number
    next: string | null
    previous: string | null
    results: MpRow[]
}

const mpListKey = computed(() => `mp-members-${effectiveAsAt.value}`)

const { data: paginatedResponse, status, error, refresh } = await useAsyncData<PaginatedResponse>(
    mpListKey,
    () =>
        $fetch<PaginatedResponse>(
            `${apiBase}members-of-parliament/?page_size=200&as_at=${encodeURIComponent(effectiveAsAt.value)}`,
        ),
    { watch: [effectiveAsAt], lazy: true },
)

const mps = computed(() => paginatedResponse.value?.results ?? [])

const search = ref('')

function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
}

const filteredMps = computed(() => {
    const q = normalizeSearchText(search.value.trim())
    const list = mps.value
    if (!q) return list
    return list.filter(
        (mp) =>
            (mp.display_name && normalizeSearchText(mp.display_name).includes(q)) ||
            (mp.last_name && normalizeSearchText(mp.last_name).includes(q)) ||
            (mp.first_name && normalizeSearchText(mp.first_name).includes(q)),
    )
})

function surnameLetter(lastName: string): string {
    if (!lastName?.length) return '#'
    const stripped = lastName
        .charAt(0)
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
    const u = stripped.toUpperCase()
    if (u >= 'A' && u <= 'Z') return u
    return '#'
}

const groupedSections = computed(() => {
    const map = new Map<string, MpRow[]>()
    for (const mp of filteredMps.value) {
        const letter = surnameLetter(mp.last_name || '')
        if (!map.has(letter)) map.set(letter, [])
        map.get(letter)!.push(mp)
    }
    for (const arr of map.values()) {
        arr.sort(
            (a, b) =>
                (a.last_name || '').localeCompare(b.last_name || '', 'en-NZ') ||
                (a.first_name || '').localeCompare(b.first_name || '', 'en-NZ'),
        )
    }
    const keys = [...map.keys()].sort((a, b) => {
        if (a === '#') return 1
        if (b === '#') return -1
        return a.localeCompare(b)
    })
    return keys.map((letter) => ({ letter, people: map.get(letter)! }))
})

const letterCounts = computed(() => {
    const counts: Record<string, number> = {}
    for (const ch of latinLetters) counts[ch] = 0
    counts['#'] = 0
    for (const mp of filteredMps.value) {
        const L = surnameLetter(mp.last_name || '')
        counts[L] = (counts[L] || 0) + 1
    }
    return counts
})

function letterSectionId(letter: string): string {
    return letter === '#' ? 'letter-hash' : `letter-${letter}`
}

function scrollToLetter(letter: string): void {
    if (import.meta.server) return
    const el = document.getElementById(letterSectionId(letter))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function cardDescription(mp: MpRow): string {
    const party = mp.party_affiliation?.party?.display_name || mp.party_affiliation?.party?.name
    const electorate = mp.parliamentary_affiliation
        ? (mp.parliamentary_affiliation.electorate?.name || 'List')
        : null
    const parts: string[] = []
    if (party) parts.push(party)
    if (electorate) parts.push(electorate)
    return parts.join(' · ')
}

function profileImageSrc(mp: MpRow): string {
    return mp.photo?.file || '/images/generic-profile-picture.png'
}

const letterSentinelRef = ref<HTMLElement | null>(null)
const isLetterBarStuck = ref(false)

let letterBarObserver: IntersectionObserver | null = null

function attachLetterBarObserver() {
    if (!import.meta.client) return
    letterBarObserver?.disconnect()
    letterBarObserver = null
    nextTick(() => {
        const el = letterSentinelRef.value
        if (!el) return
        letterBarObserver = new IntersectionObserver(
            ([entry]) => {
                if (!entry) return
                if (entry.isIntersecting) {
                    isLetterBarStuck.value = false
                } else {
                    isLetterBarStuck.value = entry.boundingClientRect.top < 0
                }
            },
            { threshold: [0, 1] },
        )
        letterBarObserver.observe(el)
    })
}

watch(
    () => status.value === 'success' && paginatedResponse.value,
    (ready) => {
        if (ready) attachLetterBarObserver()
        else {
            letterBarObserver?.disconnect()
            letterBarObserver = null
            isLetterBarStuck.value = false
        }
    },
    { immediate: true },
)

onUnmounted(() => {
    letterBarObserver?.disconnect()
})

</script>
