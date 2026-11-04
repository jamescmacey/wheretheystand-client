<script setup lang="ts">
/**
 * Lifts the InstantSearch result set out of its slot and into the page.
 *
 * `<ais-state-results>` renders nothing at all until a search has come back,
 * so anything placed inside it -- including the empty states and the error
 * state -- is missing on first paint and missing for good if the first request
 * fails. The list and the map also need the same hits, and mounting two
 * `ais-state-results` widgets to get them twice is worse.
 *
 * So this sits in the slot, renders nothing, and hands the state upwards. The
 * page then owns it and can render the whole layout unconditionally.
 */

export interface SearchStatePayload {
    hits: Array<Record<string, unknown>>
    nbHits: number
    query: string
    status: string
    error: unknown
}

const props = defineProps<{
    results: { hits?: Array<Record<string, unknown>>, nbHits?: number, query?: string } | null
    status: string
    error: unknown
}>()

const emit = defineEmits<{ change: [SearchStatePayload] }>()

/**
 * What the page actually cares about, as a primitive.
 *
 * The widget rebuilds its slot payload on every render, so `results` is a new
 * object each time even when the search has not changed. Watching it by
 * identity meant emitting on every render, which set a ref in the page, which
 * re-rendered the slot, which emitted again -- a render loop that locks the
 * tab up. Watching a string breaks it.
 */
const signature = computed(() => JSON.stringify({
    nbHits: props.results?.nbHits ?? 0,
    query: props.results?.query ?? '',
    status: props.status,
    error: props.error ? String(props.error) : null,
    ids: (props.results?.hits ?? []).map(hit => hit.objectID),
}))

watch(
    signature,
    () => {
        emit('change', {
            hits: props.results?.hits ?? [],
            nbHits: props.results?.nbHits ?? 0,
            query: props.results?.query ?? '',
            status: props.status,
            error: props.error,
        })
    },
    // `post` so the page's ref is set after this render rather than during it.
    { immediate: true, flush: 'post' },
)
</script>

<template>
    <!-- Headless on purpose; the slot it sits in must render something. -->
    <span class="hidden" aria-hidden="true" />
</template>
